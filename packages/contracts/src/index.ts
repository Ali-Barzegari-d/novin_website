import { z } from 'zod';

export const organizationTypes = ['PRIVATE', 'PUBLIC', 'GOVERNMENT'] as const;
export const staffRoles = ['EXPERT', 'OPERATIONS', 'FINANCE', 'CONTENT', 'SUPERADMIN'] as const;
export const requestStates = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'CONTACT_PENDING',
  'NEED_MORE_INFO',
  'QUALIFIED',
  'REJECTED',
  'OFFER_SENT',
  'PAID',
  'SESSION_SCHEDULED',
  'SESSION_COMPLETED',
  'PROJECT_PROPOSED',
  'ARCHIVED'
] as const;

export const phoneSchema = z
  .string()
  .trim()
  .transform((input) => input.replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit))).replace(/[\s-]/g, ''))
  .transform((input) => {
    if (input.startsWith('0098')) return `+98${input.slice(4)}`;
    if (input.startsWith('98')) return `+${input}`;
    if (input.startsWith('0')) return `+98${input.slice(1)}`;
    return input;
  })
  .refine((value) => /^\+989\d{9}$/.test(value), 'شماره همراه ایران معتبر نیست.');

export const sendOtpSchema = z.object({ mobile: phoneSchema, captchaToken: z.string().max(4096).optional() });
export const verifyOtpSchema = z.object({
  mobile: phoneSchema,
  code: z.string().transform((value) => value.replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))).pipe(z.string().regex(/^\d{6}$/)),
  idempotencyKey: z.string().uuid()
});

export const onboardingSchema = z.object({
  firstName: z.string().trim().min(2).max(80),
  lastName: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254),
  jobTitle: z.string().trim().min(2).max(120),
  organizationName: z.string().trim().min(2).max(180),
  organizationType: z.enum(organizationTypes),
  representationConfirmed: z.literal(true),
  privacyVersion: z.string().min(1).max(40)
});

export const requestSchema = z.object({
  title: z.string().trim().min(5).max(180),
  description: z.string().trim().min(30).max(8_000),
  organizationType: z.enum(organizationTypes),
  confidentialityAccepted: z.literal(true),
  privacyVersion: z.string().min(1).max(40),
  source: z.string().trim().min(1).max(80).default('web'),
  idempotencyKey: z.string().uuid()
});

export const screeningSchema = z.object({
  outcome: z.enum(['QUALIFIED', 'REJECTED', 'NEED_MORE_INFO']),
  note: z.string().trim().min(3).max(4_000),
  contactedAt: z.string().datetime().optional(),
  expectedVersion: z.number().int().nonnegative()
});

export const offerSchema = z.object({
  title: z.string().trim().min(3).max(180),
  description: z.string().trim().min(10).max(4_000),
  scope: z.string().trim().min(10).max(4_000),
  deliverable: z.string().trim().min(10).max(4_000),
  durationMinutes: z.number().int().min(30).max(960),
  timing: z.string().trim().min(3).max(500),
  expertMix: z.string().trim().min(3).max(1_000),
  baseAmountIrr: z.number().int().positive().max(9_000_000_000_000),
  taxRateBps: z.number().int().min(0).max(100_000),
  validUntil: z.string().datetime(),
  cancellationVersion: z.string().min(1).max(40),
  termsVersion: z.string().min(1).max(40),
  feeDeductionTerms: z.string().trim().min(10).max(2_000)
});

export const billingSchema = z.object({
  legalName: z.string().trim().min(2).max(240),
  nationalId: z.string().trim().regex(/^\d{11}$/),
  billingAddress: z.string().trim().min(10).max(1_000),
  postalCode: z.string().trim().regex(/^\d{10}$/).optional()
});

export const acceptOfferSchema = z.object({ termsVersion: z.string().min(1).max(40), idempotencyKey: z.string().uuid() });
export const bankTransferSchema = z.object({
  reference: z.string().trim().min(3).max(100),
  transferredAt: z.string().datetime(),
  amountIrr: z.number().int().positive(),
  bankName: z.string().trim().min(2).max(100),
  depositorName: z.string().trim().min(2).max(160),
  idempotencyKey: z.string().uuid()
});
export const refundSchema = z.object({ amountIrr: z.number().int().positive(), reason: z.string().trim().min(3).max(1_000), reference: z.string().trim().min(3).max(100) });
export const complaintSchema = z.object({
  name: z.string().trim().min(2).max(160),
  mobile: phoneSchema,
  email: z.string().trim().email().max(254).optional(),
  subject: z.string().trim().min(5).max(180),
  description: z.string().trim().min(20).max(3_000),
  idempotencyKey: z.string().uuid()
});

export type OrganizationType = z.infer<typeof onboardingSchema>['organizationType'];
export type StaffRole = (typeof staffRoles)[number];
export type RequestState = (typeof requestStates)[number];
export type OfferInput = z.infer<typeof offerSchema>;
