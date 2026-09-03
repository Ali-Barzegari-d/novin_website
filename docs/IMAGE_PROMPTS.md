# پرامپت‌های تولید تصویر برای اسلات‌های نموداری

هدف: تصویرهای «کاغذ-کرافت ایرانی» در همان خانواده‌ی کلاژ تأییدشده‌ی مدیر (`docs/assets-src/financial-process-collage-v1.png`) تولید شود، تا جاهایی که نمودار کدی (SVG) نمی‌تواند زیبایی بصری کافی بدهد، تصویر واقعی و باکیفیت جایگزین شود.

**قانون اجرا:** متن و حروف داخل تصویر تولید **نشود** (متن فارسی در ابزارهای تولید تصویر خراب رندر می‌شود). همه برچسب‌ها در HTML/CSS دور تصویر می‌مانند. هر تصویر پس از تولید، ۱۵۳۶×۱۰۲۴ (یا نسبت ذکرشده) به من بدهید؛ من کراپ/بهینه‌سازی WebP و اتصال به کد و ثبت در `docs/ASSET_SOURCES.md` را انجام می‌دهم.

## DNA مشترک سبک (پایه‌ی همه پرامپت‌ها)

- رنگ پس‌زمینه: سبز-فیروزه‌ای عمیق و کم‌اشباع بین `#0d4740` و `#075c57`.
- مصالح: کاغذ برش‌خورده چندلایه (paper cutout)، حجم ملایم سه‌بعدی، سایه‌های نرم مات، پرداخت کاغذی مات (بدون براقیت پلاستیکی).
- رنگ‌های تأکیدی: طلایی برس‌خورده `#b98a2e`، کرم شیری `#efe9dc`، زرشکی محو `#8b1e3f`، سبز ملایم.
- موتیف‌های مجاز: هندسه گره/شمسه ایرانی، قاب‌های طاق‌دار، اسناد و پرونده‌های کاغذی، ماشین‌حساب، خطوط جریان نقطه‌چین طلایی، مهر و مدال.
- نور: استودیویی نرم از بالا-چپ، سایه‌های کوتاه و لطیف.
- ممنوع: هرگونه نوشته/حرف/عدد خوانا، چهره انسان، لوگو، نمودار کندل/قیمت سهام، پرچم، نماد ارز، گرادیان بنفش/صورتی «هوش مصنوعی».

**Negative prompt (برای همه اسلات‌ها):**

```
text, letters, numbers, words, typography, watermark, logo, human, face, hands, candlestick chart, stock chart, price ticker, currency symbols, flags, neon, purple, pink, glossy plastic, photorealistic people, clutter, noise
```

## اسلات‌ها

### ۱) Hero — وضعیت: انجام شد با کلاژ خودتان

`financial-process-collage-hero.webp` در `HomeExperience` متصل شد؛ مستر در `docs/assets-src/`. اگر نسخه‌ی جایگزین خواستید، همان پرامپت پایه با سوژه‌ی «document → rule → connected system → acceptance certificate» و نسبت ۴:۳.

### ۲) نوار بنر مسیر اجرا برای صفحات راهکار (دولتی/خصوصی)

- جای اتصال: اسلات جدید `illustration` در `PublicPage` (وقتی تصویر را دادید اضافه می‌کنم) — نوار پهن بالای فصل‌ها.
- نسبت: ۱۶:۶ پهن (مثلاً ۱۵۳۶×۵۷۶). سوژه در سمت چپ کادر تا زیر متن راست‌چین خالی بماند.

**پرامپت — مسیر دولتی و عمومی:**

```
Elegant paper-craft conceptual illustration, wide banner composition, on a deep desaturated teal-navy background (#0d4740). Right side intentionally empty. Left half: a stately Iranian pointed-arch frame in layered ivory paper, inside it layered official documents with ornamental girih lattice edges, a golden rule/ledger strip passing through a small eight-point-star seal, thin gold dotted flow lines exiting the arch and branching into three small teal paper modules (process, data, checklist) with tiny gold connectors. Accents in brushed gold (#b98a2e), muted burgundy seal, soft green leaf motif. Soft studio light, gentle paper shadows, matte finish, generous negative space, minimalist editorial composition.
```

**پرامپت — شرکت‌های خصوصی:**

```
Elegant paper-craft conceptual illustration, wide banner composition, on a deep desaturated teal-navy background (#0d4740). Right side intentionally empty. Left half: a row of four ivory and teal paper cards connected by thin gold flow lines into one continuous line ending in a small gold arrowhead; above the line a layered financial-model paper sheet with girih corner ornaments and a small brushed-gold calculator; below, two linked paper rings symbolizing integrated systems. Accents in brushed gold (#b98a2e), muted burgundy dot, soft green. Soft studio light, matte paper texture, calm editorial negative space.
```

### ۳) موتیف پس‌زمینه‌ی بخش پایانی (Closing)

- جای اتصال: پس‌زمینه‌ی کم‌رنگ پنل `closing-editorial` (با اوورلی ۸–۱۲٪ تا خوانایی متن حفظ شود).
- نسبت: ۴:۳ یا ۱:۱؛ بعداً به‌صورت تاکتی-چرخشی/کاور استفاده می‌شود.

**پرامپت:**

```
Very minimal paper-craft scene on deep teal-navy background (#0d4740), intended as a low-opacity background layer. One large quiet composition: a single long ivory paper path strip descending gently from upper right to lower left, ending in a small brushed-gold eight-point star and a tiny burgundy seal stamp; along the path two small detached paper squares (a checklist, a ledger) fading into shadow. Vast empty background, extremely restrained, soft studio light, matte paper texture, no border, no frame.
```

### ۴) کارت «نشان مشتریان» در صفحه پروژه‌ها (اختیاری)

- جای اتصال: کارت `case-badge` در `/projects` — قاب تصویری برای وقتی که هنوز نشان واقعی تایید نشده.
- نسبت: ۴:۳.

**پرامپت:**

```
Elegant paper-craft still life on deep teal-navy background (#0d4740): one empty ivory certificate sheet with torn-deckle edge and a blank ornamental girih border, a folded teal ribbon beneath it, and beside it a brushed-gold seal blank (no emblem engraved) and a small stack of two muted burgundy and green papers. Composition centered with generous negative space above. Soft studio light, matte finish, minimalist.
```

## نکات اتصال

1. فایل خام را در `docs/assets-src/` بگذارید/بدهید تا با نام اسلات آرشیو شود.
2. من کراپ بهینه (WebP، عرض ۹۰۰–۱۲۰۰) می‌سازم و در `apps/web/public/images/` قرار می‌دهم.
3. ردیف پروونانس (منبع = تأمین‌شده توسط مدیر شرکت) در `docs/ASSET_SOURCES.md` ثبت می‌شود.
4. هیچ تصویری بدون برچسب «تصویر مفهومی» نمایش داده نمی‌شود و هیچ تصویری ادعای مشتری/آمار واقعی القا نمی‌کند.
