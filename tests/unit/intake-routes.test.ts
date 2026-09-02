import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FastifyInstance } from '../../apps/api/node_modules/fastify/fastify.js';
import { loadConfig } from '../../packages/config/src/index.js';

// Real Fastify handlers + real schemas. DB/Redis/provider doubles, NOT a DB integration test.
const fake = vi.hoisted(() => {
  const records: { table: unknown; values: unknown }[] = [];
  const selects: unknown[][] = [];
  const cache = new Map<string, string>();
  const query = { notificationTemplates: { findFirst: vi.fn() }, memberships: { findFirst: vi.fn() }, requests: { findFirst: vi.fn() } };
  const updateRows = { value: [{ id: 'request-id' }] };
  const db = {
    query,
    select: vi.fn(() => {
      const rows = selects.shift() ?? [];
      const chain = { from: () => chain, innerJoin: () => chain, where: () => chain, limit: () => chain, orderBy: () => chain, for: () => chain, then: (resolve: (value: unknown[]) => unknown) => Promise.resolve(rows).then(resolve) };
      return chain;
    }),
    insert: vi.fn((table: unknown) => ({ values: (values: unknown) => { records.push({ table, values }); return { returning: async () => [{ id: 'organization-id' }], catch: () => Promise.resolve([]), then: (resolve: (value: unknown[]) => unknown) => Promise.resolve([]).then(resolve) }; } })),
    update: vi.fn(() => ({ set: () => ({ where: () => ({ returning: async () => updateRows.value, then: (resolve: (value: unknown[]) => unknown) => Promise.resolve([]).then(resolve) }) }) })),
    transaction: vi.fn()
  };
  const redis = { connect: vi.fn(), quit: vi.fn(), ping: vi.fn(), expire: vi.fn(), incr: vi.fn(async () => 1), get: vi.fn(async (key: string) => cache.get(key) ?? null), del: vi.fn(async (key: string) => cache.delete(key)), set: vi.fn(async (key: string, value: string, options?: { NX?: boolean }) => { if (options?.NX && cache.has(key)) return null; cache.set(key, value); return 'OK'; }) };
  return { db, records, selects, cache, redis, updateRows, sms: vi.fn(async () => ({ status: 'SENT', providerReference: 'test-only' })) };
});
vi.mock('../../packages/db/dist/index.js', async (original) => ({ ...await original<object>(), createDatabase: () => ({ db: fake.db, pool: { end: vi.fn(), query: vi.fn() } }) }));
vi.mock('../../apps/api/node_modules/redis', () => ({ createClient: () => fake.redis }));
vi.mock('../../apps/api/src/lib/providers.js', () => ({ deliverSms: fake.sms, deliverEmail: vi.fn() }));
import { createApp } from '../../apps/api/src/app.js';
import { organizations, screenings } from '../../packages/db/dist/index.js';

const base = loadConfig({ APP_ENV: 'test', PUBLIC_BASE_URL: 'http://127.0.0.1:3050', DATABASE_URL: 'postgresql://unused', REDIS_URL: 'redis://unused', SESSION_SECRET: 't'.repeat(32) });
let app: FastifyInstance;
beforeEach(() => {
  vi.clearAllMocks(); fake.records.length = 0; fake.selects.length = 0; fake.cache.clear();
  fake.db.query.memberships.findFirst.mockResolvedValue(undefined);
  fake.db.query.requests.findFirst.mockResolvedValue({ id: 'request-id', state: 'SUBMITTED', version: 0 });
  fake.updateRows.value = [{ id: 'request-id' }];
  fake.db.transaction.mockImplementation((callback) => callback(fake.db));
});
afterEach(async () => { await app?.close(); });
function auth() { fake.selects.push([{ session: { authLevel: 2 }, user: { id: 'user-id', role: 'SUPERADMIN', mobile: '+989121234567' } }]); }
const cookie = 'novin_session=test-session';

describe('intake route regressions', () => {
  it('delivers OTP and scopes the expiring demo inbox to its browser cookie', async () => {
    app = await createApp({ config: base });
    const response = await app.inject({ method: 'POST', url: '/api/v1/auth/otp', payload: { mobile: '09121234567' } });
    expect(response.statusCode).toBe(200); expect(fake.sms).toHaveBeenCalledOnce();
    const inboxCookie = response.cookies.find((item) => item.name === 'novin_dev_inbox');
    expect(inboxCookie?.httpOnly).toBe(true);
    expect(fake.redis.set.mock.calls.some((args) => args[0].startsWith('dev-inbox:'))).toBe(true);
    const empty = await app.inject('/api/v1/dev/sms-inbox');
    expect(empty.json()).toEqual({ messages: [] });
    const own = await app.inject({ url: '/api/v1/dev/sms-inbox', cookies: { novin_dev_inbox: String(inboxCookie?.value) } });
    expect(own.json().messages).toHaveLength(1);
    expect(own.headers['cache-control']).toBe('private, no-store');
    expect(own.json().messages[0].body).toMatch(/\d{6}/);
    fake.cache.clear(); expect((await app.inject({ url: '/api/v1/dev/sms-inbox', cookies: { novin_dev_inbox: String(inboxCookie?.value) } })).json().messages).toEqual([]);
  });
  it('does not register a production inbox but does call the configured SMS adapter', async () => {
    app = await createApp({ config: { ...base, APP_ENV: 'production', SMS_PROVIDER: 'kavenegar', DEV_SMS_INBOX_ENABLED: false } });
    expect((await app.inject('/api/v1/dev/sms-inbox')).statusCode).toBe(404);
    expect((await app.inject({ method: 'POST', url: '/api/v1/auth/otp', payload: { mobile: '09121234567' } })).statusCode).toBe(200);
    expect(fake.sms).toHaveBeenCalledOnce();
    expect([...fake.cache.keys()].some((key) => key.startsWith('dev-inbox:'))).toBe(false);
  });
  it('honors a disabled mock inbox', async () => {
    app = await createApp({ config: { ...base, DEV_SMS_INBOX_ENABLED: false } });
    expect((await app.inject('/api/v1/dev/sms-inbox')).statusCode).toBe(404);
  });
  it('serializes the resend claim and does not deliver twice', async () => {
    app = await createApp({ config: base });
    const request = { method: 'POST' as const, url: '/api/v1/auth/otp', payload: { mobile: '09121234567' } };
    await app.inject(request); await app.inject(request);
    expect(fake.sms).toHaveBeenCalledOnce();
  });
  it('does not create another organization on onboarding retry', async () => {
    app = await createApp({ config: base }); auth();
    fake.db.query.memberships.findFirst.mockResolvedValue({ organizationId: 'existing' });
    const response = await app.inject({ method: 'POST', url: '/api/v1/account/onboarding', headers: { cookie }, payload: { firstName: 'علی', lastName: 'آزمایشی', email: 'demo@example.test', jobTitle: 'مدیر', organizationName: 'سازمان آزمایشی', organizationType: 'PRIVATE', representationConfirmed: true, privacyVersion: 'draft-0.1' } });
    expect(response.statusCode).toBe(200); expect(fake.db.transaction).toHaveBeenCalledOnce();
    expect(fake.records.filter((record) => record.table === organizations)).toHaveLength(0);
  });
  it('allows the first workflow transition without inserting an invalid screening outcome', async () => {
    app = await createApp({ config: base }); auth();
    const response = await app.inject({ method: 'POST', url: '/api/v1/admin/requests/request-id/transition', headers: { cookie }, payload: { state: 'UNDER_REVIEW', expectedVersion: 0, note: 'آغاز بررسی اولیه' } });
    expect(response.statusCode).toBe(200);
    expect(fake.records.filter((record) => record.table === screenings)).toHaveLength(0);
  });
  it('rejects a lost optimistic update', async () => {
    app = await createApp({ config: base }); auth(); fake.updateRows.value = [];
    const response = await app.inject({ method: 'POST', url: '/api/v1/admin/requests/request-id/transition', headers: { cookie }, payload: { state: 'UNDER_REVIEW', expectedVersion: 0, note: 'آغاز بررسی اولیه' } });
    expect(response.statusCode).toBe(409);
  });
  it('does not permit a screening dropdown to mark an order paid', async () => {
    app = await createApp({ config: base }); auth();
    fake.db.query.requests.findFirst.mockResolvedValue({ id: 'request-id', state: 'OFFER_SENT', version: 0 });
    const response = await app.inject({ method: 'POST', url: '/api/v1/admin/requests/request-id/transition', headers: { cookie }, payload: { state: 'PAID', expectedVersion: 0, note: 'تغییر بدون وصول' } });
    expect(response.statusCode).toBe(422);
  });
});
