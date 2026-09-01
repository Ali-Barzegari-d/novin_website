export function calculateTotals(baseAmountIrr: number, taxRateBps: number) {
  if (!Number.isSafeInteger(baseAmountIrr) || baseAmountIrr <= 0) throw new Error('مبلغ پایه نامعتبر است.');
  if (!Number.isInteger(taxRateBps) || taxRateBps < 0 || taxRateBps > 100_000) throw new Error('نرخ مالیات نامعتبر است.');
  const taxAmountIrr = Math.round((baseAmountIrr * taxRateBps) / 10_000);
  const totalAmountIrr = baseAmountIrr + taxAmountIrr;
  if (!Number.isSafeInteger(totalAmountIrr)) throw new Error('مبلغ خارج از محدوده است.');
  return { baseAmountIrr, taxRateBps, taxAmountIrr, totalAmountIrr };
}
