import type { SVGProps } from 'react';

type IconName = 'arrow' | 'check' | 'lock' | 'search' | 'layers' | 'building' | 'person' | 'network' | 'document' | 'menu' | 'close' | 'upload' | 'warning';

export function Icon({ name, ...props }: { name: IconName } & SVGProps<SVGSVGElement>) {
  const paths: Record<IconName, React.ReactNode> = {
    arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    check: <path d="m5 12 4 4L19 7"/>,
    lock: <><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    layers: <><path d="m12 3-9 5 9 5 9-5-9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 16 9 5 9-5"/></>,
    building: <><path d="M3 21h18"/><path d="M6 21V8l6-4 6 4v13"/><path d="M9 12h.01M15 12h.01M9 16h.01M15 16h.01"/></>,
    person: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    network: <><circle cx="12" cy="5" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="19" cy="18" r="2"/><path d="m11 7-5 9m7-9 5 9M7 18h10"/></>,
    document: <><path d="M6 2h8l4 4v16H6z"/><path d="M14 2v5h5M9 12h6M9 16h6"/></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
    close: <path d="m6 6 12 12M18 6 6 18"/>,
    upload: <><path d="M12 16V4m0 0L7 9m5-5 5 5"/><path d="M5 14v6h14v-6"/></>,
    warning: <><path d="M12 3 2 21h20L12 3Z"/><path d="M12 9v5m0 3h.01"/></>
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}
