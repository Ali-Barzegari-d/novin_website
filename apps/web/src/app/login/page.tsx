import { AuthFlow } from '@/components/AuthFlow';
export const metadata = { title: 'ورود' };
export default function Login() { return <section className="section"><div className="shell"><span className="eyebrow">ورود و عضویت</span><h1>درخواست‌های من</h1><p className="hero-copy">برای ورود، شماره همراه تأییدشده خود را وارد کنید.</p><AuthFlow mode="login" /></div></section>; }
