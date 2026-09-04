'use client';

import * as React from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const ToastProvider = ToastPrimitive.Provider;

const ToastViewport = React.forwardRef<
  HTMLOListElement,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      'pointer-events-none fixed inset-x-3 top-3 z-[100] flex max-h-dvh w-auto max-w-sm flex-col-reverse gap-2 p-0',
      'sm:inset-x-auto sm:bottom-4 sm:top-auto sm:start-4',
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitive.Viewport.displayName;

const toastVariants = cva(
  [
    'pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-(--radius) border p-4 shadow-(--shadow-md)',
    'transition-[opacity,transform] duration-(--duration-fast) ease-(--ease) motion-reduce:transition-none',
    'data-[state=closed]:-translate-y-2 data-[state=closed]:opacity-0 sm:data-[state=closed]:translate-y-2',
    'data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none',
    'data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]'
  ],
  {
    variants: {
      variant: {
        default: 'border-(--color-border) bg-(--color-surface-raised) text-(--color-text-primary)',
        success: 'border-(--color-success)/30 bg-(--color-success-bg) text-(--color-success)',
        danger: 'border-(--color-danger)/30 bg-(--color-danger-bg) text-(--color-danger)',
        warning: 'border-(--color-warning)/30 bg-(--color-warning-bg) text-(--color-warning)'
      }
    },
    defaultVariants: { variant: 'default' }
  }
);

type ToastVariant = NonNullable<VariantProps<typeof toastVariants>['variant']>;

const Toast = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> & VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => (
  <ToastPrimitive.Root ref={ref} className={cn(toastVariants({ variant }), className)} {...props} />
));
Toast.displayName = ToastPrimitive.Root.displayName;

const ToastAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Action
    ref={ref}
    className={cn(
      'inline-flex min-h-9 shrink-0 items-center justify-center rounded-(--radius-sm) border border-current/30 px-3 text-xs font-semibold',
      'transition-colors duration-(--duration-fast) hover:bg-(--color-primary-subtle) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current',
      'disabled:pointer-events-none disabled:opacity-50',
      className
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitive.Action.displayName;

const ToastClose = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Close
    ref={ref}
    aria-label="بستن اعلان"
    className={cn(
      'absolute end-2 top-2 rounded-(--radius-sm) p-1 text-current opacity-70 transition-opacity hover:opacity-100',
      'focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current',
      className
    )}
    {...props}
  >
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  </ToastPrimitive.Close>
));
ToastClose.displayName = ToastPrimitive.Close.displayName;

const ToastTitle = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title
    ref={ref}
    className={cn('text-sm font-semibold leading-snug', className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitive.Title.displayName;

const ToastDescription = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description
    ref={ref}
    className={cn('mt-1 text-xs leading-relaxed', className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitive.Description.displayName;

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;
type ToastActionElement = React.ReactElement<
  React.ComponentPropsWithoutRef<typeof ToastAction>,
  typeof ToastAction
>;

export {
  type ToastActionElement,
  type ToastProps,
  type ToastVariant,
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  toastVariants
};
