import { randomInt, randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { createApp } from '../../apps/api/src/app.js';
import { sendOtpSchema } from '../../packages/contracts/src/index.js';
import { auditLogs, createDatabase, memberships, otpChallenges, requests, screenings, users } from '../../packages/db/src/index.js';
import { eq } from '../../apps/api/node_modules/drizzle-orm/index.js';

// Explicit opt-in and an ephemeral named test database. Never target dev/production.
const enabled = process.env.NOVIN_RUN_DATABASE_TESTS === 'true';
describe.skipIf(!enabled)('PostgreSQL + Redis intake acceptance', () => {
  it('consumes OTP once, onboards once, submits once and screens with real constraints', async () => {
    if (process.env.APP_ENV !== 'test' || !process.env.DATABASE_URL?.endsWith('/novin_test')) throw new Error('An isolated novin_test database and APP_ENV=test are required.');
    const app = await createApp();
    const { db, pool } = createDatabase(process.env.DATABASE_URL);
    const mobile = '090' + String(randomInt(0, 100000000)).padStart(8, '0');
    try {
      const exhaustedMobile = '091' + String(randomInt(0, 100000000)).padStart(8, '0');
      const exhaustedIssue = await app.inject({ method: 'POST', url: '/api/v1/auth/otp', payload: { mobile: exhaustedMobile } });
      const exhaustedCapability = exhaustedIssue.cookies.find((cookie) => cookie.name === 'novin_dev_inbox')!.value;
      const exhaustedInbox = await app.inject({ url: '/api/v1/dev/sms-inbox', cookies: { novin_dev_inbox: String(exhaustedCapability) } });
      const exhaustedCode = exhaustedInbox.json().messages[0].body.match(/\d{6}/)[0];
      const wrongCode = exhaustedCode === '000000' ? '000001' : '000000';
      for (let attempt = 0; attempt < 5; attempt += 1) {
        expect((await app.inject({ method: 'POST', url: '/api/v1/auth/verify', payload: { mobile: exhaustedMobile, code: wrongCode, idempotencyKey: randomUUID() } })).statusCode).toBe(401);
      }
      expect((await app.inject({ method: 'POST', url: '/api/v1/auth/verify', payload: { mobile: exhaustedMobile, code: exhaustedCode, idempotencyKey: randomUUID() } })).statusCode).toBe(401);

      const expiredMobile = '092' + String(randomInt(0, 100000000)).padStart(8, '0');
      const expiredIssue = await app.inject({ method: 'POST', url: '/api/v1/auth/otp', payload: { mobile: expiredMobile } });
      const expiredCapability = expiredIssue.cookies.find((cookie) => cookie.name === 'novin_dev_inbox')!.value;
      const expiredInbox = await app.inject({ url: '/api/v1/dev/sms-inbox', cookies: { novin_dev_inbox: String(expiredCapability) } });
      const expiredCode = expiredInbox.json().messages[0].body.match(/\d{6}/)[0];
      await db.update(otpChallenges).set({ expiresAt: new Date(Date.now() - 1_000) }).where(eq(otpChallenges.mobile, sendOtpSchema.parse({ mobile: expiredMobile }).mobile));
      expect((await app.inject({ method: 'POST', url: '/api/v1/auth/verify', payload: { mobile: expiredMobile, code: expiredCode, idempotencyKey: randomUUID() } })).statusCode).toBe(401);

      const issued = await app.inject({ method: 'POST', url: '/api/v1/auth/otp', payload: { mobile } });
      expect(issued.statusCode).toBe(200);
      const capability = issued.cookies.find((cookie) => cookie.name === 'novin_dev_inbox')!.value;
      const messages = await app.inject({ url: '/api/v1/dev/sms-inbox', cookies: { novin_dev_inbox: String(capability) } });
      const code = messages.json().messages[0].body.match(/\d{6}/)[0];
      const verifies = await Promise.all([1, 2].map(() => app.inject({ method: 'POST', url: '/api/v1/auth/verify', cookies: { novin_dev_inbox: String(capability) }, payload: { mobile, code, idempotencyKey: randomUUID() } })));
      expect(verifies.map((response) => response.statusCode).sort()).toEqual([200, 401]);
      const authenticated = verifies.find((response) => response.statusCode === 200)!;
      const cookies = { novin_session: String(authenticated.cookies.find((cookie) => cookie.name === 'novin_session')!.value) };
      const payload = { firstName: 'نماینده', lastName: 'آزمایشی', email: 'synthetic@example.test', jobTitle: 'مدیر مالی', organizationName: 'سازمان ساختگی آزمون', organizationType: 'PRIVATE', representationConfirmed: true, privacyVersion: 'draft-0.1' };
      const onboarding = await Promise.all([1, 2].map(() => app.inject({ method: 'POST', url: '/api/v1/account/onboarding', cookies, payload })));
      expect(onboarding.map((response) => response.statusCode)).toEqual([200, 200]);
      const account = (await app.inject({ url: '/api/v1/account', cookies })).json();
      expect(account.organization.displayName).toBe(payload.organizationName);
      expect(await db.select().from(memberships).where(eq(memberships.userId, account.profile.id))).toHaveLength(1);
      const requestPayload = { title: 'درخواست ساختگی آزمون', description: 'درخواست صرفاً ساختگی برای آزمون ثبت هم‌زمان و جلوگیری از ایجاد داده تکراری.', organizationType: 'PRIVATE', confidentialityAccepted: true, privacyVersion: 'draft-0.1', idempotencyKey: randomUUID() };
      const submissions = await Promise.all([1, 2].map(() => app.inject({ method: 'POST', url: '/api/v1/requests', cookies, payload: requestPayload })));
      expect(submissions.map((response) => response.statusCode)).toEqual([200, 200]);
      expect(submissions[0]!.json().id).toBe(submissions[1]!.json().id);
      expect(await db.select().from(requests).where(eq(requests.createdByUserId, account.profile.id))).toHaveLength(1);
      const customerDto = (await app.inject({ url: '/api/v1/account', cookies })).json();
      expect(Object.keys(customerDto.requests[0]).sort()).toEqual(['reference', 'submittedAt', 'title']);
      // Test-only promotion inside the disposable test DB, not a public role API.
      await db.update(users).set({ role: 'EXPERT' }).where(eq(users.id, account.profile.id));
      const requestId = submissions[0]!.json().id;
      const transition = await app.inject({ method: 'POST', url: '/api/v1/admin/requests/' + requestId + '/transition', cookies, payload: { state: 'UNDER_REVIEW', expectedVersion: 0, note: 'آغاز بررسی ساختگی' } });
      expect(transition.statusCode).toBe(200);
      expect(await db.select().from(screenings).where(eq(screenings.requestId, requestId))).toHaveLength(0);
      const firstAudit = await db.select().from(auditLogs).where(eq(auditLogs.entityId, requestId));
      expect(firstAudit.some((row) => row.action === 'REQUEST_TRANSITION' && (row.after as { note?: string }).note === 'آغاز بررسی ساختگی')).toBe(true);
      expect((await app.inject({ method: 'POST', url: '/api/v1/admin/requests/' + requestId + '/transition', cookies, payload: { state: 'CONTACT_PENDING', expectedVersion: 1, note: 'تماس اولیه لازم است.' } })).statusCode).toBe(200);
      expect((await app.inject({ method: 'POST', url: '/api/v1/admin/requests/' + requestId + '/transition', cookies, payload: { state: 'QUALIFIED', expectedVersion: 2, outcome: 'QUALIFIED', note: 'امکان همکاری اولیه تأیید شد.' } })).statusCode).toBe(200);
      expect(await db.select().from(screenings).where(eq(screenings.requestId, requestId))).toMatchObject([{ outcome: 'QUALIFIED', note: 'امکان همکاری اولیه تأیید شد.' }]);
    } finally { await app.close(); await pool.end(); }
  }, 30000);
});
