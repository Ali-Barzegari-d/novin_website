import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap border border-transparent font-medium leading-none select-none',
    'rounded-(--radius) transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-(--duration-fast) ease-(--ease)',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent) focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-bg)',
    'disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40'
  ],
  {
    variants: {
      variant: {
        primary:
          'bg-(--color-primary) text-(--color-text-on-primary) shadow-(--shadow-sm) hover:bg-(--color-primary-hover) active:scale-[0.98]',
        secondary:
          'border-(--color-border) bg-(--color-surface-raised) text-(--color-text-primary) hover:border-(--color-border) hover:bg-(--color-border-subtle) active:scale-[0.98]',
        ghost:
          'bg-transparent text-(--color-text-secondary) hover:bg-(--color-border-subtle) hover:text-(--color-text-primary) active:scale-[0.98]',
        accent:
          'bg-(--color-accent) text-(--color-text-on-primary) shadow-(--shadow-sm) hover:bg-(--color-accent-hover) active:scale-[0.98]',
        danger:
          'bg-(--color-danger) text-(--color-text-on-danger) shadow-(--shadow-sm) hover:bg-(--color-danger)/90 active:scale-[0.98]',
        'danger-ghost':
          'bg-transparent text-(--color-danger) hover:bg-(--color-danger-bg) active:scale-[0.98]',
        link: 'border-0 bg-transparent text-(--color-primary) underline-offset-4 shadow-none hover:text-(--color-primary-hover) hover:underline'
      },
      size: {
        xs: 'h-7 gap-1.5 px-2.5 text-xs',
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-11 px-5 text-base',
        xl: 'h-12 px-6 text-base',
        'icon-xs': 'h-7 w-7 p-0',
        'icon-sm': 'h-8 w-8 p-0',
        'icon-md': 'h-10 w-10 p-0',
        'icon-lg': 'h-11 w-11 p-0'
      },
      fullWidth: { true: 'w-full', false: '' },
      rounded: { default: 'rounded-(--radius)', full: 'rounded-full' }
    },
    defaultVariants: { variant: 'primary', size: 'md', fullWidth: false, rounded: 'default' }
  }
);

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={cn('animate-spin', className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  loadingText?: string;
  /** در RTL، نخستین فرزند flex در سمت راست قرار می‌گیرد. */
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

const spinnerSizes: Record<NonNullable<ButtonProps['size']>, string> = {
  xs: 'h-3 w-3',
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-4 w-4',
  xl: 'h-5 w-5',
  'icon-xs': 'h-3 w-3',
  'icon-sm': 'h-3.5 w-3.5',
  'icon-md': 'h-4 w-4',
  'icon-lg': 'h-4 w-4'
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      rounded,
      isLoading = false,
      loadingText,
      leadingIcon,
      trailingIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;
    const resolvedSize = size ?? 'md';

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={isLoading}
        className={cn(buttonVariants({ variant, size, fullWidth, rounded }), className)}
        {...props}
      >
        {isLoading ? (
          <>
            <Spinner className={spinnerSizes[resolvedSize]} />
            <span className="sr-only">{loadingText ?? 'در حال پردازش…'}</span>
            {loadingText ? <span aria-hidden="true">{loadingText}</span> : null}
          </>
        ) : (
          <>
            {leadingIcon ? (
              <span aria-hidden="true" className="shrink-0">
                {leadingIcon}
              </span>
            ) : null}
            {children}
            {trailingIcon ? (
              <span aria-hidden="true" className="shrink-0">
                {trailingIcon}
              </span>
            ) : null}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
