import { randomInt, randomUUID } from 'node:crypto';
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
import { loadConfig, type AppConfig } from '@novin/config';
import { acceptOfferSchema, bankTransferSchema, complaintSchema, offerSchema, onboardingSchema, requestSchema, screeningSchema, sendOtpSchema, verifyOtpSchema } from '@novin/contracts';
import { attachments, auditLogs, bankTransfers, caseStudies, clients, complaints, consentLogs, contentEntries, contentRevisions, createDatabase, errorEvents, legalDocuments, memberships, notifications, offerVersions, offers, orders, organizations, otpChallenges, payments, requests, screenings, sessions, teamMembers, users } from '@novin/db';
import { audit } from './lib/audit.js';
import { savePrivateUpload } from './lib/files.js';
import { calculateTotals } from './lib/money.js';
import { can, type Permission } from './lib/rbac.js';
import { deliverEmail, deliverSms } from './lib/providers.js';
import { hashIp, offerTokenHash, opaqueToken, publicReference, safeEqual, secretHash } from './lib/security.js';
import { assertTransition } from './lib/transitions.js';

declare module 'fastify' {
  interface FastifyRequest { correlationId: string; auth?: { id: string; role: 'CUSTOMER' | 'EXPERT' | 'OPERATIONS' | 'FINANCE' | 'CONTENT' | 'SUPERADMIN'; mobile: string; authLevel: number } }
}

type Options = { config?: AppConfig };

const customerFields = { id: users.id, firstName: users.firstName, lastName: users.lastName, email: users.email, jobTitle: users.jobTitle, mobile: users.mobile };

export async function createApp(options: Options = {}): Promise<FastifyInstance> {
  const config = options.config ?? loadConfig();
  const { db, pool } = createDatabase(config.DATABASE_URL);
  const redis = createClient({ url: config.REDIS_URL });
  const app = Fastify({ logger: { level: config.APP_ENV === 'production' ? 'info' : 'debug', redact: ['req.headers.cookie', 'req.headers.authorization', 'req.body.code', 'req.body.description'] }, trustProxy: config.TRUSTED_PROXY_COUNT > 0 });
  await redis.connect();
  await mkdir(join(process.cwd(), 'var/logs'), { recursive: true, mode: 0o700 });
  await app.register(cookie);
  await app.register(helmet, { contentSecurityPolicy: { directives: { defaultSrc: ["'self'"], imgSrc: ["'self'", 'data:'], styleSrc: ["'self'", "'unsafe-inline'"], scriptSrc: ["'self'"], frameAncestors: ["'none'"] } } });
  await app.register(rateLimit, { global: false, redis, keyGenerator: (request) => request.ip });
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
  async function notify(channel: 'SMS' | 'EMAIL', event: string, destination: string, body: string, relatedId?: string) {
    const [row] = await db.insert(notifications).values({ event, channel, destination, body, relatedEntity: relatedId ? 'domain' : undefined, relatedId }).returning();
    try {
      const delivery = channel === 'SMS' ? await deliverSms(config, destination, body) : await deliverEmail(config, destination, 'نوین ایرانیان', body);
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

  app.get('/api/v1/admin/requests', async (request) => {
    requirePermission(request, 'requests:read');
    const query = (request.query as { q?: string; state?: string }).q?.trim();
    const state = (request.query as { q?: string; state?: string }).state;
    const conditions = [state ? eq(requests.state, state as never) : undefined, query ? or(ilike(requests.reference, `%${query}%`), ilike(requests.title, `%${query}%`)) : undefined].filter(Boolean) as ReturnType<typeof eq>[];
    return db.select({ id: requests.id, reference: requests.reference, title: requests.title, state: requests.state, submittedAt: requests.submittedAt, organization: organizations.displayName }).from(requests).innerJoin(organizations, eq(requests.organizationId, organizations.id)).where(conditions.length ? and(...conditions) : undefined).orderBy(desc(requests.submittedAt));
  });

  app.post('/api/v1/admin/requests/:id/transition', async (request) => {
    const auth = requirePermission(request, 'requests:screen');
    const input = screeningSchema.extend({ state: z.enum(['SUBMITTED', 'UNDER_REVIEW', 'CONTACT_PENDING', 'NEED_MORE_INFO', 'QUALIFIED', 'REJECTED', 'OFFER_SENT', 'PAID', 'SESSION_SCHEDULED', 'SESSION_COMPLETED', 'PROJECT_PROPOSED', 'ARCHIVED']) }).parse(request.body);
    const requestId = (request.params as { id: string }).id;
    const current = await db.query.requests.findFirst({ where: eq(requests.id, requestId) });
    if (!current || current.version !== input.expectedVersion) throw Object.assign(new Error('درخواست تغییر کرده یا یافت نشد.'), { statusCode: 409 });
    assertTransition(current.state, input.state);
    await db.transaction(async (tx) => {
      await tx.insert(screenings).values({ requestId, actorId: auth.id, outcome: input.outcome, note: input.note, contactedAt: input.contactedAt ? new Date(input.contactedAt) : undefined });
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
    if (!offer || offer.state === 'REVOKED' || offer.validUntil <= new Date()) return { status: 'EXPIRED' as const };
    const version = await db.query.offerVersions.findFirst({ where: and(eq(offerVersions.offerId, offer.id), eq(offerVersions.version, offer.currentVersion)) });
    if (offer.state === 'SENT') await db.update(offers).set({ state: 'VIEWED', viewedAt: new Date() }).where(eq(offers.id, offer.id));
    return { status: offer.state, validUntil: offer.validUntil, offer: version };
  });

  app.post('/api/v1/offers/:token/accept', async (request) => {
    const input = acceptOfferSchema.parse(request.body);
    const token = (request.params as { token: string }).token;
    const offer = await db.query.offers.findFirst({ where: eq(offers.tokenHash, offerTokenHash(token)) });
    if (!offer || offer.state === 'REVOKED' || offer.validUntil <= new Date()) throw Object.assign(new Error('پیشنهاد منقضی یا باطل شده است.'), { statusCode: 410 });
    const version = await db.query.offerVersions.findFirst({ where: and(eq(offerVersions.offerId, offer.id), eq(offerVersions.version, offer.currentVersion)) });
    const requestRow = await db.query.requests.findFirst({ where: eq(requests.id, offer.requestId) });
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

  app.post('/api/v1/orders/:reference/bank-transfer', async (request) => {
    const input = bankTransferSchema.parse(request.body);
    const order = await db.query.orders.findFirst({ where: eq(orders.reference, (request.params as { reference: string }).reference) });
    if (!order || order.state !== 'PAYMENT_PENDING' || input.amountIrr !== order.totalAmountIrr) throw Object.assign(new Error('اطلاعات واریز با سفارش هم‌خوانی ندارد.'), { statusCode: 422 });
    await db.insert(bankTransfers).values({ orderId: order.id, reference: input.reference, transferredAt: new Date(input.transferredAt), amountIrr: input.amountIrr, bankName: input.bankName, depositorName: input.depositorName, idempotencyKey: input.idempotencyKey, state: 'REVIEW_PENDING' }).onConflictDoNothing();
    return { status: 'REVIEW_PENDING' };
  });

  app.post('/api/v1/admin/bank-transfers/:id/confirm', async (request) => {
    const auth = requirePermission(request, 'payments:review');
    const transfer = await db.query.bankTransfers.findFirst({ where: eq(bankTransfers.id, (request.params as { id: string }).id) });
    if (!transfer || transfer.state !== 'REVIEW_PENDING') throw Object.assign(new Error('واریز قابل تأیید نیست.'), { statusCode: 409 });
    await db.transaction(async (tx) => {
      await tx.update(bankTransfers).set({ state: 'CONFIRMED', reviewedById: auth.id, reviewedAt: new Date() }).where(eq(bankTransfers.id, transfer.id));
      await tx.update(orders).set({ state: 'PAID', collectedAt: new Date(), updatedAt: new Date() }).where(eq(orders.id, transfer.orderId));
    });
    await audit(db, { actorId: auth.id, actorRole: auth.role, action: 'BANK_TRANSFER_CONFIRMED', entity: 'bank_transfer', entityId: transfer.id, correlationId: request.correlationId, ipHash: hashIp(request.ip, config.SESSION_SECRET) });
    return { ok: true };
  });

  app.post('/api/v1/complaints', { config: { rateLimit: { max: 5, timeWindow: '1 hour' } } }, async (request) => {
    const input = complaintSchema.parse(request.body);
    const [complaint] = await db.insert(complaints).values({ reference: publicReference('CMP'), name: input.name, mobile: input.mobile, email: input.email, subject: input.subject, description: input.description, idempotencyKey: input.idempotencyKey }).onConflictDoNothing().returning();
    return { reference: complaint?.reference ?? 'ثبت‌شده' };
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
  return app;
}
