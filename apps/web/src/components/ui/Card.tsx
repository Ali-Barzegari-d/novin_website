'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  [
    'rounded-(--radius-lg) bg-(--color-surface-raised)',
    'transition-[box-shadow,border-color,transform] duration-(--duration-fast) ease-(--ease)'
  ],
  {
    variants: {
      variant: {
        outlined: 'border border-(--color-border)',
        elevated: 'border border-(--color-border) shadow-(--shadow-md)',
        interactive:
          'cursor-pointer border border-(--color-border) text-start hover:border-(--color-primary)/50 hover:shadow-(--shadow-md) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent) focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-bg) active:scale-[0.995]',
        offer: 'border-2 border-(--color-primary) shadow-(--shadow-md)'
      },
      padding: {
        none: '',
        sm: 'p-4',
        md: 'p-5',
        lg: 'p-6'
      }
    },
    defaultVariants: { variant: 'outlined', padding: 'md' }
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {
  /** نقش و رفتار کیبوردی button را برای کارت فعال می‌کند. */
  asButton?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, asButton = false, children, onKeyDown, ...props }, ref) => {
    const isInteractive = asButton || variant === 'interactive';

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || !isInteractive || (event.key !== 'Enter' && event.key !== ' '))
        return;

      event.preventDefault();
      event.currentTarget.click();
    };

    return (
      <div
        ref={ref}
        role={isInteractive ? 'button' : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        onKeyDown={isInteractive ? handleKeyDown : onKeyDown}
        className={cn(cardVariants({ variant, padding }), className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('mb-3 flex items-start justify-between gap-3', className)}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & { as?: 'h2' | 'h3' | 'h4' }
>(({ className, as: Tag = 'h3', ...props }, ref) => (
  <Tag
    ref={ref}
    className={cn(
      'm-0 text-base font-semibold leading-snug text-(--color-text-primary)',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('m-0 text-sm leading-relaxed text-(--color-text-muted)', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={className} {...props} />
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'mt-4 flex items-center justify-between gap-3 border-t border-(--color-border) pt-4',
        className
      )}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, cardVariants };
