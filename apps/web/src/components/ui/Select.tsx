'use client';

import * as React from 'react';
import * as RadixSelect from '@radix-ui/react-select';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const selectTriggerVariants = cva(
  [
    'flex min-w-0 w-full items-center justify-between gap-2 rounded-(--radius) border bg-(--color-surface-raised)',
    'text-(--color-text-primary) transition-[border-color,box-shadow] duration-(--duration-fast) ease-(--ease)',
    'outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-bg)',
    'disabled:cursor-not-allowed disabled:opacity-60 data-[placeholder]:text-(--color-text-muted)'
  ],
  {
    variants: {
      state: {
        default:
          'border-(--color-border) hover:border-(--color-primary) focus-visible:border-(--input-focus) focus-visible:ring-(--input-focus)/25',
        error:
          'border-(--color-danger) hover:border-(--color-danger) focus-visible:ring-(--color-danger)/25'
      },
      size: {
        sm: 'h-8 px-2.5 text-xs',
        md: 'h-11 px-3 text-sm',
        lg: 'h-12 px-3.5 text-base'
      }
    },
    defaultVariants: { state: 'default', size: 'md' }
  }
);

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectGroup {
  label: string;
  options: SelectOption[];
}

export interface SelectProps
  extends Omit<RadixSelect.SelectProps, 'dir'>, VariantProps<typeof selectTriggerVariants> {
  /** فهرست گزینه‌های بدون گروه‌بندی */
  options?: SelectOption[];
  /** فهرست گزینه‌های گروه‌بندی‌شده */
  groups?: SelectGroup[];
  /** متن انتخاب‌نشده */
  placeholder?: string;
  /** برچسب بالای فیلد */
  label?: string;
  /** متن راهنما زیر فیلد */
  helperText?: string;
  /** پیام خطای اعتبارسنجی */
  error?: string;
  /** پر کردن عرض والد */
  fullWidth?: boolean;
  className?: string;
  id?: string;
  'aria-describedby'?: string;
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={cn('h-4 w-4 shrink-0 text-(--color-text-muted)', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

const SelectItem = React.forwardRef<HTMLDivElement, RadixSelect.SelectItemProps>(
  ({ children, className, ...props }, ref) => (
    <RadixSelect.Item
      ref={ref}
      className={cn(
        'relative flex min-h-11 cursor-default select-none items-center rounded-(--radius-sm) py-2 pe-9 ps-3 text-sm text-(--color-text-primary)',
        'outline-none transition-colors duration-(--duration-fast) ease-(--ease)',
        'data-[highlighted]:bg-(--color-primary-subtle) data-[highlighted]:text-(--color-primary) data-[state=checked]:font-semibold',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-40',
        className
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className="absolute left-3 flex h-4 w-4 items-center justify-center text-(--color-primary)"
      >
        <RadixSelect.ItemIndicator>
          <CheckIcon />
        </RadixSelect.ItemIndicator>
      </span>
      <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
    </RadixSelect.Item>
  )
);
SelectItem.displayName = 'SelectItem';

const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      options,
      groups,
      placeholder = 'انتخاب کنید',
      label,
      helperText,
      error,
      fullWidth = true,
      state,
      size,
      className,
      id,
      disabled,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const selectId = id ?? generatedId;
    const errorId = error ? `${selectId}-error` : undefined;
    const helperId = helperText ? `${selectId}-helper` : undefined;
    const describedBy = [ariaDescribedBy, helperId, errorId].filter(Boolean).join(' ') || undefined;
    const resolvedState = error ? 'error' : state;

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full', className)}>
        {label ? (
          <label htmlFor={selectId} className="text-sm font-medium text-(--color-text-primary)">
            {label}
          </label>
        ) : null}

        <RadixSelect.Root dir="rtl" disabled={disabled ?? false} {...props}>
          <RadixSelect.Trigger
            ref={ref}
            id={selectId}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={selectTriggerVariants({ state: resolvedState, size })}
          >
            <RadixSelect.Value placeholder={placeholder} />
            <RadixSelect.Icon asChild>
              <ChevronDown />
            </RadixSelect.Icon>
          </RadixSelect.Trigger>

          <RadixSelect.Portal>
            <RadixSelect.Content
              dir="rtl"
              position="popper"
              sideOffset={4}
              className={cn(
                'z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-(--radius) border border-(--color-border)',
                'bg-(--color-surface-raised) text-(--color-text-primary) shadow-(--shadow-md)'
              )}
            >
              <RadixSelect.Viewport className="max-h-72 overflow-y-auto p-1">
                {options?.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled ?? false}
                  >
                    {option.label}
                  </SelectItem>
                ))}

                {groups?.map((group, index) => (
                  <React.Fragment key={group.label}>
                    {index > 0 ? (
                      <RadixSelect.Separator className="my-1 h-px bg-(--color-border)" />
                    ) : null}
                    <RadixSelect.Group>
                      <RadixSelect.Label className="px-3 pb-1 pt-2 text-xs font-semibold text-(--color-text-muted)">
                        {group.label}
                      </RadixSelect.Label>
                      {group.options.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          disabled={option.disabled ?? false}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </RadixSelect.Group>
                  </React.Fragment>
                ))}
              </RadixSelect.Viewport>
            </RadixSelect.Content>
          </RadixSelect.Portal>
        </RadixSelect.Root>

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
Select.displayName = 'Select';

export { Select, SelectItem, selectTriggerVariants };
