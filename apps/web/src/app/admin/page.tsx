import type { Metadata } from 'next';
import { AdminWorkspace } from '@/components/AdminWorkspace';

export const metadata: Metadata = { title: 'فضای کاری داخلی', robots: { index: false, follow: false } };
export default function AdminPage() { return <main id="main-content" className="workspace-page admin-page"><header className="workspace-head shell"><div><h1>فضای کاری نوین</h1><p>عملیات، مالی، محتوا و دسترسی بر اساس نقش و با ثبت ممیزی.</p></div></header><section className="shell"><AdminWorkspace/></section></main>; }
