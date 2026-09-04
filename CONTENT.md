# Content and copy contract

## Voice

Formal, precise, calm, managerial, and outcome-oriented. Explain complex work without jargon overload. Never promise tax reduction, guaranteed acceptance, guaranteed project outcome, legal representation, or official audit conclusions.

Use the PRD vocabulary:

- «ثبت مسئله و درخواست بررسی» — not «خرید مشاوره»
- «جلسه کارشناسی اولیه» — not «پکیج مشاوره»
- «پیشنهاد اختصاصی» — not a store product
- «درخواست‌های من» — not project dashboard
- «امکان همکاری» — not guaranteed delivery
- «گزارش جمع‌بندی اولیه» — not final audit/legal opinion

## Canonical homepage copy

Title:

> پیچیدگی‌های مالی و کسب‌وکاری را به فرایند، سامانه و محصول قابل‌اجرا تبدیل می‌کنیم.

Subtitle:

> از صورت‌بندی مسئله و طراحی مدل مالی تا اتوماسیون، توسعه نرم‌افزار، راهبری اجرا و پذیرش نهایی.

Primary CTA: «ثبت مسئله و درخواست بررسی»

Secondary CTA: «مشاهده پروژه‌ها»

The initial review/contact is free. The expert session is paid only after screening and a private offer. No public page displays its price.

## Required public explanations

- Customers are legal entities represented by a person.
- Submitting a request is not an order, acceptance, or project contract.
- The company may decline a request after review.
- Initial contact and screening are free.
- Session price depends on scope/time/expert mix and appears only in the private offer.
- The written session output is preliminary and bounded by the offer.
- Session-fee deduction from a later project applies only under the specific offer/contract.
- Do not upload confidential, identity, payroll, banking-card, or sensitive organizational data before NDA and a secure channel.

## Placeholder policy

Unknown facts are stored as explicit CMS placeholders with `is_placeholder=true`, owner, and production requirement. Examples:

- `[نیازمند درج شناسه ملی شرکت]`
- `[نیازمند درج شماره ثبت]`
- `[نیازمند درج نشانی قانونی]`
- `[نیازمند تأیید حقوقی]`
- `[نمونه ساختگی — قابل انتشار نیست]`

Production preflight blocks missing legal identity/contact details, legal approvals, payment/bank instructions, and publication approvals. Never invent customer names, logos, statistics, certificates, team biographies, addresses, or awards.

Synthetic case studies/team/client entries may exist in dev/demo only and must carry an unmistakable “نمونه ساختگی” badge. Public production queries exclude them.

## Page contracts

- Home: exact section order in PRD 8.1; presentation remains unset until the replacement frontend brief creates a new `DESIGN.md`.
- Public/government solutions: stakeholder ambiguity, financial-service/process redesign, law-to-rule/system requirements, PRD/data/workflow/acceptance, vendor acceptance, independent functional oversight.
- Private solutions: financial model fit, delayed/manual accounting events, accounting/legal-system integration, internal controls, e-invoice automation, tailored integration/product, compliance-aligned process design.
- Capabilities: discovery, modeling, product/process/data design, automation/integration, software delivery where relevant, implementation governance, acceptance.
- Process: free request → screening/contact → private paid session offer → payment → external scheduling/report → independent project proposal/contract.
- Initial assessment: free initial review, no public price, private pricing basis, bounded written deliverable, no guarantee.
- Projects/case studies: problem/action/result and publication approval.
- About/team: legal identity, method, approved evidence and real profiles only.
- Account: profile and request number/title/date; never internal status/notes.
- Offer/payment: scope, deliverable, expert mix, duration, timing, base/tax/total, expiry, cancellation/refund, fee-deduction condition, terms version, legal/billing identity.
- Complaints: public form, tracking reference, response channel, no sensitive evidence at first contact.

## Legal drafts

Generate complete usable drafts for terms, privacy, cancellation/refund, confidentiality warning, and complaints process. Every draft page must show:

> پیش‌نویس — این متن پیش از انتشار نیازمند تأیید مشاور حقوقی است.

Store version, effective date, approval status, approver, and revision history. Only approved versions may be accepted in production. Consent logs retain exact document/version/time/IP/order/offer/user references.

## Notifications

Messages are concise, formal, and avoid problem details. Include company name, request/order reference, official HTTPS domain, expiry where relevant, and support channel. Templates cover OTP, request submission, need-more-info, offer sent, payment success/failure/pending, bank transfer submitted/confirmed/rejected, offer expiry, and refund record.

Dev SMS/email previews are explicitly labeled test messages and use synthetic recipients.

## Dates and numbers

Store UTC and integer/ASCII canonical values. Display Iran timezone, Jalali date, and Persian digits. Preserve copyable canonical references; avoid bidi ambiguity with technical IDs and phone numbers.
