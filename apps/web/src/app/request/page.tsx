import { RequestWizard } from '@/components/RequestWizard';
import { Icon } from '@/components/Icon';

export default function RequestPage() { return <main id="main-content" className="form-page"><header className="form-page-head shell"><h1>مسئله را شرح دهید؛ انتخاب راه‌حل با شما نیست.</h1><p>فرم را با اطلاعات غیرمحرمانه تکمیل کنید. بررسی و تماس اولیه رایگان است.</p></header><section className="request-layout shell"><aside><h2>برای یک شرح مفید</h2><ul><li>وضعیت فعلی را کوتاه توضیح دهید.</li><li>مانع یا ابهام اصلی را بنویسید.</li><li>تصمیم یا نتیجه موردنیاز را مشخص کنید.</li></ul><div className="privacy-marker"><Icon name="lock"/><span>داده حساس و هویتی اشخاص را در فرم اولیه وارد نکنید.</span></div></aside><RequestWizard/></section></main>; }
