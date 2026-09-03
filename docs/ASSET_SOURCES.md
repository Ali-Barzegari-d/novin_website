# Asset sources and licenses

This register records redistributable visual assets bundled by the web application.
It must be updated before introducing any new image, icon, font, or illustration.

| Asset | Source | Version | License | Use and distribution |
|---|---|---:|---|---|
| Vazirmatn | [Fontsource Vazirmatn](https://fontsource.org/fonts/vazirmatn) | 5.3.0 | SIL Open Font License 1.1 | Self-hosted WOFF2 files, bundled from `@fontsource/vazirmatn` for Persian body/UI text. |
| Estedad | [Fontsource Estedad](https://fontsource.org/fonts/estedad) | 5.3.0 | SIL Open Font License 1.1 | Self-hosted WOFF2 files, bundled from `@fontsource/estedad` for Persian display/headline text. |
| Financial-process collage | Owner-supplied AI-generated artwork (company decision-maker), 2026-09-03 | v1 | All rights held by the company; generated art, not a third-party asset | Master PNG archived at `docs/assets-src/financial-process-collage-v1.png` (not shipped). Derived 4:3 WebP crop served from `apps/web/public/images/financial-process-collage-hero.webp` for the homepage hero conceptual figure. Marked «تصویر مفهومی» on display; depicts no real customer, project or data. |

`IranYekan` is not bundled: no licensed distribution was supplied to the project.
The approved open-font alternatives above are used instead. Remaining process artwork
(`HeroPathArt`, `IntegrationSignal`, `StationPath`, `ConvergenceMark`, `ClosingMark`) is
original project markup/CSS in `apps/web/src/components/sections/`; it has no
third-party asset dependency.
