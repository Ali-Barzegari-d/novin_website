import { ComplaintForm } from '@/components/ComplaintForm';
export const metadata = { title: 'ثبت شکایت' };
export default function Complaints() { return <section className="section"><div className="shell"><span className="eyebrow">کانال رسمی پیگیری</span><h1>ثبت شکایت</h1><p className="hero-copy">بدون ورود هم می‌توانید شکایت خود را ثبت کنید. شماره پیگیری را نگه دارید و در مرحله اول مدرک یا اطلاعات حساس ارسال نکنید.</p><div className="card"><ComplaintForm/></div></div></section>; }
