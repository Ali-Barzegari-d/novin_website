import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  [
    'inline-flex select-none items-center gap-1 rounded-full border font-medium',
    'transition-colors duration-(--duration-fast) ease-(--ease)'
  ],
  {
    variants: {
      variant: {
        default:
          'border-(--color-border) bg-(--color-surface-raised) text-(--color-text-secondary)',
        success: 'border-(--color-success)/30 bg-(--color-success-bg) text-(--color-success)',
        danger: 'border-(--color-danger)/30 bg-(--color-danger-bg) text-(--color-danger)',
        warning: 'border-(--color-warning)/30 bg-(--color-warning-bg) text-(--color-warning)',
        info: 'border-(--color-primary)/30 bg-(--color-primary-subtle) text-(--color-primary)',
        accent: 'border-(--color-accent)/30 bg-(--color-accent-subtle) text-(--color-accent)',
        solid: 'border-transparent bg-(--color-primary) text-(--color-text-on-primary)'
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm'
      }
    },
    defaultVariants: { variant: 'default', size: 'md' }
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  /** نقطه وضعیت رنگی پیش از متن */
  dot?: boolean;
  /** آیکون تزئینی پیش از متن */
  icon?: React.ReactNode;
}

function Badge({ className, variant, size, dot, icon, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot ? (
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-80"
        />
      ) : null}
      {icon ? (
        <span
          aria-hidden="true"
          className="flex h-3 w-3 shrink-0 items-center justify-center [&>svg]:h-full [&>svg]:w-full"
        >
          {icon}
        </span>
      ) : null}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
