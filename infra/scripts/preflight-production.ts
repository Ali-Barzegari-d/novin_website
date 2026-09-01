import { loadConfig } from '@novin/config';

const gates = [
  ['Legal identity/contact', 'Management', 'COMPANY_NATIONAL_ID, COMPANY_REGISTRATION_ID, COMPANY_ADDRESS, COMPANY_PHONE, COMPANY_EMAIL'],
  ['Approved legal documents and retention', 'Legal/privacy', 'LEGAL_CONTENT_APPROVED=true and approved CMS records'],
  ['Kavenegar production templates', 'Operations', 'SMS_PROVIDER=kavenegar and KAVENEGAR_API_KEY'],
  ['SMTP plus SPF/DKIM/DMARC', 'Operations', 'EMAIL_PROVIDER=smtp and verified mail DNS'],
  ['Approved payment gateway', 'Finance', 'PAYMENT_PROVIDER=gateway, credentials and sandbox certification'],
  ['Tax, invoice and bank instructions', 'Finance/legal', 'approved TAX_RATE_BPS and bank instructions CMS setting'],
  ['Publication approvals and brand assets', 'Management', 'approved clients/team/case studies and licensed font assets'],
  ['TLS, age recipient, restore drill, contacts', 'Technical', 'HTTPS proxy, BACKUP_AGE_RECIPIENT and documented restore evidence']
] as const;
try { loadConfig({ ...process.env, APP_ENV: 'production', NODE_ENV: 'production' }); } catch (error) { console.error(error instanceof Error ? error.message : error); }
for (const [gate, owner, remediation] of gates) console.error(`OPEN GATE | ${gate} | owner: ${owner} | remediation: ${remediation}`);
process.exitCode = 1;
