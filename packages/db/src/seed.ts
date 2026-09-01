import { createHash, randomBytes } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { caseStudies, clients, contentEntries, createDatabase, legalDocuments, memberships, offerVersions, offers, orders, organizations, requests, teamMembers, users } from './index.js';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL تنظیم نشده است.');
const { db, pool } = createDatabase(databaseUrl);
const hash = (value: string) => createHash('sha256').update(value).digest('hex');
async function person(mobile: string, role: 'CUSTOMER' | 'EXPERT' | 'OPERATIONS' | 'FINANCE' | 'CONTENT' | 'SUPERADMIN', firstName: string, lastName: string) {
  const found = await db.query.users.findFirst({ where: eq(users.mobile, mobile) });
  if (found) return found;
  const [created] = await db.insert(users).values({ mobile, role, firstName, lastName, email: `${mobile.slice(-4)}@example.invalid`, jobTitle: role === 'CUSTOMER' ? 'مدیر مالی' : 'کاربر آزمایشی' }).returning();
  return created!;
}
try {
  const [, , operations, , content, customer] = await Promise.all([
    person('+989100000001', 'SUPERADMIN', 'مدیر', 'سامانه'), person('+989100000002', 'EXPERT', 'کارشناس', 'بررسی'), person('+989100000003', 'OPERATIONS', 'مدیر', 'عملیات'), person('+989100000004', 'FINANCE', 'کارشناس', 'مالی'), person('+989100000005', 'CONTENT', 'مدیر', 'محتوا'), person('+989100000006', 'CUSTOMER', 'آوا', 'رضایی')
  ]);
  const organization = await db.query.organizations.findFirst({ where: eq(organizations.displayName, 'شرکت نمونه پارسیان') }) ?? (await db.insert(organizations).values({ displayName: 'شرکت نمونه پارسیان', type: 'PRIVATE', isPlaceholder: true }).returning())[0]!;
  await db.insert(memberships).values({ userId: customer.id, organizationId: organization.id, representationConfirmedAt: new Date() }).onConflictDoNothing();
  const existing = await db.query.requests.findFirst({ where: eq(requests.reference, 'REQ-DEMO-0001') });
  const qualified = existing ?? (await db.insert(requests).values({ reference: 'REQ-DEMO-0001', organizationId: organization.id, createdByUserId: customer.id, title: 'یکپارچه‌سازی رویدادهای مالی', description: 'نمونه کاملاً ساختگی برای ارزیابی جریان ثبت درخواست و پیشنهاد اختصاصی است و داده واقعی ندارد.', source: 'seed', state: 'QUALIFIED', idempotencyKey: '00000000-0000-4000-8000-000000000001', privacyVersion: 'draft-0.1' }).returning())[0]!;
  for (const [reference, state] of [['REQ-DEMO-0002', 'SUBMITTED'], ['REQ-DEMO-0003', 'UNDER_REVIEW'], ['REQ-DEMO-0004', 'REJECTED'], ['REQ-DEMO-0005', 'ARCHIVED']] as const) await db.insert(requests).values({ reference, organizationId: organization.id, createdByUserId: customer.id, title: `درخواست ساختگی ${reference.slice(-1)}`, description: 'داده مصنوعی؛ برای نمایش وضعیت‌های داخلی و آزمون استفاده می‌شود.', source: 'seed', state, idempotencyKey: `00000000-0000-4000-8000-00000000000${reference.slice(-1)}`, privacyVersion: 'draft-0.1' }).onConflictDoNothing();
  const token = randomBytes(32).toString('base64url');
  const [offer] = await db.insert(offers).values({ requestId: qualified.id, tokenHash: hash(token), validUntil: new Date(Date.now() + 7 * 86400_000), state: 'SENT', createdById: operations.id }).onConflictDoNothing().returning();
  if (offer) { await db.insert(offerVersions).values({ offerId: offer.id, version: 1, title: 'جلسه کارشناسی ساختگی', description: 'نمونه کاملاً ساختگی.', scope: 'صورت‌بندی اولیه مسئله و مسیر اقدام.', deliverable: 'گزارش جمع‌بندی اولیه.', durationMinutes: 90, timing: 'پس از هماهنگی', expertMix: 'کارشناس مالی و فرایند', baseAmountIrr: 50_000_000, taxRateBps: 0, taxAmountIrr: 0, totalAmountIrr: 50_000_000, termsVersion: 'draft-0.1', cancellationVersion: 'draft-0.1', feeDeductionTerms: 'تابع قرارداد احتمالی آینده.', createdById: operations.id }); await db.insert(orders).values({ reference: 'ORD-DEMO-0001', offerId: offer.id, offerVersion: 1, state: 'PAYMENT_PENDING', totalAmountIrr: 50_000_000 }); }
  for (const [kind, body] of [['terms', 'پیش‌نویس شرایط استفاده — نیازمند تأیید حقوقی'], ['privacy', 'پیش‌نویس حریم خصوصی — نیازمند تأیید حقوقی'], ['cancellation', 'پیش‌نویس لغو و استرداد — نیازمند تأیید حقوقی']] as const) await db.insert(legalDocuments).values({ kind, version: 'draft-0.1', body, isDraft: true }).onConflictDoNothing();
  await db.insert(contentEntries).values({ slug: 'home-hero', title: 'نمونه محتوای قابل مدیریت', body: { content: 'نمونه ساختگی — قابل انتشار نیست' }, state: 'DRAFT', isPlaceholder: true, createdById: content.id }).onConflictDoNothing();
  await db.insert(clients).values({ name: 'مشتری نمونه ساختگی', logoAlt: 'نشان نمونه ساختگی', displayOrder: 1, approvedForPublication: false, isSynthetic: true }).onConflictDoNothing();
  await db.insert(caseStudies).values({ slug: 'sample-financial-flow', title: 'نمونه ساختگی جریان مالی', problem: 'نمونه ساختگی', action: 'نمونه ساختگی', result: 'نمونه ساختگی', state: 'DRAFT', approvedForPublication: false, isSynthetic: true }).onConflictDoNothing();
  await db.insert(teamMembers).values({ name: 'عضو نمونه ساختگی', role: 'کارشناس نمونه', expertise: 'نمونه ساختگی', biography: 'این پروفایل قابل انتشار نیست.', state: 'DRAFT', approvedForPublication: false, isSynthetic: true }).onConflictDoNothing();
  console.log(`Synthetic seed complete. Demo offer token (dev only): ${token}`);
} finally { await pool.end(); }
