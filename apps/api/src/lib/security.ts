import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

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

export function publicReference(prefix: 'REQ' | 'ORD' | 'CMP' | 'INV') {
  return `${prefix}-${new Date().getUTCFullYear()}-${randomBytes(5).toString('hex').toUpperCase()}`;
}

export function offerTokenHash(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function asPersianDigits(value: string | number) {
  return String(value).replace(/\d/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'[Number(digit)] ?? digit);
}

function encryptionKey(secret: string) { return createHash('sha256').update(secret).digest(); }
export function encryptAtRest(value: string, secret: string) {
  const iv = randomBytes(12); const cipher = createCipheriv('aes-256-gcm', encryptionKey(secret), iv); const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return `${iv.toString('base64url')}.${cipher.getAuthTag().toString('base64url')}.${ciphertext.toString('base64url')}`;
}
export function decryptAtRest(value: string, secret: string) {
  const [iv, tag, ciphertext] = value.split('.'); if (!iv || !tag || !ciphertext) throw new Error('داده رمزگذاری‌شده نامعتبر است.'); const decipher = createDecipheriv('aes-256-gcm', encryptionKey(secret), Buffer.from(iv, 'base64url')); decipher.setAuthTag(Buffer.from(tag, 'base64url')); return Buffer.concat([decipher.update(Buffer.from(ciphertext, 'base64url')), decipher.final()]).toString('utf8');
}
