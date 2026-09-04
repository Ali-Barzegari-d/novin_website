# راهنمای تصویر و پرامپت‌های بصری

وضعیت: جهت تصویری تأیید شده است، اما هیچ تصویر تولیدشده‌ای در رابط production استفاده نمی‌شود. رابط فعلی با HTML، CSS و SVGهای تألیفی ساخته شده تا وابستگی به عکس استوک، لوگوی جعلی یا دارایی فاقد مجوز نداشته باشد.

## مرجع تأییدشده

- فایل: `.impeccable/mocks/decision/canon.png`
- کاربرد: مرجع ترکیب‌بندی و فضای بصری؛ نه دارایی قابل انتشار
- تأیید مالک: ۱۴۰۵/۰۶/۱۳
- seed تصمیم: `3701d870`

### پرامپت مرجع

```text
Use case: ui-mockup
Asset type: full-fidelity conventional category-standard comp for a Persian RTL corporate consulting website, first viewport, 16:10 landscape.
Product: «شرکت طراحی و تحلیل مالی نوین ایرانیان».
Composition: familiar RTL two-column hero; large right-aligned statement, supporting paragraph and CTA «شرح مسئله‌تان را شروع کنید»; clean process diagram on the left; trust strip below; standard top navigation.
Palette: white #FFFFFF, navy #0F2742, teal #1E8A88.
Required labels: «مسئله را پیش از راه‌حل می‌فهمیم»؛ «مالی، فرایند، داده و سامانه؛ در یک مسیر»؛ «شرح مسئله‌تان را شروع کنید»؛ «نمونه ساختگی».
Constraints: accurate RTL, no real customer logos or factual claims.
Avoid: clutter, gradients, glassmorphism, fake metrics, stock-photo handshake, tiny text, English copy, watermark.
```

## قواعد تولید تصاویر آینده

هر تصویر تیم یا پروژه فقط پس از دریافت رضایت انتشار و ثبت منبع وارد محصول می‌شود. خروجی باید فضای واقعی کار حرفه‌ای در ایران را نشان دهد، تنوع نقش‌ها را حفظ کند و از نشانه‌های کلیشه‌ای مانند دست‌دادن استوک، نمودارهای جعلی، اعداد ساختگی، ساختمان‌های بی‌ارتباط و لوگوی تولیدشده پرهیز کند.

قالب پرامپت پروژه واقعی:

```text
Use case: editorial case-study image for a Persian RTL financial and transformation consultancy.
Subject: [شرح دقیق محیط و فعالیت واقعی پروژه، بدون داده محرمانه].
Composition: documentary, restrained, human-scale, clear negative space for RTL caption.
Light and palette: natural neutral light with subtle navy and teal accents.
Authenticity: Iranian organizational context; no visible private data, screens, IDs or client marks.
Avoid: staged handshake, fake dashboards, legible sensitive documents, excessive polish, watermark, generated text.
```

قالب پرامپت پروفایل تیم:

```text
Use case: consistent team portrait series for a trustworthy Persian corporate website.
Subject: [عضو واقعی و نقش تأییدشده].
Composition: waist-up environmental portrait, eye-level, calm direct expression, consistent 4:5 crop.
Background: real workplace with identifying and confidential details removed.
Light and palette: soft daylight, neutral colors, subtle navy/teal wardrobe accents.
Avoid: beauty retouching, stock-photo pose, fake office, visible documents, logos, watermark, generated text.
```

پیش از انتشار باید نسخه اصلی، مجوز/رضایت، متن جایگزین فارسی، نسبت برش، تاریخ دریافت و مالک حقوقی در `ASSET_SOURCES.md` ثبت شود.
