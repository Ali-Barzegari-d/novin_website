# پرامپت‌های تصویر برای بازبینی مدیر

## تصمیم فعلی

کلاژ `financial-process-collage-v1.png` پس از بازبینی در ۳۲۰، ۷۶۸ و
۱۴۴۰ پیکسل رد شد و در سایت نمایش داده نمی‌شود. مشکل آن، شلوغی استعاری،
حجم کوچک در Hero موبایل و تبدیل «روش همکاری» به یک شیء تزئینی بود. فایل
خام تنها برای تاریخچه در `docs/assets-src/` نگه‌داری می‌شود.

مرجع مفهومیِ درست از نسخه‌های نخست پروژه این است:

`مسئله → مدل → سامانه → پذیرش → نتیجه`

این یک نقشهٔ تحولِ مفهومی است، نه نمودار مالی، نمودار رشد، کندل استیک یا
ادعای عملکرد. برچسب‌های فارسی همیشه در HTML قرار می‌گیرند، نه داخل تصویر.

| جایگاه | تصمیم فعلی | شرط استفاده از تصویر |
|---|---|---|
| Hero | تصویر ندارد؛ پیام و سه گام همکاری کافی‌اند. | فقط اگر نسخهٔ نهایی در موبایل هم نقش روشنی داشته باشد. |
| یکپارچه‌سازی | فهرست متنی چهارمرحله‌ای دارد. | تصویر باید «رویداد → کنترل → اتصال → خروجی» را بدون عدد نشان دهد. |
| نحوهٔ همکاری | فهرست مرحله‌ای HTML. | تصویر لازم نیست؛ ترتیب و شرایط تجاری باید خوانا بماند. |
| مطالعات موردی | تصویر یا نمودار ندارد. | فقط پس از تأیید کارفرما و همراه با داده/اجازهٔ واقعی. |

## قوانین مشترک

- هیچ متن، عدد، لوگو، نام مشتری، نشان ارز، نمودار سهام، کندل یا KPI در تصویر نباشد.
- از چهره، دست، عکس اداریِ ساختگی، پرچم، پول نقد و داشبوردهای SaaS پرهیز شود.
- نسبت تصویر Hero یا یکپارچه‌سازی: ۳:۲ یا ۴:۳. فایل نهایی PNG/WebP با ضلع بلند ۱۵۳۶px.
- رنگ‌ها: زمینه گرم `#F8F6F0` یا فیروزه‌ای عمیق `#075C57`، فیروزه‌ای `#0A766F`، کرم `#F2EEE5` و تأکید بسیار محدود زرشکی `#8B1E3F`. سرمه‌ای فقط جزئی.
- تصویر باید در ۳۲۰px هم قابل فهم باشد؛ عناصر اصلی در مرکز امن کادر بمانند.

**Negative prompt برای همهٔ گزینه‌ها:**

```text
text, letters, numbers, typography, logo, watermark, client name, KPI,
stock chart, candlestick chart, currency symbol, dashboard UI, SaaS cards,
human, face, hands, office stock photo, flag, cash, neon, purple gradient,
pink AI aesthetic, glossy glass, clutter
```

## گزینهٔ پیشنهادی ۱ — نقشهٔ تحول مفهومی (اولویت اول)

این تنها تصویر پیشنهادی برای بخش یکپارچه‌سازی است؛ نه Hero.

```text
Use case: infographic-diagram
Asset type: editorial website illustration for a Persian financial and operations consulting firm
Primary request: a calm, premium conceptual transformation map with five unlabelled stages arranged right to left: a fragmented paper record, a precise abstract model, an interconnected systems module, a verification checkpoint, and one resolved outcome document. The path between stages is simple, quiet and unmistakable.
Style/medium: refined two-dimensional editorial illustration, tactile matte paper and ink textures, Iranian girih-inspired proportions used very sparingly; not 3D, not a dashboard, not a technical wireframe.
Composition/framing: 3:2 landscape, generous breathing room, all five stages readable in a 320px crop, central composition, no element touches the edges.
Color palette: warm ivory background, deep turquoise and peacock green, soft teal, restrained deep burgundy detail; navy only as a fine outline.
Lighting/mood: calm, formal, intelligent, trustworthy.
Text (verbatim): no text anywhere in the image.
Constraints: symbolic only; no claims, no real customer data, no financial values.
Avoid: text, letters, numbers, typography, logo, watermark, stock chart, candlestick chart, dashboard UI, SaaS cards, human, face, hands, office stock photo, currency symbol, flag, neon, purple gradient, pink AI aesthetic, glossy glass, clutter.
```

## گزینهٔ پیشنهادی ۲ — تصویر واقعیِ مجاز (فقط با مجوز)

اگر یک فضای واقعی شرکت، جلسهٔ کاری یا مدارک غیرمحرمانه برای عکس دارید، این
گزینه از هر تصویر تولیدی معتبرتر است. چهره/دادهٔ قابل‌شناسایی تنها با رضایت
کتبی منتشر شود.

```text
Editorial documentary photograph for an Iranian professional financial and operations consulting firm: a real, permissioned worktable seen from above, one person’s face out of frame, unidentifiable hands only if release is confirmed, neutral printed process papers with all private content blank or blurred, a closed notebook, soft natural daylight, warm ivory, deep teal and restrained burgundy details, calm premium editorial composition, 3:2 landscape, generous clean space for surrounding Persian HTML copy. No logos, no readable documents, no money, no stock screens, no staged handshake.
```

## تحویل برای اتصال

فایل خام را همراه با منبع/مالکیت و نسبت تصویر بدهید. پس از بررسی ۳۲۰، ۷۶۸ و
۱۴۴۰px، نسخهٔ بهینه در `apps/web/public/images/` قرار می‌گیرد و رجیستر
`docs/ASSET_SOURCES.md` به‌روز می‌شود. هیچ تصویر تولیدشده‌ای پیش از تأیید
بصری شما در مسیر عمومی قرار نمی‌گیرد.
