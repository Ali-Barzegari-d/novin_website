import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const checkboxIndicatorVariants = cva(
  [
    'flex h-4 w-4 shrink-0 items-center justify-center rounded-(--radius-sm) border border-(--color-border)',
    'bg-(--color-surface-raised) text-(--color-text-on-primary)',
    'transition-[background-color,border-color,box-shadow] duration-(--duration-fast) ease-(--ease)',
    'hover:border-(--color-primary) peer-checked:border-(--color-primary) peer-checked:bg-(--color-primary)',
    'peer-focus-visible:border-(--input-focus) peer-focus-visible:ring-2 peer-focus-visible:ring-(--input-focus)/25 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-(--color-bg)',
    'peer-disabled:cursor-not-allowed peer-disabled:border-(--color-border-subtle) peer-disabled:bg-(--color-border-subtle)/40 peer-disabled:opacity-50',
    'peer-checked:[&>svg]:block'
  ],
  {
    variants: {
      hasError: {
        true: 'border-(--color-danger) peer-focus-visible:border-(--color-danger) peer-focus-visible:ring-(--color-danger)/25'
      }
    },
    defaultVariants: { hasError: false }
  }
);

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** برچسب متنی کنار چک‌باکس */
  label?: React.ReactNode;
  /** توضیح تکمیلی زیر برچسب */
  description?: React.ReactNode;
  /** متن خطا */
  error?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      label,
      description,
      error,
      disabled,
      id,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const checkboxId = id ?? generatedId;
    const descriptionId = description ? `${checkboxId}-description` : undefined;
    const errorId = error ? `${checkboxId}-error` : undefined;
    const describedBy =
      [ariaDescribedBy, descriptionId, errorId].filter(Boolean).join(' ') || undefined;

    return (
      <div className={cn('flex flex-col', className)}>
        <label
          htmlFor={checkboxId}
          className={cn(
            'flex cursor-pointer select-none items-start gap-2.5',
            disabled && 'cursor-not-allowed opacity-60'
          )}
        >
          <span className="relative flex items-center pt-0.5">
            <input
              ref={ref}
              id={checkboxId}
              type="checkbox"
              disabled={disabled}
              aria-invalid={Boolean(error) || undefined}
              aria-describedby={describedBy}
              className="peer sr-only"
              {...props}
            />
            <span
              aria-hidden="true"
              className={checkboxIndicatorVariants({ hasError: Boolean(error) })}
            >
              <svg className="hidden h-3 w-3 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
          </span>

          {label || description ? (
            <span className="flex flex-col leading-snug">
              {label ? (
                <span className="text-sm font-medium text-(--color-text-primary)">{label}</span>
              ) : null}
              {description ? (
                <span
                  id={descriptionId}
                  className="mt-0.5 text-xs leading-relaxed text-(--color-text-muted)"
                >
                  {description}
                </span>
              ) : null}
            </span>
          ) : null}
        </label>

        {error ? (
          <p
            id={errorId}
            role="alert"
            aria-live="polite"
            className="mt-1.5 ps-[26px] text-xs text-(--color-danger)"
          >
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';

export { Checkbox, checkboxIndicatorVariants };
