import { ComplaintForm } from '@/components/ComplaintForm';

export default function ComplaintsPage() {
  return <main id="main-content" className="form-page"><header className="form-page-head shell"><h1>ثبت شکایت</h1><p>شرح خود را ثبت کنید تا شماره پیگیری دریافت کنید. برای مسئله یا درخواست همکاری جدید از فرم ثبت درخواست استفاده کنید.</p></header><section className="form-layout shell"><aside><strong>پیش از ثبت</strong><p>اطلاعات لازم برای پیگیری را بنویسید؛ اطلاعات کارت بانکی، رمز یا سند محرمانه ارسال نکنید.</p></aside><ComplaintForm/></section></main>;
}
