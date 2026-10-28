import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, children, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold text-[#52685B] uppercase tracking-wider mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={twMerge(
              clsx(
                'w-full appearance-none px-3.5 py-2.5 rounded-xl border border-[#DCE9DD] bg-white text-sm text-[#10312B]',
                'focus:outline-none focus:ring-2 focus:ring-[#1F4A3F]/20 focus:border-[#1F4A3F] transition-all pr-10',
                'disabled:bg-[#F3F8F2] disabled:cursor-not-allowed',
                error && 'border-[#B91C1C] focus:ring-[#B91C1C]/20 focus:border-[#B91C1C]',
                className
              )
            )}
            {...props}
          >
            {children}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-[#52685B]">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error && <p className="mt-1 text-xs text-[#B91C1C]">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-xs text-[#718579]">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
