'use client';

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  type ToastVariant
} from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';

function ToastStatusIcon({ variant }: { variant: ToastVariant }) {
  if (variant === 'default') return null;

  if (variant === 'success') {
    return (
      <svg
        aria-hidden="true"
        className="mt-0.5 h-5 w-5 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 2.5 2.5L16 9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (variant === 'danger') {
    return (
      <svg
        aria-hidden="true"
        className="mt-0.5 h-5 w-5 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v5m0 3h.01" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className="mt-0.5 h-5 w-5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 3 2.5 20h19L12 3Z" strokeLinejoin="round" />
      <path d="M12 9v5m0 3h.01" strokeLinecap="round" />
    </svg>
  );
}

function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider duration={6000} label="اعلان‌ها">
      {toasts.map(({ id, title, description, action, variant, ...props }) => {
        const resolvedVariant: ToastVariant = variant ?? 'default';
        return (
          <Toast key={id} variant={resolvedVariant} {...props}>
            <ToastStatusIcon variant={resolvedVariant} />
            <div className="min-w-0 flex-1 pe-7">
              {title ? <ToastTitle>{title}</ToastTitle> : null}
              {description ? <ToastDescription>{description}</ToastDescription> : null}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport label="اعلان‌ها ({hotkey})" />
    </ToastProvider>
  );
}

export { Toaster };
