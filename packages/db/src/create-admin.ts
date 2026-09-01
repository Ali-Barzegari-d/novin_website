import { randomBytes } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { createDatabase, users } from './index.js';

const databaseUrl = process.env.DATABASE_URL;
const mobile = process.env.ADMIN_MOBILE;
if (!databaseUrl || !mobile) throw new Error('DATABASE_URL و ADMIN_MOBILE لازم است.');
if (!/^\+989\d{9}$/.test(mobile)) throw new Error('ADMIN_MOBILE باید شماره ایران با قالب +989 باشد.');
const { db, pool } = createDatabase(databaseUrl);
try {
  const existing = await db.query.users.findFirst({ where: eq(users.mobile, mobile) });
  if (existing) {
    if (existing.role !== 'SUPERADMIN' || !existing.active) await db.update(users).set({ role: 'SUPERADMIN', active: true, updatedAt: new Date() }).where(eq(users.id, existing.id));
    console.log(`superadmin already exists: ${mobile}`);
  } else {
    await db.insert(users).values({ mobile, role: 'SUPERADMIN', active: true });
    console.log(`superadmin created: ${mobile}`);
  }
  console.log(`Enroll TOTP at first login. One-time handoff nonce: ${randomBytes(12).toString('base64url')}`);
} finally { await pool.end(); }
