import { describe, expect, it } from 'vitest';
import { loadConfig } from '../../packages/config/src/index.js';

const base = { PUBLIC_BASE_URL: 'http://localhost:3050', DATABASE_URL: 'postgresql://novin:dev@localhost:5432/novin', REDIS_URL: 'redis://localhost:6379', SESSION_SECRET: 'a'.repeat(32) };
describe('production gates', () => {
  it('rejects mock providers in production', () => expect(() => loadConfig({ ...base, APP_ENV: 'production', NODE_ENV: 'production' })).toThrow(/پیکربندی ناامن/));
  it('accepts bounded dev configuration', () => expect(loadConfig({ ...base, APP_ENV: 'dev', NODE_ENV: 'development' }).OTP_TTL_SECONDS).toBe(120));
});
