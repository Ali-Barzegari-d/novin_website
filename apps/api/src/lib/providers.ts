import nodemailer from 'nodemailer';
import type { AppConfig } from '@novin/config';

export type Delivery = { providerReference: string; status: 'SENT' | 'FAILED' };

export async function deliverSms(config: AppConfig, destination: string, body: string): Promise<Delivery> {
  if (config.SMS_PROVIDER === 'mock') return { providerReference: `mock-sms-${Date.now()}`, status: 'SENT' };
  const response = await fetch(`https://api.kavenegar.com/v1/${config.KAVENEGAR_API_KEY}/sms/send.json`, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ receptor: destination.replace('+98', '0'), message: body }) });
  if (!response.ok) throw new Error('ارسال پیامک ناموفق بود.');
  return { providerReference: `kavenegar-${Date.now()}`, status: 'SENT' };
}

export async function deliverEmail(config: AppConfig, destination: string, subject: string, text: string): Promise<Delivery> {
  if (config.EMAIL_PROVIDER === 'mock') return { providerReference: `mock-email-${Date.now()}`, status: 'SENT' };
  const transporter = nodemailer.createTransport({ host: config.SMTP_HOST, port: config.SMTP_PORT, secure: config.SMTP_PORT === 465, auth: { user: config.SMTP_USERNAME, pass: config.SMTP_PASSWORD } });
  const sent = await transporter.sendMail({ from: config.SMTP_FROM, to: destination, subject, text });
  return { providerReference: sent.messageId, status: 'SENT' };
}
