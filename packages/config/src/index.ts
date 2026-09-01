import { z } from 'zod';

const boolean = z.enum(['true', 'false']).transform((value) => value === 'true');
const provider = z.enum(['mock', 'kavenegar', 'smtp', 'gateway']);
const emptyToUndefined = <T extends z.ZodType>(schema: T) => z.preprocess((value) => value === '' ? undefined : value, schema.optional());

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_ENV: z.enum(['dev', 'test', 'production']).default('dev'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  PUBLIC_BASE_URL: z.url(),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  SESSION_TTL_SECONDS: z.coerce.number().int().min(300).max(86_400).default(28_800),
  OTP_TTL_SECONDS: z.coerce.number().int().min(60).max(600).default(120),
  OTP_RESEND_SECONDS: z.coerce.number().int().min(30).max(600).default(60),
  OTP_MAX_ATTEMPTS: z.coerce.number().int().min(1).max(10).default(5),
  SMS_PROVIDER: z.enum(['mock', 'kavenegar']).default('mock'),
  KAVENEGAR_API_KEY: emptyToUndefined(z.string()),
  EMAIL_PROVIDER: z.enum(['mock', 'smtp']).default('mock'),
  SMTP_HOST: emptyToUndefined(z.string()),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(587),
  SMTP_USERNAME: emptyToUndefined(z.string()),
  SMTP_PASSWORD: emptyToUndefined(z.string()),
  SMTP_FROM: emptyToUndefined(z.string().email()),
  PAYMENT_PROVIDER: z.enum(['mock', 'gateway']).default('mock'),
  PAYMENT_MERCHANT_ID: emptyToUndefined(z.string()),
  PAYMENT_GATEWAY_BASE_URL: emptyToUndefined(z.url()),
  PAYMENT_CALLBACK_SECRET: emptyToUndefined(z.string().min(32)),
  CAPTCHA_PROVIDER: z.enum(['bypass', 'turnstile']).default('bypass'),
  TURNSTILE_SITE_KEY: emptyToUndefined(z.string()),
  TURNSTILE_SECRET_KEY: emptyToUndefined(z.string()),
  CLAMAV_HOST: z.string().default('clamav'),
  CLAMAV_PORT: z.coerce.number().int().min(1).max(65535).default(3310),
  UPLOAD_MAX_BYTES: z.coerce.number().int().min(1_024).max(50 * 1024 * 1024).default(10 * 1024 * 1024),
  UPLOAD_ALLOWED_TYPES: z.string().default('application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,image/png,image/jpeg'),
  DEV_SMS_INBOX_ENABLED: boolean.default(true),
  DEV_EMAIL_INBOX_ENABLED: boolean.default(true),
  SEED_SYNTHETIC_DATA: boolean.default(true),
  TAX_RATE_BPS: z.coerce.number().int().min(0).max(100_000).default(0),
  OFFER_DEFAULT_VALIDITY_DAYS: z.coerce.number().int().min(1).max(90).default(7),
  TRUSTED_PROXY_COUNT: z.coerce.number().int().min(0).max(5).default(1),
  COMPANY_NATIONAL_ID: emptyToUndefined(z.string()),
  COMPANY_REGISTRATION_ID: emptyToUndefined(z.string()),
  COMPANY_ADDRESS: emptyToUndefined(z.string()),
  COMPANY_PHONE: emptyToUndefined(z.string()),
  COMPANY_EMAIL: emptyToUndefined(z.string().email()),
  LEGAL_CONTENT_APPROVED: boolean.default(false),
  BACKUP_AGE_RECIPIENT: emptyToUndefined(z.string())
});

export type AppConfig = z.infer<typeof schema> & { allowedUploadTypes: string[] };

export function loadConfig(input: NodeJS.ProcessEnv = process.env): AppConfig {
  const config = schema.parse(input);
  const production = config.APP_ENV === 'production';
  const issues: string[] = [];
  if (production) {
    if (!config.PUBLIC_BASE_URL.startsWith('https://')) issues.push('PUBLIC_BASE_URL باید HTTPS باشد.');
    if (config.SMS_PROVIDER === 'mock' || !config.KAVENEGAR_API_KEY) issues.push('Kavenegar تولیدی پیکربندی نشده است.');
    if (config.EMAIL_PROVIDER === 'mock' || !config.SMTP_HOST || !config.SMTP_USERNAME || !config.SMTP_PASSWORD || !config.SMTP_FROM) issues.push('SMTP تولیدی پیکربندی نشده است.');
    if (config.PAYMENT_PROVIDER === 'mock' || !config.PAYMENT_MERCHANT_ID || !config.PAYMENT_GATEWAY_BASE_URL || !config.PAYMENT_CALLBACK_SECRET) issues.push('درگاه پرداخت تولیدی پیکربندی نشده است.');
    if (config.CAPTCHA_PROVIDER !== 'turnstile' || !config.TURNSTILE_SITE_KEY || !config.TURNSTILE_SECRET_KEY) issues.push('Turnstile تولیدی پیکربندی نشده است.');
    if (config.DEV_SMS_INBOX_ENABLED || config.DEV_EMAIL_INBOX_ENABLED || config.SEED_SYNTHETIC_DATA) issues.push('امکانات نمایشی در production مجاز نیستند.');
    if (config.SESSION_SECRET.includes('change-me')) issues.push('SESSION_SECRET پیش‌فرض است.');
    if (!config.COMPANY_NATIONAL_ID || !config.COMPANY_REGISTRATION_ID || !config.COMPANY_ADDRESS || !config.COMPANY_PHONE || !config.COMPANY_EMAIL) issues.push('اطلاعات هویتی شرکت کامل نیست.');
    if (!config.LEGAL_CONTENT_APPROVED) issues.push('متن حقوقی تأیید نشده است.');
    if (!config.BACKUP_AGE_RECIPIENT) issues.push('گیرنده رمزنگاری backup تنظیم نشده است.');
  }
  if (issues.length) throw new Error(`پیکربندی ناامن است: ${issues.join(' ')}`);
  return { ...config, allowedUploadTypes: config.UPLOAD_ALLOWED_TYPES.split(',').map((value) => value.trim()).filter(Boolean) };
}

export function isProduction(config: AppConfig) {
  return config.APP_ENV === 'production';
}
