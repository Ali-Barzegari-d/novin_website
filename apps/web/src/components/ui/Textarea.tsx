'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const textareaVariants = cva(
  [
    'flex min-h-28 min-w-0 w-full resize-y rounded-(--radius) border bg-(--color-surface-raised) px-3.5 py-2.5 text-sm text-(--color-text-primary)',
    'placeholder:text-(--color-text-muted) transition-[border-color,box-shadow] duration-(--duration-fast) ease-(--ease)',
    'outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-bg)',
    'disabled:cursor-not-allowed disabled:bg-(--color-border-subtle)/40 disabled:opacity-60'
  ],
  {
    variants: {
      state: {
        default:
          'border-(--color-border) hover:border-(--color-primary) focus-visible:border-(--input-focus) focus-visible:ring-(--input-focus)/25',
        error:
          'border-(--color-danger) hover:border-(--color-danger) focus-visible:ring-(--color-danger)/25',
        success:
          'border-(--color-success) hover:border-(--color-success) focus-visible:ring-(--color-success)/25'
      }
    },
    defaultVariants: { state: 'default' }
  }
);

type TextareaState = NonNullable<VariantProps<typeof textareaVariants>['state']>;

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** برچسب بالای فیلد */
  label?: string;
  /** متن راهنما زیر فیلد */
  helperText?: string;
  /** پیام خطای اعتبارسنجی */
  error?: string;
  /** وضعیت ظاهری فیلد */
  state?: TextareaState;
  /** نمایش شمارنده در کنار برچسب، در صورت داشتن maxLength */
  showCount?: boolean;
}

function characterLength(value: React.TextareaHTMLAttributes<HTMLTextAreaElement>['value']) {
  return value == null ? 0 : String(value).length;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      state = 'default',
      showCount = false,
      id,
      required,
      maxLength,
      value,
      defaultValue,
      disabled,
      onChange,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const textareaId = id ?? generatedId;
    const errorId = error ? `${textareaId}-error` : undefined;
    const helperId = helperText ? `${textareaId}-helper` : undefined;
    const describedBy = [ariaDescribedBy, helperId, errorId].filter(Boolean).join(' ') || undefined;
    const [count, setCount] = React.useState(() => characterLength(value ?? defaultValue));
    const resolvedState = error ? 'error' : state;
    const controlProps = value === undefined ? { defaultValue } : { value };

    React.useEffect(() => {
      if (value !== undefined) setCount(characterLength(value));
    }, [value]);

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCount(event.target.value.length);
      onChange?.(event);
    };

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label || (showCount && maxLength) ? (
          <div className="flex items-center justify-between gap-3">
            {label ? (
              <label
                htmlFor={textareaId}
                className="text-sm font-medium text-(--color-text-primary)"
              >
                {label}
                {required ? (
                  <span aria-hidden="true" className="ms-0.5 text-(--color-danger)">
                    *
                  </span>
                ) : null}
              </label>
            ) : (
              <span />
            )}
            {showCount && maxLength ? (
              <span
                aria-live="polite"
                className={cn(
                  'text-xs tabular-nums',
                  count >= maxLength ? 'text-(--color-danger)' : 'text-(--color-text-muted)'
                )}
              >
                {count.toLocaleString('fa-IR')} / {maxLength.toLocaleString('fa-IR')}
              </span>
            ) : null}
          </div>
        ) : null}

        <textarea
          ref={ref}
          id={textareaId}
          required={required}
          maxLength={maxLength}
          disabled={disabled}
          aria-invalid={resolvedState === 'error' || undefined}
          aria-describedby={describedBy}
          className={cn(textareaVariants({ state: resolvedState }), className)}
          onChange={handleChange}
          {...controlProps}
          {...props}
        />

        {error ? (
          <p
            id={errorId}
            role="alert"
            aria-live="polite"
            className="text-xs leading-snug text-(--color-danger)"
          >
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-xs leading-snug text-(--color-text-muted)">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea, textareaVariants };
