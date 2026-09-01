import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export function opaqueToken(bytes = 32) {
  return randomBytes(bytes).toString('base64url');
}

export function secretHash(value: string, secret: string) {
  return createHmac('sha256', secret).update(value).digest('hex');
}

export function hashIp(ip: string, secret: string) {
  return secretHash(ip, secret);
}

export function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function publicReference(prefix: 'REQ' | 'ORD' | 'CMP') {
  return `${prefix}-${new Date().getUTCFullYear()}-${randomBytes(5).toString('hex').toUpperCase()}`;
}

export function offerTokenHash(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function asPersianDigits(value: string | number) {
  return String(value).replace(/\d/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'[Number(digit)] ?? digit);
}
