import { describe, expect, it } from 'vitest';
import { paymentAdapter } from '../../apps/api/src/lib/payment.js';
import type { AppConfig } from '../../packages/config/src/index.js';

const config = { PAYMENT_PROVIDER: 'mock', PUBLIC_BASE_URL: 'http://localhost:3050' } as AppConfig;

describe('payment adapters', () => {
  it('uses a deterministic-safe mock adapter with no card data', async () => {
    const adapter = paymentAdapter(config);
    const intent = await adapter.create({ orderReference: 'ORD-TEST', amountIrr: 1_000, callbackUrl: 'http://localhost/callback' });
    expect(intent.providerReference).toMatch(/^mock-/);
    expect((await adapter.verify({ providerReference: intent.providerReference, amountIrr: 1_000 })).verified).toBe(true);
  });
});
