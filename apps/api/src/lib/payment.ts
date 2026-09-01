import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import type { AppConfig } from '@novin/config';

export type PaymentIntent = { providerReference: string; redirectUrl: string };
export type Verification = { verified: boolean; providerReference: string };

export interface PaymentAdapter {
  create(input: { orderReference: string; amountIrr: number; callbackUrl: string }): Promise<PaymentIntent>;
  verify(input: { providerReference: string; amountIrr: number; callbackProof?: string }): Promise<Verification>;
}

class MockPaymentAdapter implements PaymentAdapter {
  async create(input: { orderReference: string; amountIrr: number; callbackUrl: string }) { const providerReference = `mock-${randomUUID()}`; return { providerReference, redirectUrl: `${input.callbackUrl}?mock_reference=${providerReference}` }; }
  async verify(input: { providerReference: string; amountIrr: number }) { return { verified: input.providerReference.startsWith('mock-') && input.amountIrr > 0, providerReference: input.providerReference }; }
}

class RestGatewayAdapter implements PaymentAdapter {
  constructor(private readonly config: AppConfig) {}
  async create(input: { orderReference: string; amountIrr: number; callbackUrl: string }) {
    const response = await fetch(`${this.config.PAYMENT_GATEWAY_BASE_URL}/transactions`, { method: 'POST', headers: { authorization: `Bearer ${this.config.PAYMENT_MERCHANT_ID}`, 'content-type': 'application/json' }, body: JSON.stringify({ merchantReference: input.orderReference, amountIrr: input.amountIrr, callbackUrl: input.callbackUrl }) });
    if (!response.ok) throw new Error('ایجاد تراکنش در درگاه ناموفق بود.');
    const result = await response.json() as { providerReference?: string; redirectUrl?: string };
    if (!result.providerReference || !result.redirectUrl) throw new Error('پاسخ درگاه پرداخت معتبر نیست.');
    return { providerReference: result.providerReference, redirectUrl: result.redirectUrl };
  }
  async verify(input: { providerReference: string; amountIrr: number; callbackProof?: string }) {
    const proof = input.callbackProof ?? '';
    const expected = createHmac('sha256', this.config.PAYMENT_CALLBACK_SECRET!).update(`${input.providerReference}:${input.amountIrr}`).digest('hex');
    const equal = proof.length === expected.length && timingSafeEqual(Buffer.from(proof), Buffer.from(expected));
    if (!equal) return { verified: false, providerReference: input.providerReference };
    const response = await fetch(`${this.config.PAYMENT_GATEWAY_BASE_URL}/transactions/${encodeURIComponent(input.providerReference)}/verify`, { method: 'POST', headers: { authorization: `Bearer ${this.config.PAYMENT_MERCHANT_ID}`, 'content-type': 'application/json' }, body: JSON.stringify({ amountIrr: input.amountIrr }) });
    if (!response.ok) return { verified: false, providerReference: input.providerReference };
    const result = await response.json() as { verified?: boolean; providerReference?: string };
    return { verified: result.verified === true, providerReference: result.providerReference ?? input.providerReference };
  }
}

export function paymentAdapter(config: AppConfig): PaymentAdapter {
  return config.PAYMENT_PROVIDER === 'mock' ? new MockPaymentAdapter() : new RestGatewayAdapter(config);
}
