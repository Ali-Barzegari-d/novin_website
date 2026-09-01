import { loadConfig } from '../../packages/config/src/index.js';
import { createDatabase } from '../../packages/db/src/index.js';

type Gate = readonly [gate: string, owner: string, remediation: string];
const gates: Gate[] = [];
let config: ReturnType<typeof loadConfig> | undefined;
try { config = loadConfig({ ...process.env, APP_ENV: 'production', NODE_ENV: 'production' }); } catch (error) { gates.push(['امنیت پیکربندی', 'Technical', error instanceof Error ? error.message : 'پیکربندی production نامعتبر است.']); }

if (config) {
  const { pool } = createDatabase(config.DATABASE_URL);
  try {
    const checks = await pool.query<{ placeholders: number; legal_drafts: number; synthetic_publications: number }>("SELECT (SELECT count(*)::int FROM content_entries WHERE is_placeholder = true AND state = 'PUBLISHED') + (SELECT count(*)::int FROM clients WHERE is_synthetic = true AND approved_for_publication = true) + (SELECT count(*)::int FROM case_studies WHERE is_synthetic = true AND approved_for_publication = true) + (SELECT count(*)::int FROM team_members WHERE is_synthetic = true AND approved_for_publication = true) AS placeholders, (SELECT count(*)::int FROM legal_documents WHERE is_draft = true) AS legal_drafts, (SELECT count(*)::int FROM clients WHERE is_synthetic = true AND approved_for_publication = true) AS synthetic_publications");
    const row = checks.rows[0];
    if (row && row.placeholders > 0) gates.push(['داده نمایشی منتشرشده', 'Content', 'placeholder یا داده مصنوعی منتشرشده را از انتشار خارج کنید.']);
    if (row && row.legal_drafts > 0) gates.push(['اسناد حقوقی پیش‌نویس', 'Legal/privacy', 'نسخه‌های نهایی شرایط، حریم خصوصی و لغو/استرداد را تأیید و منتشر کنید.']);
  } catch (error) { gates.push(['دسترسی پیش‌پرواز پایگاه‌داده', 'Technical', error instanceof Error ? error.message : 'پیش‌پرواز پایگاه‌داده ناموفق بود.']); } finally { await pool.end(); }
}

for (const [gate, owner, remediation] of gates) console.error(`OPEN GATE | ${gate} | owner: ${owner} | remediation: ${remediation}`);
if (gates.length) process.exitCode = 1;
else console.log('production preflight passed');
