import { AuthFlow } from '@/components/AuthFlow';
import { Icon } from '@/components/Icon';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const safeNext = next?.startsWith('/') && !next.startsWith('//') ? next : '/account';
  return <main id="main-content" className="form-page"><header className="form-page-head shell"><h1>ورود به نوین ایرانیان</h1><p>با رمز یک‌بارمصرف وارد شوید؛ رمز عبور دائمی نداریم.</p></header><section className="auth-layout shell"><aside className="auth-assurance"><h2>یک مسیر کوتاه و امن</h2><ul><li><Icon name="lock"/> نشست امن و مدت‌دار</li><li><Icon name="building"/> حساب نماینده شخص حقوقی</li><li><Icon name="document"/> ثبت نسخه رضایت‌ها</li></ul></aside><AuthFlow next={safeNext}/></section></main>;
}
