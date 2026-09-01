import { randomInt, randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify';
import cookie from '@fastify/cookie';
import helmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import { and, desc, eq, gt, ilike, isNull, or, sql } from 'drizzle-orm';
import { createClient } from 'redis';
import { z } from 'zod';
import { Secret, TOTP } from 'otpauth';
import { loadConfig, type AppConfig } from '@novin/config';
import { acceptOfferSchema, bankTransferSchema, billingSchema, complaintSchema, offerSchema, onboardingSchema, refundSchema, requestSchema, sendOtpSchema, verifyOtpSchema } from '@novin/contracts';
import { attachments, auditLogs, bankTransfers, caseStudies, clients, complaints, consentLogs, contentEntries, contentRevisions, createDatabase, errorEvents, legalDocuments, memberships, mfaFactors, notifications, notificationTemplates, offerVersions, offers, orders, organizations, otpChallenges, payments, refundRecords, requestAssignments, requests, screenings, sessions, teamMembers, users } from '@novin/db';
import { audit } from './lib/audit.js';
import { savePrivateUpload } from './lib/files.js';
import { calculateTotals } from './lib/money.js';
import { paymentAdapter } from './lib/payment.js';
import { can, type Permission } from './lib/rbac.js';
import { deliverEmail, deliverSms } from './lib/providers.js';
import { decryptAtRest, encryptAtRest, hashIp, offerTokenHash, opaqueToken, publicReference, safeEqual, secretHash } from './lib/security.js';
import { assertTransition } from './lib/transitions.js';

declare module 'fastify' {
  interface FastifyRequest { correlationId: string; auth?: { id: string; role: 'CUSTOMER' | 'EXPERT' | 'OPERATIONS' | 'FINANCE' | 'CONTENT' | 'SUPERADMIN'; mobile: string; authLevel: number } }
}

type Options = { config?: AppConfig };

const customerFields = { id: users.id, firstName: users.firstName, lastName: users.lastName, email: users.email, emailVerifiedAt: users.emailVerifiedAt, jobTitle: users.jobTitle, mobile: users.mobile };

export async function createApp(options: Options = {}): Promise<FastifyInstance> {
  const config = options.config ?? loadConfig();
  const { db, pool } = createDatabase(config.DATABASE_URL);
  const redis = createClient({ url: config.REDIS_URL });
  const paymentsAdapter = paymentAdapter(config);
  const app = Fastify({ logger: { level: config.APP_ENV === 'production' ? 'info' : 'debug', redact: ['req.headers.cookie', 'req.headers.authorization', 'req.body.code', 'req.body.description'] }, trustProxy: config.TRUSTED_PROXY_COUNT > 0 });
  await redis.connect();
  await mkdir(join(process.cwd(), 'var/logs'), { recursive: true, mode: 0o700 });
  await app.register(cookie);
  await app.register(helmet, { contentSecurityPolicy: { directives: { defaultSrc: ["'self'"], imgSrc: ["'self'", 'data:'], styleSrc: ["'self'", "'unsafe-inline'"], scriptSrc: ["'self'"], frameAncestors: ["'none'"] } } });
  await app.register(rateLimit, { global: false, keyGenerator: (request) => request.ip });
  await app.register(multipart, { limits: { fileSize: config.UPLOAD_MAX_BYTES, files: 1 }, throwFileSizeLimit: true });

  app.addHook('onRequest', async (request, reply) => {
    request.correlationId = randomUUID();
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
      const origin = request.headers.origin;
      if (origin && origin !== config.PUBLIC_BASE_URL) return reply.code(403).send({ error: 'درخواست از مبدأ مجاز نیست.' });
    }
  });
  app.addHook('onRequest', async (request) => {
    const token = request.cookies.novin_session;
    if (!token) return;
    const tokenHash = secretHash(token, config.SESSION_SECRET);
    const result = await db.select({ session: sessions, user: users }).from(sessions).innerJoin(users, eq(sessions.userId, users.id)).where(and(eq(sessions.tokenHash, tokenHash), isNull(sessions.revokedAt), gt(sessions.expiresAt, new Date()), eq(users.active, true))).limit(1);
    const current = result[0];
    if (!current) return;
    request.auth = { id: current.user.id, role: current.user.role, mobile: current.user.mobile, authLevel: current.session.authLevel };
  });
  app.addHook('onClose', async () => { await redis.quit(); await pool.end(); });
  app.setErrorHandler(async (error, request, reply) => {
    request.log.error({ err: error, correlationId: request.correlationId }, 'request failed');
    const message = error instanceof Error ? error.message : 'خطای غیرمنتظره';
    await db.insert(errorEvents).values({ level: 'error', message: message.slice(0, 2_000), correlationId: request.correlationId, route: request.routeOptions.url }).catch(() => undefined);
    const status = typeof error === 'object' && error && 'statusCode' in error && typeof error.statusCode === 'number' ? error.statusCode : 400;
    return reply.code(status >= 500 ? 500 : status).send({ error: status >= 500 ? 'خطای غیرمنتظره رخ داد. دوباره تلاش کنید.' : message, correlationId: request.correlationId });
  });

  function requireAuth(request: FastifyRequest) {
    if (!request.auth) throw Object.assign(new Error('ورود لازم است.'), { statusCode: 401 });
    return request.auth;
  }
  function requirePermission(request: FastifyRequest, permission: Permission) {
    const auth = requireAuth(request);
    if (!can(auth.role, permission)) throw Object.assign(new Error('دسترسی کافی نیست.'), { statusCode: 403 });
    return auth;
  }
  function requireRecentMfa(request: FastifyRequest) {
    const auth = requireAuth(request);
    if (auth.role === 'SUPERADMIN' && auth.authLevel < 2) throw Object.assign(new Error('برای این عملیات تأیید دومرحله‌ای لازم است.'), { statusCode: 401 });
    return auth;
  }
  async function notify(channel: 'SMS' | 'EMAIL', event: string, destination: string, body: string, relatedId?: string) {
    const template = await db.query.notificationTemplates.findFirst({ where: and(eq(notificationTemplates.event, event), eq(notificationTemplates.channel, channel), eq(notificationTemplates.active, true)), orderBy: [desc(notificationTemplates.version)] });
    const renderedBody = template ? template.body.replaceAll('{{message}}', body) : body;
    const [row] = await db.insert(notifications).values({ event, channel, destination, body: renderedBody, relatedEntity: relatedId ? 'domain' : undefined, relatedId }).returning();
    try {
      const delivery = channel === 'SMS' ? await deliverSms(config, destination, renderedBody) : await deliverEmail(config, destination, 'نوین ایرانیان', renderedBody);
      await db.update(notifications).set({ status: delivery.status, providerReference: delivery.providerReference, attempts: 1, sentAt: new Date() }).where(eq(notifications.id, row!.id));
    } catch (error) {
      await db.update(notifications).set({ status: 'FAILED', attempts: 1, lastError: error instanceof Error ? error.message.slice(0, 500) : 'delivery failure' }).where(eq(notifications.id, row!.id));
    }
  }
  async function sessionFor(userId: string, authLevel = 1) {
    const token = opaqueToken();
    await db.insert(sessions).values({ userId, tokenHash: secretHash(token, config.SESSION_SECRET), authLevel, expiresAt: new Date(Date.now() + config.SESSION_TTL_SECONDS * 1000) });
    return token;
  }
  function setSession(reply: FastifyReply, token: string) {
    reply.setCookie('novin_session', token, { httpOnly: true, secure: config.APP_ENV === 'production', sameSite: 'lax', path: '/', maxAge: config.SESSION_TTL_SECONDS });
  }

  app.get('/health/live', async () => ({ status: 'ok' }));
  app.get('/health/ready', async () => { await pool.query('SELECT 1'); await redis.ping(); return { status: 'ready' }; });
  app.get('/health', async () => ({ status: 'ok' }));
  app.get('/api/v1/openapi.json', async () => ({ openapi: '3.1.0', info: { title: 'Novin API', version: '0.1.0' }, paths: { '/api/v1/auth/otp': { post: { summary: 'Issue OTP' } }, '/api/v1/requests': { post: { summary: 'Submit customer request' } } } }));

  app.post('/api/v1/auth/otp', { config: { rateLimit: { max: 5, timeWindow: '10 minutes' } } }, async (request) => {
    const input = sendOtpSchema.parse(request.body);
    for (const key of [`otp:ip:${hashIp(request.ip, config.SESSION_SECRET)}`, `otp:mobile:${secretHash(input.mobile, config.SESSION_SECRET)}`]) {
      const count = await redis.incr(key); if (count === 1) await redis.expire(key, 600); if (count > 5) throw Object.assign(new Error('تعداد درخواست بیش از حد مجاز است. کمی بعد دوباره تلاش کنید.'), { statusCode: 429 });
    }
    const resendKey = `otp:resend:${input.mobile}`;
    if (await redis.get(resendKey)) return { accepted: true, retryAfterSeconds: config.OTP_RESEND_SECONDS };
    const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
    await db.insert(otpChallenges).values({ mobile: input.mobile, codeHash: secretHash(`${input.mobile}:${code}`, config.SESSION_SECRET), expiresAt: new Date(Date.now() + config.OTP_TTL_SECONDS * 1000), ipHash: hashIp(request.ip, config.SESSION_SECRET) });
    await redis.set(resendKey, '1', { EX: config.OTP_RESEND_SECONDS });
    if (config.APP_ENV !== 'production') await notify('SMS', 'OTP', input.mobile, `محیط آزمایشی نوین: رمز یک‌بارمصرف ${code} تا دو دقیقه معتبر است.`);
    return { accepted: true, retryAfterSeconds: config.OTP_RESEND_SECONDS };
  });

  app.post('/api/v1/auth/verify', { config: { rateLimit: { max: 10, timeWindow: '10 minutes' } } }, async (request, reply) => {
    const input = verifyOtpSchema.parse(request.body);
    const challenge = await db.query.otpChallenges.findFirst({ where: and(eq(otpChallenges.mobile, input.mobile), isNull(otpChallenges.consumedAt), gt(otpChallenges.expiresAt, new Date())), orderBy: [desc(otpChallenges.createdAt)] });
    if (!challenge || challenge.attempts >= config.OTP_MAX_ATTEMPTS || !safeEqual(challenge.codeHash, secretHash(`${input.mobile}:${input.code}`, config.SESSION_SECRET))) {
      if (challenge) await db.update(otpChallenges).set({ attempts: sql`${otpChallenges.attempts} + 1` }).where(eq(otpChallenges.id, challenge.id));
      throw Object.assign(new Error('رمز یک‌بارمصرف نامعتبر یا منقضی است.'), { statusCode: 401 });
    }
    await db.transaction(async (tx) => {
      await tx.update(otpChallenges).set({ consumedAt: new Date() }).where(eq(otpChallenges.id, challenge.id));
    });
    let user = await db.query.users.findFirst({ where: eq(users.mobile, input.mobile) });
    if (!user) [user] = await db.insert(users).values({ mobile: input.mobile }).returning();
    const token = await sessionFor(user!.id);
    setSession(reply, token);
    await audit(db, { actorId: user!.id, actorRole: user!.role, action: 'AUTH_OTP_VERIFIED', entity: 'user', entityId: user!.id, correlationId: request.correlationId, ipHash: hashIp(request.ip, config.SESSION_SECRET) });
    return { authenticated: true, onboardingRequired: !user!.firstName };
  });

  app.post('/api/v1/auth/logout', async (request, reply) => {
    const token = request.cookies.novin_session;
    if (token) await db.update(sessions).set({ revokedAt: new Date() }).where(eq(sessions.tokenHash, secretHash(token, config.SESSION_SECRET)));
    reply.clearCookie('novin_session', { path: '/' });
    return { ok: true };
  });

  app.post('/api/v1/admin/mfa/enroll', async (request) => {
    const auth = requireAuth(request);
    if (auth.role !== 'SUPERADMIN') throw Object.assign(new Error('فقط سوپرادمین می‌تواند MFA را راه‌اندازی کند.'), { statusCode: 403 });
    const secret = new Secret({ size: 20 }).base32;
    const totp = new TOTP({ issuer: 'نوین ایرانیان', label: auth.mobile, algorithm: 'SHA1', digits: 6, period: 30, secret });
    const recoveryCodes = Array.from({ length: 8 }, () => opaqueToken(6));
    await db.insert(mfaFactors).values({ userId: auth.id, secretEncrypted: encryptAtRest(secret, config.SESSION_SECRET), recoveryCodeHashes: recoveryCodes.map((code) => secretHash(code, config.SESSION_SECRET)) });
    return { otpauthUri: totp.toString(), recoveryCodes };
  });

  app.post('/api/v1/admin/mfa/verify', async (request, reply) => {
    const auth = requireAuth(request); const input = z.object({ code: z.string().regex(/^\d{6}$/) }).parse(request.body);
    const factor = await db.query.mfaFactors.findFirst({ where: and(eq(mfaFactors.userId, auth.id), isNull(mfaFactors.revokedAt)), orderBy: [desc(mfaFactors.createdAt)] });
    if (!factor) throw Object.assign(new Error('MFA راه‌اندازی نشده است.'), { statusCode: 422 });
    const totp = new TOTP({ issuer: 'نوین ایرانیان', label: auth.mobile, algorithm: 'SHA1', digits: 6, period: 30, secret: decryptAtRest(factor.secretEncrypted, config.SESSION_SECRET) });
    if (totp.validate({ token: input.code, window: 1 }) === null) throw Object.assign(new Error('کد MFA نامعتبر است.'), { statusCode: 401 });
    await db.update(users).set({ mfaEnrolledAt: new Date() }).where(eq(users.id, auth.id));
    const token = await sessionFor(auth.id, 2); setSession(reply, token);
    const previous = request.cookies.novin_session;
    if (previous) await db.update(sessions).set({ revokedAt: new Date() }).where(eq(sessions.tokenHash, secretHash(previous, config.SESSION_SECRET)));
    await audit(db, { actorId: auth.id, actorRole: auth.role, action: 'MFA_VERIFIED', entity: 'user', entityId: auth.id, correlationId: request.correlationId, ipHash: hashIp(request.ip, config.SESSION_SECRET) });
    return { ok: true };
  });

  app.post('/api/v1/account/onboarding', async (request) => {
    const auth = requireAuth(request);
    const input = onboardingSchema.parse(request.body);
    const [organization] = await db.insert(organizations).values({ displayName: input.organizationName, type: input.organizationType }).returning();
    await db.transaction(async (tx) => {
      await tx.update(users).set({ firstName: input.firstName, lastName: input.lastName, email: input.email, jobTitle: input.jobTitle, updatedAt: new Date() }).where(eq(users.id, auth.id));
      await tx.insert(memberships).values({ userId: auth.id, organizationId: organization!.id, representationConfirmedAt: new Date() });
      await tx.insert(consentLogs).values({ userId: auth.id, documentKind: 'privacy', documentVersion: input.privacyVersion, ipHash: hashIp(request.ip, config.SESSION_SECRET) });
    });
    await audit(db, { actorId: auth.id, actorRole: auth.role, action: 'ONBOARDING_COMPLETED', entity: 'organization', entityId: organization!.id, correlationId: request.correlationId, ipHash: hashIp(request.ip, config.SESSION_SECRET) });
    return { ok: true };
  });

  app.get('/api/v1/account', async (request) => {
    const auth = requireAuth(request);
    const profile = await db.select(customerFields).from(users).where(eq(users.id, auth.id)).limit(1);
    const own = await db.select({ reference: requests.reference, title: requests.title, submittedAt: requests.submittedAt }).from(requests).where(eq(requests.createdByUserId, auth.id)).orderBy(desc(requests.submittedAt));
    return { profile: profile[0], requests: own };
  });

  app.patch('/api/v1/account', async (request) => {
    const auth = requireAuth(request);
    const input = onboardingSchema.partial().omit({ organizationName: true, organizationType: true, representationConfirmed: true, privacyVersion: true }).parse(request.body);
    await db.update(users).set({ ...input, updatedAt: new Date() }).where(eq(users.id, auth.id));
    return { ok: true };
  });

  app.post('/api/v1/account/mobile-change/request', async (request) => {
    const auth = requireAuth(request); const input = z.object({ mobile: sendOtpSchema.shape.mobile }).parse(request.body);
    if (input.mobile === auth.mobile) return { accepted: true };
    const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
    await redis.set(`mobile-change:${auth.id}`, secretHash(`${input.mobile}:${code}`, config.SESSION_SECRET), { EX: config.OTP_TTL_SECONDS });
    if (config.APP_ENV !== 'production') await notify('SMS', 'MOBILE_CHANGE', input.mobile, `محیط آزمایشی نوین: رمز تأیید تغییر همراه ${code}`);
    return { accepted: true };
  });
  app.post('/api/v1/account/mobile-change/verify', async (request, reply) => {
    const auth = requireAuth(request); const input = z.object({ mobile: sendOtpSchema.shape.mobile, code: z.string().regex(/^\d{6}$/) }).parse(request.body);
    const key = `mobile-change:${auth.id}`; const saved = await redis.get(key);
    if (!saved || !safeEqual(saved, secretHash(`${input.mobile}:${input.code}`, config.SESSION_SECRET))) throw Object.assign(new Error('رمز تأیید نامعتبر است.'), { statusCode: 401 });
    await db.transaction(async (tx) => { await tx.update(users).set({ mobile: input.mobile, updatedAt: new Date() }).where(eq(users.id, auth.id)); await tx.update(sessions).set({ revokedAt: new Date() }).where(eq(sessions.userId, auth.id)); });
    await redis.del(key); const token = await sessionFor(auth.id); setSession(reply, token);
    await audit(db, { actorId: auth.id, actorRole: auth.role, action: 'MOBILE_CHANGED', entity: 'user', entityId: auth.id, correlationId: request.correlationId, ipHash: hashIp(request.ip, config.SESSION_SECRET) }); return { ok: true };
  });
  app.post('/api/v1/account/email-verification/request', async (request) => {
    const auth = requireAuth(request); const person = await db.query.users.findFirst({ where: eq(users.id, auth.id) }); if (!person?.email) throw Object.assign(new Error('ابتدا ایمیل را در پروفایل ثبت کنید.'), { statusCode: 422 });
    const token = opaqueToken(); await redis.set(`email-verify:${auth.id}`, secretHash(token, config.SESSION_SECRET), { EX: 3600 }); await notify('EMAIL', 'EMAIL_VERIFICATION', person.email, `کد تأیید ایمیل شما: ${token}`, auth.id); return { accepted: true };
  });
  app.post('/api/v1/account/email-verification/confirm', async (request) => {
    const auth = requireAuth(request); const input = z.object({ token: z.string().min(20).max(100) }).parse(request.body); const saved = await redis.get(`email-verify:${auth.id}`);
    if (!saved || !safeEqual(saved, secretHash(input.token, config.SESSION_SECRET))) throw Object.assign(new Error('کد تأیید ایمیل نامعتبر است.'), { statusCode: 401 });
    await db.update(users).set({ emailVerifiedAt: new Date(), updatedAt: new Date() }).where(eq(users.id, auth.id)); await redis.del(`email-verify:${auth.id}`); return { ok: true };
  });

  app.post('/api/v1/requests', async (request) => {
    const auth = requireAuth(request);
    const input = requestSchema.parse(request.body);
    const membership = await db.query.memberships.findFirst({ where: and(eq(memberships.userId, auth.id), eq(memberships.active, true)) });
    if (!membership) throw Object.assign(new Error('ابتدا اطلاعات سازمان را تکمیل کنید.'), { statusCode: 422 });
    const duplicate = await db.query.requests.findFirst({ where: and(eq(requests.createdByUserId, auth.id), eq(requests.idempotencyKey, input.idempotencyKey)) });
    if (duplicate) return { reference: duplicate.reference, duplicate: true };
    const [created] = await db.transaction(async (tx) => {
      const result = await tx.insert(requests).values({ reference: publicReference('REQ'), organizationId: membership.organizationId, createdByUserId: auth.id, title: input.title, description: input.description, source: input.source, idempotencyKey: input.idempotencyKey, privacyVersion: input.privacyVersion }).returning();
      await tx.insert(consentLogs).values({ userId: auth.id, documentKind: 'privacy', documentVersion: input.privacyVersion, ipHash: hashIp(request.ip, config.SESSION_SECRET) });
      return result;
    });
    const person = await db.query.users.findFirst({ where: eq(users.id, auth.id) });
    await notify('SMS', 'REQUEST_SUBMITTED', auth.mobile, `درخواست شما با شماره ${created!.reference} ثبت شد. بررسی اولیه رایگان است.`, created!.id);
    if (person?.email) await notify('EMAIL', 'REQUEST_SUBMITTED', person.email, `درخواست شما با شماره ${created!.reference} ثبت شد.`, created!.id);
    await audit(db, { actorId: auth.id, actorRole: auth.role, action: 'REQUEST_SUBMITTED', entity: 'request', entityId: created!.id, correlationId: request.correlationId, ipHash: hashIp(request.ip, config.SESSION_SECRET) });
    return { reference: created!.reference, id: created!.id, duplicate: false };
  });

  app.post('/api/v1/requests/:id/attachment', async (request) => {
    const auth = requireAuth(request);
    const requestId = (request.params as { id: string }).id;
    const own = await db.query.requests.findFirst({ where: and(eq(requests.id, requestId), eq(requests.createdByUserId, auth.id)) });
    if (!own) throw Object.assign(new Error('درخواست یافت نشد.'), { statusCode: 404 });
    const accepted = request.headers['x-confidentiality-accepted'] === 'true';
    if (!accepted) throw Object.assign(new Error('پذیرش هشدار محرمانگی الزامی است.'), { statusCode: 422 });
    const file = await request.file();
    if (!file) throw Object.assign(new Error('فایلی ارسال نشده است.'), { statusCode: 422 });
    const saved = await savePrivateUpload(file, config);
    await db.insert(attachments).values({ requestId, ...saved, status: 'CLEAN', expiresAt: new Date(Date.now() + 180 * 24 * 3600 * 1000) });
    return { ok: true };
  });
  app.get('/api/v1/admin/attachments/:id/download', async (request, reply) => {
    requirePermission(request, 'requests:read'); const attachment = await db.query.attachments.findFirst({ where: eq(attachments.id, (request.params as { id: string }).id) });
    if (!attachment || attachment.status !== 'CLEAN') throw Object.assign(new Error('فایل قابل دریافت نیست.'), { statusCode: 404 });
    reply.header('content-type', attachment.detectedMime ?? 'application/octet-stream').header('x-content-type-options', 'nosniff').header('content-disposition', `attachment; filename="${attachment.storageName}"`).header('cache-control', 'private, no-store');
    return reply.send(createReadStream(join(process.cwd(), 'var/uploads/clean', attachment.storageName)));
  });

  app.get('/api/v1/admin/requests', async (request) => {
    requirePermission(request, 'requests:read');
    const query = (request.query as { q?: string; state?: string }).q?.trim();
    const state = (request.query as { q?: string; state?: string }).state;
    const conditions = [state ? eq(requests.state, state as never) : undefined, query ? or(ilike(requests.reference, `%${query}%`), ilike(requests.title, `%${query}%`), ilike(organizations.displayName, `%${query}%`), ilike(organizations.nationalId, `%${query}%`), ilike(users.mobile, `%${query}%`)) : undefined].filter(Boolean) as ReturnType<typeof eq>[];
    return db.select({ id: requests.id, reference: requests.reference, title: requests.title, state: requests.state, version: requests.version, submittedAt: requests.submittedAt, organization: organizations.displayName, mobile: users.mobile }).from(requests).innerJoin(organizations, eq(requests.organizationId, organizations.id)).innerJoin(users, eq(requests.createdByUserId, users.id)).where(conditions.length ? and(...conditions) : undefined).orderBy(desc(requests.submittedAt));
  });
  app.post('/api/v1/admin/requests/:id/assign', async (request) => {
    const auth = requirePermission(request, 'requests:assign'); const input = z.object({ assigneeId: z.string().uuid() }).parse(request.body); const requestId = (request.params as { id: string }).id;
    const assignee = await db.query.users.findFirst({ where: and(eq(users.id, input.assigneeId), eq(users.active, true)) });
    if (!assignee || !['EXPERT', 'OPERATIONS'].includes(assignee.role)) throw Object.assign(new Error('کارشناس فعال معتبر نیست.'), { statusCode: 422 });
    await db.transaction(async (tx) => { await tx.update(requestAssignments).set({ revokedAt: new Date() }).where(and(eq(requestAssignments.requestId, requestId), isNull(requestAssignments.revokedAt))); await tx.insert(requestAssignments).values({ requestId, assigneeId: assignee.id, assignedById: auth.id }); });
    await audit(db, { actorId: auth.id, actorRole: auth.role, action: 'REQUEST_ASSIGNED', entity: 'request', entityId: requestId, after: { assigneeId: assignee.id }, correlationId: request.correlationId, ipHash: hashIp(request.ip, config.SESSION_SECRET) }); return { ok: true };
  });
  app.get('/api/v1/admin/requests.csv', async (request, reply) => {
    requirePermission(request, 'requests:export'); const data = await db.select({ reference: requests.reference, title: requests.title, organization: organizations.displayName, state: requests.state, submittedAt: requests.submittedAt }).from(requests).innerJoin(organizations, eq(requests.organizationId, organizations.id)).orderBy(desc(requests.submittedAt));
    const quote = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`; const output = ['reference,title,organization,state,submitted_at', ...data.map((row) => [row.reference, row.title, row.organization, row.state, row.submittedAt.toISOString()].map(quote).join(','))].join('\n');
    reply.header('content-type', 'text/csv; charset=utf-8').header('content-disposition', 'attachment; filename="requests.csv"'); return `\uFEFF${output}`;
  });

  app.post('/api/v1/admin/requests/:id/transition', async (request) => {
    const auth = requirePermission(request, 'requests:screen');
    const input = z.object({ state: z.enum(['SUBMITTED', 'UNDER_REVIEW', 'CONTACT_PENDING', 'NEED_MORE_INFO', 'QUALIFIED', 'REJECTED', 'OFFER_SENT', 'PAID', 'SESSION_SCHEDULED', 'SESSION_COMPLETED', 'PROJECT_PROPOSED', 'ARCHIVED']), expectedVersion: z.number().int().nonnegative(), outcome: z.string().trim().min(3).max(32).optional(), note: z.string().trim().min(3).max(4_000), contactedAt: z.string().datetime().optional() }).parse(request.body);
    const requestId = (request.params as { id: string }).id;
    const current = await db.query.requests.findFirst({ where: eq(requests.id, requestId) });
    if (!current || current.version !== input.expectedVersion) throw Object.assign(new Error('درخواست تغییر کرده یا یافت نشد.'), { statusCode: 409 });
    assertTransition(current.state, input.state);
    await db.transaction(async (tx) => {
      await tx.insert(screenings).values({ requestId, actorId: auth.id, outcome: input.outcome ?? input.state, note: input.note, contactedAt: input.contactedAt ? new Date(input.contactedAt) : undefined });
      await tx.update(requests).set({ state: input.state, version: sql`${requests.version} + 1`, updatedAt: new Date() }).where(and(eq(requests.id, requestId), eq(requests.version, input.expectedVersion)));
    });
    await audit(db, { actorId: auth.id, actorRole: auth.role, action: 'REQUEST_TRANSITION', entity: 'request', entityId: requestId, before: { state: current.state }, after: { state: input.state }, correlationId: request.correlationId, ipHash: hashIp(request.ip, config.SESSION_SECRET) });
    return { ok: true };
  });

  app.post('/api/v1/admin/requests/:id/offers', async (request) => {
    const auth = requirePermission(request, 'offers:manage');
    const input = offerSchema.parse(request.body);
    const requestId = (request.params as { id: string }).id;
    const linked = await db.query.requests.findFirst({ where: eq(requests.id, requestId) });
    if (!linked || linked.state !== 'QUALIFIED') throw Object.assign(new Error('فقط درخواست واجد امکان همکاری می‌تواند پیشنهاد دریافت کند.'), { statusCode: 422 });
    const token = opaqueToken(32);
    const totals = calculateTotals(input.baseAmountIrr, input.taxRateBps);
    const [offer] = await db.transaction(async (tx) => {
      const created = await tx.insert(offers).values({ requestId, tokenHash: offerTokenHash(token), validUntil: new Date(input.validUntil), createdById: auth.id, state: 'SENT' }).returning();
      await tx.insert(offerVersions).values({ offerId: created[0]!.id, version: 1, title: input.title, description: input.description, scope: input.scope, deliverable: input.deliverable, durationMinutes: input.durationMinutes, timing: input.timing, expertMix: input.expertMix, termsVersion: input.termsVersion, cancellationVersion: input.cancellationVersion, feeDeductionTerms: input.feeDeductionTerms, ...totals, createdById: auth.id });
      await tx.update(requests).set({ state: 'OFFER_SENT', version: sql`${requests.version} + 1`, updatedAt: new Date() }).where(eq(requests.id, requestId));
      return created;
    });
    const recipient = await db.select({ mobile: users.mobile, email: users.email }).from(users).where(eq(users.id, linked.createdByUserId)).limit(1);
    const link = `${config.PUBLIC_BASE_URL}/offer/${token}`;
    await notify('SMS', 'OFFER_SENT', recipient[0]!.mobile, `پیشنهاد اختصاصی شما تا تاریخ مشخص‌شده معتبر است: ${link}`, offer!.id);
    if (recipient[0]!.email) await notify('EMAIL', 'OFFER_SENT', recipient[0]!.email!, `پیشنهاد اختصاصی: ${link}`, offer!.id);
    await audit(db, { actorId: auth.id, actorRole: auth.role, action: 'OFFER_CREATED', entity: 'offer', entityId: offer!.id, after: totals, correlationId: request.correlationId, ipHash: hashIp(request.ip, config.SESSION_SECRET) });
    return { token, offerId: offer!.id };
  });

  app.get('/api/v1/offers/:token', async (request) => {
    const token = (request.params as { token: string }).token;
    const offer = await db.query.offers.findFirst({ where: eq(offers.tokenHash, offerTokenHash(token)) });
    if (!offer || offer.state === 'REVOKED') return { status: 'EXPIRED' as const };
    if (offer.validUntil <= new Date()) { await db.update(offers).set({ state: 'EXPIRED', updatedAt: new Date() }).where(eq(offers.id, offer.id)); return { status: 'EXPIRED' as const }; }
    const version = await db.query.offerVersions.findFirst({ where: and(eq(offerVersions.offerId, offer.id), eq(offerVersions.version, offer.currentVersion)) });
    if (offer.state === 'SENT') await db.update(offers).set({ state: 'VIEWED', viewedAt: new Date() }).where(eq(offers.id, offer.id));
    const order = await db.query.orders.findFirst({ where: eq(orders.offerId, offer.id) });
    return { status: offer.state, validUntil: offer.validUntil, paymentProvider: config.PAYMENT_PROVIDER, offer: version, order: order ? { reference: order.reference, state: order.state, totalAmountIrr: order.totalAmountIrr } : undefined };
  });

  app.post('/api/v1/offers/:token/billing', async (request) => {
    const input = billingSchema.parse(request.body);
    const offer = await db.query.offers.findFirst({ where: eq(offers.tokenHash, offerTokenHash((request.params as { token: string }).token)) });
    if (!offer || offer.state === 'REVOKED' || offer.validUntil <= new Date()) throw Object.assign(new Error('پیشنهاد منقضی یا باطل شده است.'), { statusCode: 410 });
    const linked = await db.query.requests.findFirst({ where: eq(requests.id, offer.requestId) });
    if (!linked) throw Object.assign(new Error('درخواست مرتبط یافت نشد.'), { statusCode: 404 });
    await db.update(organizations).set({ legalName: input.legalName, nationalId: input.nationalId, billingAddress: input.billingAddress, postalCode: input.postalCode, updatedAt: new Date() }).where(eq(organizations.id, linked.organizationId));
    return { ok: true };
  });

  app.post('/api/v1/offers/:token/accept', async (request) => {
    const input = acceptOfferSchema.parse(request.body);
    const token = (request.params as { token: string }).token;
    const offer = await db.query.offers.findFirst({ where: eq(offers.tokenHash, offerTokenHash(token)) });
    if (!offer || offer.state === 'REVOKED' || offer.validUntil <= new Date()) throw Object.assign(new Error('پیشنهاد منقضی یا باطل شده است.'), { statusCode: 410 });
    const version = await db.query.offerVersions.findFirst({ where: and(eq(offerVersions.offerId, offer.id), eq(offerVersions.version, offer.currentVersion)) });
    const requestRow = await db.query.requests.findFirst({ where: eq(requests.id, offer.requestId) });
    const representative = requestRow ? await db.query.users.findFirst({ where: eq(users.id, requestRow.createdByUserId) }) : undefined;
    const organization = requestRow ? await db.query.organizations.findFirst({ where: eq(organizations.id, requestRow.organizationId) }) : undefined;
    if (!representative?.emailVerifiedAt) throw Object.assign(new Error('پیش از پرداخت، ایمیل نماینده باید تأیید شود.'), { statusCode: 422 });
    if (!organization?.legalName || !organization.nationalId || !organization.billingAddress) throw Object.assign(new Error('اطلاعات حقوقی و صورتحساب سازمان را تکمیل کنید.'), { statusCode: 422 });
    if (input.termsVersion !== version?.termsVersion) throw Object.assign(new Error('نسخه شرایط با پیشنهاد هم‌خوانی ندارد.'), { statusCode: 422 });
    const [order] = await db.transaction(async (tx) => {
      const existing = await tx.select().from(orders).where(eq(orders.offerId, offer.id)).limit(1);
      if (existing[0]) return existing;
      const created = await tx.insert(orders).values({ reference: publicReference('ORD'), offerId: offer.id, offerVersion: offer.currentVersion, state: 'PAYMENT_PENDING', totalAmountIrr: version!.totalAmountIrr }).returning();
      await tx.update(offers).set({ state: 'ACCEPTED' }).where(eq(offers.id, offer.id));
      await tx.insert(consentLogs).values({ userId: requestRow!.createdByUserId, offerId: offer.id, orderId: created[0]!.id, documentKind: 'terms', documentVersion: input.termsVersion, ipHash: hashIp(request.ip, config.SESSION_SECRET) });
      return created;
    });
    return { orderReference: order!.reference };
  });

  app.post('/api/v1/admin/offers/:id/version', async (request) => {
    const auth = requirePermission(request, 'offers:manage');
    const input = offerSchema.parse(request.body);
    const offer = await db.query.offers.findFirst({ where: eq(offers.id, (request.params as { id: string }).id) });
    if (!offer || ['ACCEPTED', 'REVOKED', 'EXPIRED'].includes(offer.state)) throw Object.assign(new Error('این پیشنهاد قابل اصلاح نیست؛ برای سفارش پرداخت‌شده سند جدید صادر کنید.'), { statusCode: 409 });
    const totals = calculateTotals(input.baseAmountIrr, input.taxRateBps);
    const nextVersion = offer.currentVersion + 1;
    await db.transaction(async (tx) => {
      await tx.insert(offerVersions).values({ offerId: offer.id, version: nextVersion, title: input.title, description: input.description, scope: input.scope, deliverable: input.deliverable, durationMinutes: input.durationMinutes, timing: input.timing, expertMix: input.expertMix, termsVersion: input.termsVersion, cancellationVersion: input.cancellationVersion, feeDeductionTerms: input.feeDeductionTerms, ...totals, createdById: auth.id });
      await tx.update(offers).set({ currentVersion: nextVersion, validUntil: new Date(input.validUntil), state: 'SENT', updatedAt: new Date() }).where(eq(offers.id, offer.id));
    });
    await audit(db, { actorId: auth.id, actorRole: auth.role, action: 'OFFER_VERSIONED', entity: 'offer', entityId: offer.id, before: { version: offer.currentVersion }, after: { version: nextVersion, totals }, correlationId: request.correlationId, ipHash: hashIp(request.ip, config.SESSION_SECRET) });
    return { ok: true, version: nextVersion };
  });

  app.post('/api/v1/admin/offers/:id/revoke', async (request) => {
    const auth = requirePermission(request, 'offers:manage');
    const offer = await db.query.offers.findFirst({ where: eq(offers.id, (request.params as { id: string }).id) });
    if (!offer || offer.state === 'ACCEPTED') throw Object.assign(new Error('پیشنهاد قابل ابطال نیست.'), { statusCode: 409 });
    await db.update(offers).set({ state: 'REVOKED', revokedAt: new Date(), updatedAt: new Date() }).where(eq(offers.id, offer.id));
    await audit(db, { actorId: auth.id, actorRole: auth.role, action: 'OFFER_REVOKED', entity: 'offer', entityId: offer.id, correlationId: request.correlationId, ipHash: hashIp(request.ip, config.SESSION_SECRET) });
    return { ok: true };
  });

  app.post('/api/v1/offers/:token/payments/mock', async (request) => {
    if (config.PAYMENT_PROVIDER !== 'mock' || config.APP_ENV === 'production') throw Object.assign(new Error('پرداخت آزمایشی در این محیط فعال نیست.'), { statusCode: 404 });
    const input = z.object({ idempotencyKey: z.string().uuid() }).parse(request.body);
    const offer = await db.query.offers.findFirst({ where: eq(offers.tokenHash, offerTokenHash((request.params as { token: string }).token)) });
    if (!offer || offer.validUntil <= new Date()) throw Object.assign(new Error('پیشنهاد منقضی یا باطل شده است.'), { statusCode: 410 });
    const order = await db.query.orders.findFirst({ where: eq(orders.offerId, offer.id) });
    if (!order || order.state !== 'PAYMENT_PENDING') throw Object.assign(new Error('سفارش در انتظار پرداخت نیست.'), { statusCode: 409 });
    const existing = await db.query.payments.findFirst({ where: and(eq(payments.orderId, order.id), eq(payments.idempotencyKey, input.idempotencyKey)) });
    const payment = existing ?? (await db.insert(payments).values({ orderId: order.id, provider: 'mock', amountIrr: order.totalAmountIrr, idempotencyKey: input.idempotencyKey, state: 'REDIRECTED' }).returning())[0]!;
    if (!payment.providerReference) { const intent = await paymentsAdapter.create({ orderReference: order.reference, amountIrr: order.totalAmountIrr, callbackUrl: `${config.PUBLIC_BASE_URL}/api/v1/payments/mock/${payment.id}/callback` }); await db.update(payments).set({ providerReference: intent.providerReference, updatedAt: new Date() }).where(eq(payments.id, payment.id)); }
    return { paymentId: payment.id, redirectUrl: `${config.PUBLIC_BASE_URL}/pay/${(request.params as { token: string }).token}?payment=${payment.id}` };
  });

  app.post('/api/v1/payments/mock/:id/callback', async (request) => {
    if (config.PAYMENT_PROVIDER !== 'mock' || config.APP_ENV === 'production') throw Object.assign(new Error('درگاه آزمایشی فعال نیست.'), { statusCode: 404 });
    const input = z.object({ outcome: z.enum(['SUCCESS', 'FAILED']) }).parse(request.body);
    const payment = await db.query.payments.findFirst({ where: eq(payments.id, (request.params as { id: string }).id) });
    if (!payment) throw Object.assign(new Error('تراکنش یافت نشد.'), { statusCode: 404 });
    const order = await db.query.orders.findFirst({ where: eq(orders.id, payment.orderId) });
    if (!order || payment.amountIrr !== order.totalAmountIrr || !(await paymentsAdapter.verify({ providerReference: payment.providerReference ?? '', amountIrr: order.totalAmountIrr })).verified) throw Object.assign(new Error('استعلام سمت سرور ناموفق بود.'), { statusCode: 422 });
    if (payment.state === 'VERIFIED') return { status: 'VERIFIED', orderReference: order.reference, duplicate: true };
    if (input.outcome === 'FAILED') { await db.update(payments).set({ state: 'FAILED', updatedAt: new Date() }).where(eq(payments.id, payment.id)); return { status: 'FAILED', orderReference: order.reference }; }
    const updated = await db.transaction(async (tx) => {
      const result = await tx.update(payments).set({ state: 'VERIFIED', verifiedAt: new Date(), updatedAt: new Date() }).where(and(eq(payments.id, payment.id), sql`${payments.state} <> 'VERIFIED'`)).returning();
      if (!result[0]) return false;
      await tx.update(orders).set({ state: 'PAID', collectedAt: new Date(), updatedAt: new Date() }).where(and(eq(orders.id, order.id), eq(orders.state, 'PAYMENT_PENDING')));
      return true;
    });
    const recipient = await db.select({ mobile: users.mobile, email: users.email }).from(users).innerJoin(requests, eq(requests.createdByUserId, users.id)).innerJoin(offers, eq(offers.requestId, requests.id)).where(eq(offers.id, order.offerId)).limit(1);
    if (updated && recipient[0]) { await notify('SMS', 'PAYMENT_SUCCESS', recipient[0].mobile, `پرداخت سفارش ${order.reference} با موفقیت تأیید شد.`, order.id); if (recipient[0].email) await notify('EMAIL', 'PAYMENT_SUCCESS', recipient[0].email, `رسید سفارش ${order.reference}: پرداخت با موفقیت تأیید شد.`, order.id); }
    return { status: 'VERIFIED', orderReference: order.reference, duplicate: !updated };
  });

  app.post('/api/v1/offers/:token/payments/gateway', async (request) => {
    if (config.PAYMENT_PROVIDER !== 'gateway') throw Object.assign(new Error('درگاه انتخاب‌شده فعال نیست.'), { statusCode: 404 });
    const input = z.object({ idempotencyKey: z.string().uuid() }).parse(request.body);
    const offer = await db.query.offers.findFirst({ where: eq(offers.tokenHash, offerTokenHash((request.params as { token: string }).token)) });
    const order = offer ? await db.query.orders.findFirst({ where: eq(orders.offerId, offer.id) }) : undefined;
    if (!offer || !order || order.state !== 'PAYMENT_PENDING' || offer.validUntil <= new Date()) throw Object.assign(new Error('سفارش قابل پرداخت نیست.'), { statusCode: 409 });
    const existing = await db.query.payments.findFirst({ where: and(eq(payments.orderId, order.id), eq(payments.idempotencyKey, input.idempotencyKey)) });
    const payment = existing ?? (await db.insert(payments).values({ orderId: order.id, provider: 'gateway', amountIrr: order.totalAmountIrr, idempotencyKey: input.idempotencyKey, state: 'REDIRECTED' }).returning())[0]!;
    if (payment.providerReference) return { paymentId: payment.id, redirectUrl: `${config.PAYMENT_GATEWAY_BASE_URL}/pay/${encodeURIComponent(payment.providerReference)}` };
    const intent = await paymentsAdapter.create({ orderReference: order.reference, amountIrr: order.totalAmountIrr, callbackUrl: `${config.PUBLIC_BASE_URL}/api/v1/payments/gateway/${payment.id}/callback` });
    await db.update(payments).set({ providerReference: intent.providerReference, updatedAt: new Date() }).where(eq(payments.id, payment.id));
    return { paymentId: payment.id, redirectUrl: intent.redirectUrl };
  });

  app.post('/api/v1/payments/gateway/:id/callback', async (request) => {
    if (config.PAYMENT_PROVIDER !== 'gateway') throw Object.assign(new Error('درگاه انتخاب‌شده فعال نیست.'), { statusCode: 404 });
    const input = z.object({ providerReference: z.string().trim().min(3).max(160), proof: z.string().trim().min(32).max(256) }).parse(request.body);
    const payment = await db.query.payments.findFirst({ where: eq(payments.id, (request.params as { id: string }).id) });
    const order = payment ? await db.query.orders.findFirst({ where: eq(orders.id, payment.orderId) }) : undefined;
    if (!payment || !order || payment.provider !== 'gateway' || payment.providerReference !== input.providerReference) throw Object.assign(new Error('بازگشت درگاه معتبر نیست.'), { statusCode: 400 });
    if (payment.state === 'VERIFIED') return { status: 'VERIFIED', orderReference: order.reference, duplicate: true };
    const verified = await paymentsAdapter.verify({ providerReference: input.providerReference, amountIrr: order.totalAmountIrr, callbackProof: input.proof });
    if (!verified.verified) { await db.update(payments).set({ state: 'FAILED', updatedAt: new Date() }).where(eq(payments.id, payment.id)); return { status: 'FAILED', orderReference: order.reference }; }
    await db.transaction(async (tx) => { await tx.update(payments).set({ state: 'VERIFIED', verifiedAt: new Date(), updatedAt: new Date() }).where(and(eq(payments.id, payment.id), sql`${payments.state} <> 'VERIFIED'`)); await tx.update(orders).set({ state: 'PAID', collectedAt: new Date(), updatedAt: new Date() }).where(and(eq(orders.id, order.id), eq(orders.state, 'PAYMENT_PENDING'))); });
    return { status: 'VERIFIED', orderReference: order.reference, duplicate: false };
  });

  app.get('/api/v1/offers/:token/receipt', async (request) => {
    const offer = await db.query.offers.findFirst({ where: eq(offers.tokenHash, offerTokenHash((request.params as { token: string }).token)) });
    if (!offer) throw Object.assign(new Error('پیشنهاد یافت نشد.'), { statusCode: 404 });
    const order = await db.query.orders.findFirst({ where: eq(orders.offerId, offer.id) });
    if (!order) throw Object.assign(new Error('سفارشی ثبت نشده است.'), { statusCode: 404 });
    const payment = await db.query.payments.findFirst({ where: and(eq(payments.orderId, order.id), eq(payments.state, 'VERIFIED')) });
    return { reference: order.reference, state: order.state, totalAmountIrr: order.totalAmountIrr, collectedAt: order.collectedAt, transactionReference: payment?.providerReference };
  });

  app.post('/api/v1/offers/:token/bank-transfer', async (request) => {
    const input = bankTransferSchema.parse(request.body);
    const offer = await db.query.offers.findFirst({ where: eq(offers.tokenHash, offerTokenHash((request.params as { token: string }).token)) });
    const order = offer ? await db.query.orders.findFirst({ where: eq(orders.offerId, offer.id) }) : undefined;
    if (!offer || !order || order.state !== 'PAYMENT_PENDING' || input.amountIrr !== order.totalAmountIrr) throw Object.assign(new Error('اطلاعات واریز با سفارش هم‌خوانی ندارد.'), { statusCode: 422 });
    const [created] = await db.insert(bankTransfers).values({ orderId: order.id, reference: input.reference, transferredAt: new Date(input.transferredAt), amountIrr: input.amountIrr, bankName: input.bankName, depositorName: input.depositorName, idempotencyKey: input.idempotencyKey, state: 'REVIEW_PENDING' }).onConflictDoNothing().returning();
    const transfer = created ?? await db.query.bankTransfers.findFirst({ where: and(eq(bankTransfers.orderId, order.id), eq(bankTransfers.idempotencyKey, input.idempotencyKey)) });
    return { status: transfer?.state ?? 'REVIEW_PENDING', transferId: transfer?.id };
  });

  app.post('/api/v1/offers/:token/bank-transfers/:id/receipt', async (request) => {
    const offer = await db.query.offers.findFirst({ where: eq(offers.tokenHash, offerTokenHash((request.params as { token: string }).token)) });
    const transfer = await db.query.bankTransfers.findFirst({ where: eq(bankTransfers.id, (request.params as { id: string }).id) });
    const order = transfer ? await db.query.orders.findFirst({ where: eq(orders.id, transfer.orderId) }) : undefined;
    if (!offer || !transfer || !order || order.offerId !== offer.id || transfer.state !== 'REVIEW_PENDING') throw Object.assign(new Error('رسید واریز قابل بارگذاری نیست.'), { statusCode: 404 });
    const file = await request.file();
    if (!file) throw Object.assign(new Error('فایلی ارسال نشده است.'), { statusCode: 422 });
    const saved = await savePrivateUpload(file, config);
    await db.insert(attachments).values({ bankTransferId: transfer.id, ...saved, status: 'CLEAN', expiresAt: new Date(Date.now() + 180 * 24 * 3600 * 1000) });
    return { ok: true };
  });

  app.post('/api/v1/orders/:reference/bank-transfer', async (request) => {
    throw Object.assign(new Error('برای ثبت واریز از لینک اختصاصی پیشنهاد استفاده کنید.'), { statusCode: 410 });
  });

  app.post('/api/v1/admin/bank-transfers/:id/confirm', async (request) => {
    const auth = requirePermission(request, 'payments:review');
    const transfer = await db.query.bankTransfers.findFirst({ where: eq(bankTransfers.id, (request.params as { id: string }).id) });
    if (!transfer || transfer.state !== 'REVIEW_PENDING') throw Object.assign(new Error('واریز قابل تأیید نیست.'), { statusCode: 409 });
    await db.transaction(async (tx) => {
      await tx.update(bankTransfers).set({ state: 'CONFIRMED', reviewedById: auth.id, reviewedAt: new Date() }).where(eq(bankTransfers.id, transfer.id));
      await tx.update(orders).set({ state: 'PAID', collectedAt: new Date(), updatedAt: new Date() }).where(eq(orders.id, transfer.orderId));
    });
    const recipient = await db.select({ mobile: users.mobile, email: users.email, reference: orders.reference }).from(users).innerJoin(requests, eq(requests.createdByUserId, users.id)).innerJoin(offers, eq(offers.requestId, requests.id)).innerJoin(orders, eq(orders.offerId, offers.id)).where(eq(orders.id, transfer.orderId)).limit(1);
    if (recipient[0]) { await notify('SMS', 'BANK_TRANSFER_CONFIRMED', recipient[0].mobile, `واریز سفارش ${recipient[0].reference} تأیید شد.`, transfer.orderId); if (recipient[0].email) await notify('EMAIL', 'BANK_TRANSFER_CONFIRMED', recipient[0].email, `رسید سفارش ${recipient[0].reference}: واریز بانکی تأیید شد.`, transfer.orderId); }
    await audit(db, { actorId: auth.id, actorRole: auth.role, action: 'BANK_TRANSFER_CONFIRMED', entity: 'bank_transfer', entityId: transfer.id, correlationId: request.correlationId, ipHash: hashIp(request.ip, config.SESSION_SECRET) });
    return { ok: true };
  });

  app.post('/api/v1/admin/bank-transfers/:id/reject', async (request) => {
    const auth = requirePermission(request, 'payments:review');
    const input = z.object({ note: z.string().trim().min(3).max(1_000) }).parse(request.body);
    const transfer = await db.query.bankTransfers.findFirst({ where: eq(bankTransfers.id, (request.params as { id: string }).id) });
    if (!transfer || transfer.state !== 'REVIEW_PENDING') throw Object.assign(new Error('واریز قابل رد نیست.'), { statusCode: 409 });
    await db.update(bankTransfers).set({ state: 'REJECTED', reviewedById: auth.id, reviewedAt: new Date(), reviewNote: input.note }).where(eq(bankTransfers.id, transfer.id));
    await audit(db, { actorId: auth.id, actorRole: auth.role, action: 'BANK_TRANSFER_REJECTED', entity: 'bank_transfer', entityId: transfer.id, after: { note: input.note }, correlationId: request.correlationId, ipHash: hashIp(request.ip, config.SESSION_SECRET) });
    return { ok: true };
  });

  app.post('/api/v1/admin/orders/:id/refunds', async (request) => {
    const auth = requirePermission(request, 'payments:refund');
    const input = refundSchema.parse(request.body);
    const order = await db.query.orders.findFirst({ where: eq(orders.id, (request.params as { id: string }).id) });
    if (!order || !['PAID', 'REFUNDED'].includes(order.state)) throw Object.assign(new Error('این سفارش قابل استرداد نیست.'), { statusCode: 409 });
    const previous = await db.select({ amountIrr: refundRecords.amountIrr }).from(refundRecords).where(eq(refundRecords.orderId, order.id));
    const refunded = previous.reduce((sum, record) => sum + record.amountIrr, 0);
    if (refunded + input.amountIrr > order.totalAmountIrr) throw Object.assign(new Error('مبلغ استرداد از مبلغ وصول‌شده بیشتر است.'), { statusCode: 422 });
    const [refund] = await db.transaction(async (tx) => {
      const created = await tx.insert(refundRecords).values({ orderId: order.id, amountIrr: input.amountIrr, reason: input.reason, reference: input.reference, createdById: auth.id }).returning();
      if (refunded + input.amountIrr === order.totalAmountIrr) await tx.update(orders).set({ state: 'REFUNDED', updatedAt: new Date() }).where(eq(orders.id, order.id));
      return created;
    });
    await audit(db, { actorId: auth.id, actorRole: auth.role, action: 'ORDER_REFUNDED', entity: 'order', entityId: order.id, before: { refunded }, after: { amountIrr: input.amountIrr, reference: input.reference }, correlationId: request.correlationId, ipHash: hashIp(request.ip, config.SESSION_SECRET) });
    return { id: refund!.id, totalRefundedIrr: refunded + input.amountIrr };
  });

  app.post('/api/v1/complaints', { config: { rateLimit: { max: 5, timeWindow: '1 hour' } } }, async (request) => {
    const input = complaintSchema.parse(request.body);
    const [complaint] = await db.insert(complaints).values({ reference: publicReference('CMP'), name: input.name, mobile: input.mobile, email: input.email, subject: input.subject, description: input.description, idempotencyKey: input.idempotencyKey }).onConflictDoNothing().returning();
    return { reference: complaint?.reference ?? 'ثبت‌شده' };
  });

  app.get('/api/v1/admin/notification-templates', async (request) => { requirePermission(request, 'settings:manage'); return db.select().from(notificationTemplates).orderBy(notificationTemplates.event, notificationTemplates.channel, desc(notificationTemplates.version)); });
  app.post('/api/v1/admin/notification-templates', async (request) => {
    const auth = requirePermission(request, 'settings:manage');
    const input = z.object({ event: z.string().trim().min(3).max(80), channel: z.enum(['SMS', 'EMAIL']), body: z.string().trim().min(3).max(4_000), active: z.boolean().default(true) }).parse(request.body);
    const latest = await db.query.notificationTemplates.findFirst({ where: and(eq(notificationTemplates.event, input.event), eq(notificationTemplates.channel, input.channel)), orderBy: [desc(notificationTemplates.version)] });
    const [template] = await db.transaction(async (tx) => {
      if (input.active) await tx.update(notificationTemplates).set({ active: false }).where(and(eq(notificationTemplates.event, input.event), eq(notificationTemplates.channel, input.channel), eq(notificationTemplates.active, true)));
      return tx.insert(notificationTemplates).values({ ...input, version: (latest?.version ?? 0) + 1, createdById: auth.id }).returning();
    });
    await audit(db, { actorId: auth.id, actorRole: auth.role, action: 'NOTIFICATION_TEMPLATE_VERSIONED', entity: 'notification_template', entityId: template!.id, after: { event: input.event, channel: input.channel, version: template!.version }, correlationId: request.correlationId, ipHash: hashIp(request.ip, config.SESSION_SECRET) });
    return template;
  });
  app.post('/api/v1/admin/offers/:id/resend', async (request) => {
    const auth = requirePermission(request, 'offers:manage');
    const offer = await db.query.offers.findFirst({ where: eq(offers.id, (request.params as { id: string }).id) });
    if (!offer || ['REVOKED', 'EXPIRED'].includes(offer.state) || offer.validUntil <= new Date()) throw Object.assign(new Error('لینک قابل ارسال مجدد نیست.'), { statusCode: 410 });
    const limitKey = `offer-resend:${offer.id}`; if (await redis.get(limitKey)) throw Object.assign(new Error('ارسال مجدد را کمی بعد تکرار کنید.'), { statusCode: 429 }); await redis.set(limitKey, '1', { EX: 60 });
    const owner = await db.select({ mobile: users.mobile, email: users.email }).from(users).innerJoin(requests, eq(requests.createdByUserId, users.id)).where(eq(requests.id, offer.requestId)).limit(1);
    // The raw link token is never stored, so resend rotates it instead of recovering a secret from storage.
    const replacement = opaqueToken(32);
    await db.update(offers).set({ tokenHash: offerTokenHash(replacement), updatedAt: new Date() }).where(eq(offers.id, offer.id));
    const replacementLink = `${config.PUBLIC_BASE_URL}/offer/${replacement}`;
    if (owner[0]) { await notify('SMS', 'OFFER_RESENT', owner[0].mobile, `لینک جدید پیشنهاد اختصاصی: ${replacementLink}`, offer.id); if (owner[0].email) await notify('EMAIL', 'OFFER_RESENT', owner[0].email, `لینک جدید پیشنهاد اختصاصی: ${replacementLink}`, offer.id); }
    await audit(db, { actorId: auth.id, actorRole: auth.role, action: 'OFFER_LINK_ROTATED', entity: 'offer', entityId: offer.id, before: { tokenRotated: true }, correlationId: request.correlationId, ipHash: hashIp(request.ip, config.SESSION_SECRET) });
    return { ok: true };
  });
  app.post('/api/v1/admin/notifications/:id/retry', async (request) => {
    requirePermission(request, 'settings:manage'); const notification = await db.query.notifications.findFirst({ where: eq(notifications.id, (request.params as { id: string }).id) });
    if (!notification || notification.status === 'SENT') throw Object.assign(new Error('اعلان قابل ارسال مجدد نیست.'), { statusCode: 409 });
    await notify(notification.channel, notification.event, notification.destination, notification.body, notification.relatedId ?? undefined);
    return { accepted: true };
  });

  app.get('/api/v1/admin/content', async (request) => { requirePermission(request, 'content:manage'); return db.select().from(contentEntries).orderBy(desc(contentEntries.updatedAt)); });
  app.put('/api/v1/admin/content/:slug', async (request) => {
    const auth = requirePermission(request, 'content:manage');
    const body = request.body as { title: string; body: Record<string, unknown>; state: 'DRAFT' | 'PUBLISHED'; isPlaceholder?: boolean };
    const [row] = await db.insert(contentEntries).values({ slug: (request.params as { slug: string }).slug, title: body.title, body: body.body, state: body.state, isPlaceholder: Boolean(body.isPlaceholder), createdById: auth.id, publishedAt: body.state === 'PUBLISHED' ? new Date() : undefined }).onConflictDoUpdate({ target: contentEntries.slug, set: { title: body.title, body: body.body, state: body.state, isPlaceholder: Boolean(body.isPlaceholder), version: sql`${contentEntries.version} + 1`, updatedAt: new Date() } }).returning();
    await db.insert(contentRevisions).values({ contentEntryId: row!.id, version: row!.version, title: row!.title, body: row!.body, state: row!.state, createdById: auth.id });
    await audit(db, { actorId: auth.id, actorRole: auth.role, action: 'CONTENT_UPSERTED', entity: 'content', entityId: row!.id, correlationId: request.correlationId, ipHash: hashIp(request.ip, config.SESSION_SECRET) });
    return row;
  });
  app.get('/api/v1/content/:slug', async (request) => {
    const row = await db.query.contentEntries.findFirst({ where: and(eq(contentEntries.slug, (request.params as { slug: string }).slug), eq(contentEntries.state, 'PUBLISHED'), eq(contentEntries.isPlaceholder, false)) });
    if (!row) throw Object.assign(new Error('محتوای منتشرشده یافت نشد.'), { statusCode: 404 });
    return row;
  });
  app.get('/api/v1/admin/clients', async (request) => { requirePermission(request, 'content:manage'); return db.select().from(clients).orderBy(clients.displayOrder); });
  app.post('/api/v1/admin/clients', async (request) => {
    const auth = requirePermission(request, 'content:manage'); const input = request.body as { name: string; logoAlt: string; logoUrl?: string; displayOrder?: number; approvedForPublication?: boolean; isSynthetic?: boolean };
    const [row] = await db.insert(clients).values({ ...input, displayOrder: input.displayOrder ?? 0, approvedForPublication: Boolean(input.approvedForPublication), isSynthetic: Boolean(input.isSynthetic) }).returning();
    await audit(db, { actorId: auth.id, actorRole: auth.role, action: 'CLIENT_CREATED', entity: 'client', entityId: row!.id, correlationId: request.correlationId, ipHash: hashIp(request.ip, config.SESSION_SECRET) }); return row;
  });
  app.get('/api/v1/admin/case-studies', async (request) => { requirePermission(request, 'content:manage'); return db.select().from(caseStudies).orderBy(desc(caseStudies.updatedAt)); });
  app.post('/api/v1/admin/case-studies', async (request) => {
    const auth = requirePermission(request, 'content:manage'); const input = request.body as { slug: string; title: string; problem: string; action: string; result: string; clientId?: string; state?: 'DRAFT' | 'PUBLISHED'; approvedForPublication?: boolean; isSynthetic?: boolean };
    const [row] = await db.insert(caseStudies).values({ ...input, state: input.state ?? 'DRAFT', approvedForPublication: Boolean(input.approvedForPublication), isSynthetic: Boolean(input.isSynthetic) }).returning();
    await audit(db, { actorId: auth.id, actorRole: auth.role, action: 'CASE_STUDY_CREATED', entity: 'case_study', entityId: row!.id, correlationId: request.correlationId, ipHash: hashIp(request.ip, config.SESSION_SECRET) }); return row;
  });
  app.get('/api/v1/admin/team', async (request) => { requirePermission(request, 'content:manage'); return db.select().from(teamMembers).orderBy(desc(teamMembers.updatedAt)); });
  app.post('/api/v1/admin/team', async (request) => {
    const auth = requirePermission(request, 'content:manage'); const input = request.body as { name: string; role: string; expertise: string; biography: string; imageUrl?: string; state?: 'DRAFT' | 'PUBLISHED'; approvedForPublication?: boolean; isSynthetic?: boolean };
    const [row] = await db.insert(teamMembers).values({ ...input, state: input.state ?? 'DRAFT', approvedForPublication: Boolean(input.approvedForPublication), isSynthetic: Boolean(input.isSynthetic) }).returning();
    await audit(db, { actorId: auth.id, actorRole: auth.role, action: 'TEAM_MEMBER_CREATED', entity: 'team_member', entityId: row!.id, correlationId: request.correlationId, ipHash: hashIp(request.ip, config.SESSION_SECRET) }); return row;
  });
  app.get('/api/v1/legal/:kind', async (request) => {
    const row = await db.query.legalDocuments.findFirst({ where: eq(legalDocuments.kind, (request.params as { kind: string }).kind), orderBy: [desc(legalDocuments.createdAt)] });
    if (!row) throw Object.assign(new Error('سند حقوقی یافت نشد.'), { statusCode: 404 }); return row;
  });
  app.put('/api/v1/admin/legal/:kind', async (request) => {
    const auth = requirePermission(request, 'content:manage'); const input = request.body as { version: string; body: string; effectiveAt?: string; isDraft: boolean };
    const [row] = await db.insert(legalDocuments).values({ kind: (request.params as { kind: string }).kind, version: input.version, body: input.body, effectiveAt: input.effectiveAt ? new Date(input.effectiveAt) : undefined, isDraft: input.isDraft, approvedAt: input.isDraft ? undefined : new Date(), approvedById: input.isDraft ? undefined : auth.id }).returning();
    await audit(db, { actorId: auth.id, actorRole: auth.role, action: 'LEGAL_DOCUMENT_VERSIONED', entity: 'legal_document', entityId: row!.id, correlationId: request.correlationId, ipHash: hashIp(request.ip, config.SESSION_SECRET) }); return row;
  });

  app.get('/api/v1/admin/audit', async (request) => { requirePermission(request, 'audit:read'); return db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(200); });
  app.get('/api/v1/admin/errors', async (request) => { requirePermission(request, 'errors:read'); return db.select().from(errorEvents).orderBy(desc(errorEvents.createdAt)).limit(200); });
  app.get('/api/v1/admin/staff', async (request) => { requireRecentMfa(request); requirePermission(request, 'staff:manage'); return db.select({ id: users.id, mobile: users.mobile, firstName: users.firstName, lastName: users.lastName, role: users.role, active: users.active, mfaEnrolledAt: users.mfaEnrolledAt }).from(users).where(sql`${users.role} <> 'CUSTOMER'`).orderBy(users.role); });
  app.patch('/api/v1/admin/staff/:id', async (request) => {
    const auth = requireRecentMfa(request); requirePermission(request, 'staff:manage'); const input = z.object({ role: z.enum(['EXPERT', 'OPERATIONS', 'FINANCE', 'CONTENT', 'SUPERADMIN']).optional(), active: z.boolean().optional() }).refine((value) => value.role !== undefined || value.active !== undefined).parse(request.body); const userId = (request.params as { id: string }).id;
    const before = await db.query.users.findFirst({ where: eq(users.id, userId) }); if (!before) throw Object.assign(new Error('کاربر داخلی یافت نشد.'), { statusCode: 404 });
    await db.transaction(async (tx) => { await tx.update(users).set({ ...input, updatedAt: new Date() }).where(eq(users.id, userId)); if (input.active === false || input.role) await tx.update(sessions).set({ revokedAt: new Date() }).where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt))); });
    await audit(db, { actorId: auth.id, actorRole: auth.role, action: 'STAFF_ACCESS_CHANGED', entity: 'user', entityId: userId, before: { role: before.role, active: before.active }, after: input, correlationId: request.correlationId, ipHash: hashIp(request.ip, config.SESSION_SECRET) }); return { ok: true };
  });
  return app;
}
