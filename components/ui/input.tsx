import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-[#52685B] uppercase tracking-wider mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={twMerge(
            clsx(
              'w-full px-3.5 py-2.5 rounded-xl border border-[#DCE9DD] bg-white text-sm text-[#10312B] placeholder:text-[#718579]',
              'focus:outline-none focus:ring-2 focus:ring-[#1F4A3F]/20 focus:border-[#1F4A3F] transition-all',
              'disabled:bg-[#F3F8F2] disabled:cursor-not-allowed',
              error && 'border-[#B91C1C] focus:ring-[#B91C1C]/20 focus:border-[#B91C1C]',
              className
            )
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-[#B91C1C]">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-xs text-[#718579]">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
