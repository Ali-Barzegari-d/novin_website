import { describe, expect, it } from 'vitest';
import { phoneSchema } from '../../packages/contracts/src/index.js';
import { calculateTotals } from '../../apps/api/src/lib/money.js';
import { assertTransition } from '../../apps/api/src/lib/transitions.js';

describe('trusted-boundary rules', () => {
  it('normalizes Persian Iranian mobile input', () => expect(phoneSchema.parse('۰۹۱۲ ۱۲۳ ۴۵۶۷')).toBe('+989121234567'));
  it('rejects non-Iranian mobile input', () => expect(() => phoneSchema.parse('+12025550123')).toThrow());
  it('computes totals server-side in integer IRR', () => expect(calculateTotals(1_001, 900)).toEqual({ baseAmountIrr: 1_001, taxRateBps: 900, taxAmountIrr: 90, totalAmountIrr: 1_091 }));
  it('blocks an invalid request state transition', () => expect(() => assertTransition('SUBMITTED', 'PAID')).toThrow());
});
