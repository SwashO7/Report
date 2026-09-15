import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes, type LabelHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-9 w-full rounded-md border border-border-strong bg-surface px-3 text-sm text-text placeholder:text-text-tertiary',
        'transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-ring/20',
        'disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'min-h-[90px] w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-text placeholder:text-text-tertiary',
        'transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-ring/20',
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'h-9 w-full appearance-none rounded-md border border-border-strong bg-surface px-3 pr-8 text-sm text-text [color-scheme:dark]',
        // Native <option> popups ignore most parent styling; force dark bg/text
        // on the options themselves so the dropdown list isn't unreadable
        // light-on-light in Chromium/Firefox.
        '[&>option]:bg-surface [&>option]:text-text [&>option:checked]:bg-accent [&>option:disabled]:text-text-tertiary',
        'bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2716%27 height=%2716%27 fill=%27none%27 stroke=%27%238a837c%27 stroke-width=%272%27%3E%3Cpath d=%27m4 6 4 4 4-4%27/%3E%3C/svg%3E")] bg-[position:right_0.6rem_center] bg-no-repeat',
        'transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-ring/20',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
);
Select.displayName = 'Select';

export function Label({ className, children, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn('mb-1.5 block text-[13px] font-medium text-text', className)} {...props}>
      {children}
    </label>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1.5 text-xs font-medium text-danger">
      {message}
    </p>
  );
}

export function FormHint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1.5 text-xs leading-relaxed text-text-tertiary">{children}</p>;
}
