import Link from 'next/link';
import { Icon } from '@/components/Icon';

export default function NotFound() { return <main id="main-content" className="state-page shell"><span dir="ltr">404</span><h1>این مسیر پیدا نشد.</h1><p>ممکن است پیوند تغییر کرده باشد یا دسترسی آن منقضی شده باشد.</p><Link className="button" href="/">بازگشت به صفحه اصلی <Icon name="arrow"/></Link></main>; }
