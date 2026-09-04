import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputWrapperVariants = cva(
  [
    'relative flex w-full items-center rounded-(--radius) border bg-(--color-surface-raised)',
    'transition-[border-color,box-shadow,background-color] duration-(--duration-fast) ease-(--ease)',
    'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-(--color-bg)'
  ],
  {
    variants: {
      state: {
        default:
          'border-(--color-border) has-[:focus-visible]:border-(--input-focus) has-[:focus-visible]:ring-(--input-focus)/25',
        error: 'border-(--color-danger) has-[:focus-visible]:ring-(--color-danger)/25',
        success: 'border-(--color-success) has-[:focus-visible]:ring-(--color-success)/25',
        warning: 'border-(--color-warning) has-[:focus-visible]:ring-(--color-warning)/25',
        disabled:
          'cursor-not-allowed border-(--color-border-subtle) bg-(--color-border-subtle)/40 opacity-60'
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-3 text-sm',
        lg: 'h-11 px-4 text-base'
      }
    },
    defaultVariants: { state: 'default', size: 'md' }
  }
);

const helperVariants = cva('mt-1.5 text-xs leading-snug', {
  variants: {
    state: {
      default: 'text-(--color-text-muted)',
      error: 'text-(--color-danger)',
      success: 'text-(--color-success)',
      warning: 'text-(--color-warning)',
      disabled: 'text-(--color-text-muted) opacity-60'
    }
  },
  defaultVariants: { state: 'default' }
});

type InputState = NonNullable<VariantProps<typeof inputWrapperVariants>['state']>;
type InputSize = NonNullable<VariantProps<typeof inputWrapperVariants>['size']>;

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** متن برچسب بالای فیلد */
  label?: string;
  /** متن راهنما یا پیام اعتبارسنجی زیر فیلد */
  helperText?: string;
  /** وضعیت ظاهری و معنایی فیلد */
  state?: InputState;
  /** سایز فیلد */
  size?: InputSize;
  /** آیکون یا محتوای تزئینی در ابتدای فیلد (سمت راست در RTL) */
  leadingAddon?: React.ReactNode;
  /** آیکون یا محتوای تزئینی در انتهای فیلد (سمت چپ در RTL) */
  trailingAddon?: React.ReactNode;
  /** نمایش ستاره اجباری کنار label */
  required?: boolean;
}

const addonSizes: Record<InputSize, string> = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-4.5 w-4.5'
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      helperText,
      state = 'default',
      size = 'md',
      leadingAddon,
      trailingAddon,
      required,
      id,
      disabled,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const isDisabled = disabled || state === 'disabled';
    const resolvedState: InputState = isDisabled ? 'disabled' : state;
    const describedBy = [ariaDescribedBy, helperId].filter(Boolean).join(' ') || undefined;

    return (
      <div className="flex min-w-0 w-full flex-col">
        {label ? (
          <label
            htmlFor={inputId}
            className={cn(
              'mb-1.5 select-none text-sm font-medium text-(--color-text-primary)',
              resolvedState === 'disabled' && 'cursor-not-allowed opacity-60'
            )}
          >
            {label}
            {required ? (
              <span aria-hidden="true" className="ms-0.5 text-(--color-danger)">
                *
              </span>
            ) : null}
          </label>
        ) : null}

        <div className={inputWrapperVariants({ state: resolvedState, size })}>
          {leadingAddon ? (
            <span
              aria-hidden="true"
              className={cn('me-2 flex shrink-0 text-(--color-text-muted)', addonSizes[size])}
            >
              {leadingAddon}
            </span>
          ) : null}

          <input
            ref={ref}
            id={inputId}
            disabled={isDisabled}
            required={required}
            aria-invalid={resolvedState === 'error' || undefined}
            aria-describedby={describedBy}
            className={cn(
              'h-full min-w-0 flex-1 bg-transparent px-0 py-0 text-(--color-text-primary) placeholder:text-(--color-text-muted)',
              'outline-none focus-visible:outline-none disabled:cursor-not-allowed',
              className
            )}
            {...props}
          />

          {trailingAddon ? (
            <span
              aria-hidden="true"
              className={cn('ms-2 flex shrink-0 text-(--color-text-muted)', addonSizes[size])}
            >
              {trailingAddon}
            </span>
          ) : null}
        </div>

        {helperText ? (
          <p
            id={helperId}
            role={resolvedState === 'error' ? 'alert' : undefined}
            aria-live={resolvedState === 'error' ? 'polite' : undefined}
            className={helperVariants({ state: resolvedState })}
          >
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, helperVariants, inputWrapperVariants };
