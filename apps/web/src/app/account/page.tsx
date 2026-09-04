import type { Metadata } from 'next';
import { AccountView } from '@/components/AccountView';

export const metadata: Metadata = { title: 'حساب کاربری', robots: { index: false, follow: false } };
export default function AccountPage() { return <main id="main-content" className="workspace-page"><header className="workspace-head shell"><div><h1>حساب کاربری</h1><p>مشخصات پایه و درخواست‌های قابل ارجاع شما.</p></div></header><section className="shell"><AccountView/></section></main>; }
