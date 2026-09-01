import { AuthFlow } from '@/components/AuthFlow';
export const metadata = { title: 'ورود' };
export default function Login() { return <><section className="section page-intro"><div className="shell"><h1>درخواست‌های من</h1><p className="hero-copy">برای ورود، شماره همراه تأییدشده خود را وارد کنید.</p></div></section><section className="section section-surface"><div className="shell"><AuthFlow mode="login" /></div></section></>; }
