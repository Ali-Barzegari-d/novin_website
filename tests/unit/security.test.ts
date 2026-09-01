import { describe, expect, it } from 'vitest';
import { decryptAtRest, encryptAtRest, offerTokenHash, opaqueToken, safeEqual } from '../../apps/api/src/lib/security.js';
import { can } from '../../apps/api/src/lib/rbac.js';

describe('security boundaries', () => {
  const secret = 's'.repeat(32);
  it('encrypts MFA material without keeping plaintext', () => { const encrypted = encryptAtRest('totp-secret', secret); expect(encrypted).not.toContain('totp-secret'); expect(decryptAtRest(encrypted, secret)).toBe('totp-secret'); });
  it('uses high-entropy one-way offer tokens', () => { const first = opaqueToken(32); const second = opaqueToken(32); expect(first).not.toBe(second); expect(offerTokenHash(first)).not.toBe(first); });
  it('enforces least-privilege roles', () => { expect(can('CONTENT', 'payments:review')).toBe(false); expect(can('FINANCE', 'payments:review')).toBe(true); expect(safeEqual('a', 'b')).toBe(false); });
});
