import { readFile } from 'node:fs/promises';
const rows = (await readFile('docs/TRACEABILITY.csv', 'utf8')).trim().split(/\r?\n/);
if (rows.length < 2 || !rows[0].includes('requirement_id')) throw new Error('TRACEABILITY.csv نامعتبر است.');
for (const required of ['AUTH-01', 'REQ-01', 'ORD-01', 'PAY-01', 'CMS-01', 'AC-15']) if (!rows.some((row) => row.startsWith(`${required},`))) throw new Error(`${required} در traceability وجود ندارد.`);
console.log(`traceability contract: ${rows.length - 1} rows`);
