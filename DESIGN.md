# Product design system

## Design thesis

The experience should feel like a credible Iranian professional-services firm with the clarity of a modern digital product. The visual story is “complexity becomes an executable system”: structured paths, connected nodes, layered documents, and calm geometric motion. It must not look like a retail bank, stock-trading dashboard, generic SaaS template, or government portal.

Use the references for qualities, not layouts or assets:

- `khodnevis.mrud.ir`: Persian-first hierarchy and institutional clarity.
- `n8n.io`: visual explanation of connected processes, generous composition, expressive but controlled interaction.
- `ui-ux-pro-max-skill.nextlevelbuilder.io`: systematic exploration, anti-pattern checks, resilient text, responsive/accessibility discipline.

No direct copying. Every illustration, component, layout, and icon treatment must be original or license-cleared.

## Brand tokens

Start with these tokens and adjust only when contrast testing requires it:

| Role | Token | Value | Use |
|---|---|---:|---|
| Primary | `--navy-900` | `#0B2545` | headings, primary buttons, footer |
| Primary hover | `--navy-800` | `#153A63` | interactive state |
| Secondary | `--teal-700` | `#0E7490` | links, diagrams, focus-adjacent accents |
| Success | `--green-700` | `#15803D` | verified/success only |
| Cultural accent | `--burgundy-700` | `#8B1E3F` | sparse emphasis, not errors |
| Warm accent | `--gold-600` | `#B7791F` | restrained highlights and geometric detail |
| Canvas | `--ivory-50` | `#F8F6F0` | warm page background |
| Surface | `--white` | `#FFFFFF` | cards/forms |
| Ink | `--ink-950` | `#172033` | body text |
| Muted | `--slate-600` | `#5D6878` | secondary copy |
| Border | `--slate-200` | `#DDE3EA` | separators/inputs |
| Error | `--red-700` | `#B42318` | errors only |

Do not use rainbow palettes, neon gradients, purple/pink “AI” gradients, flag-color bands, stock-chart motifs, or decorative color that obscures status. Meaning never relies on color alone.

Spacing uses a 4 px base with primary steps 8, 12, 16, 24, 32, 48, 64, 96. Public pages use generous whitespace; admin tables/forms use a compact but breathable rhythm. Corners: 10–16 px for cards, 8–12 px controls. Shadows are subtle and never replace borders/focus states.

## Typography

- Display/large headings: Estedad, weight 650–750.
- Body/UI: IranYekan only if licensed webfont files and redistribution rights are supplied; otherwise Vazirmatn.
- Numeric/technical fallback: Vazirmatn with tabular numerals where supported.
- Self-host WOFF2 subsets; avoid runtime font CDNs. Use `font-display: swap` and a stable fallback stack.
- Persian UI displays Persian digits. Copy operations, machine identifiers, URLs, and APIs preserve canonical ASCII values.
- Minimum body 16 px public / 14 px dense admin, with >=1.6 public line height and >=1.45 admin.
- Headings must reflow naturally; never force fragile line breaks. Test at 200% zoom and with longer CMS copy.

## Layout

- RTL document direction; logical CSS properties (`margin-inline`, `padding-inline`, `inset-inline`) rather than left/right hacks.
- Public content max width about 1200 px; readable prose 65–75 characters per line.
- Forms are single-column on mobile and stay narrow enough for focus.
- Exactly one primary CTA per page. Secondary actions are visually quieter.
- Sticky/fixed elements must never cover form controls, validation summaries, or mobile safe areas.
- Admin data tables may switch to labeled cards at narrow widths; do not create horizontal page scroll at 320 px.

## Homepage composition

Follow PRD 8.1 in order:

1. Hero with canonical title/subtitle, primary request CTA and secondary projects CTA. Include an original process illustration, not a dashboard screenshot.
2. Trust strip. Show only approved real logos/statistics; otherwise render a clearly marked CMS preview placeholder, not fake public claims.
3. Two audience paths: public/government and private companies.
4. “Problems we solve,” not service packages.
5. Automation/integration feature with a small connected-process visual.
6. “From problem to final acceptance” timeline.
7. Approved case studies using problem/action/result.
8. Key team summary only when approved.
9. Final request CTA.

In non-production, show the SMS mock inbox at bottom-left. It has an obvious “محیط آزمایشی” badge, keyboard close/minimize, accessible label, and must not obscure content. The production build/config must omit it, not merely hide it with CSS.

## Component behavior

- Buttons: 44 px minimum touch height; visible hover, active, focus-visible, disabled, and loading states.
- Inputs: persistent labels, hint/error relation via ARIA, error summary linking to fields, input preservation after failure.
- OTP: segmented appearance is allowed only if implemented as one semantically simple input; support paste/autofill and Persian/Latin digits.
- File upload: native input/drop enhancement, explicit types/10 MB, confidentiality warning before selection, scan state, retry/removal.
- Offer/payment pages: no marketing navigation distractions; clear scope, deliverable, price breakdown, validity, terms, and one action.
- Status: text + icon + color. Customer account does not show internal request state.
- Tables: semantic headers, useful column widths, keyboard focus, pagination/filter announcements, CSV export permissions.
- Dialogs: use sparingly; destructive/financial actions require reason, explicit confirmation, and return focus.

## Motion

- Standard transitions 160–220 ms; large entrance sequences max 320 ms.
- Use opacity/transform only for nonessential animation. No parallax, scroll hijacking, bouncing CTAs, or continuous decorative loops.
- Process lines/nodes may reveal progressively once, with a static equivalent.
- Under `prefers-reduced-motion: reduce`, remove nonessential transitions and preserve final semantic state.

## Imagery and Iranian character

Prefer real, permissioned company/team/project photography. Until supplied, use typography and original abstract vector geometry inspired by Iranian grid/girih proportions, document flows, and interconnected systems. Avoid literal clichés, monuments without relevance, flags, currency symbols as decoration, and unlicensed stock photos. Store `source_url`, creator, license, download date, and approval for each external asset.

## Accessibility and responsive QA

Target WCAG 2.2 AA:

- 4.5:1 normal-text contrast, 3:1 large text/UI boundaries.
- Full keyboard access, skip link, meaningful landmarks/headings, visible focus, logical DOM/tab order.
- 320 px completion without horizontal scrolling; test 320, 375, 768, 1024, and 1440.
- 200% zoom and text-spacing override without clipping.
- Screen-reader announcements for OTP, uploads, payment state, errors, and asynchronous completion.
- No emoji as functional icons. SVG icons need accessible names when meaningful and `aria-hidden` when decorative.
- Persian date display includes an unambiguous underlying value for assistive technology where needed.

Before each release, compare screenshots for clipping, bidi errors, orphan headings, CMS overflow, sticky overlap, visual hierarchy, and generic-template artifacts.
