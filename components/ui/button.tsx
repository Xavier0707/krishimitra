import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'mint' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F4A3F] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none';

    const variantStyles = {
      primary:
        'bg-[#1F4A3F] text-white hover:bg-[#10312B] active:bg-[#092622] shadow-[0_2px_8px_rgba(31,74,63,0.18)] hover:shadow-[0_4px_12px_rgba(16,49,43,0.25)]',
      secondary:
        'bg-[#EAF4E8] text-[#10312B] hover:bg-[#DBF2DE] border border-[#DCE9DD] active:bg-[#C8E8CC]',
      outline:
        'border border-[#DCE9DD] bg-white text-[#10312B] hover:bg-[#F3F8F2] hover:border-[#C4DAC7]',
      ghost:
        'text-[#10312B] hover:bg-[#EAF4E8]',
      mint:
        'bg-[#DBF2DE] text-[#092622] hover:bg-[#C4E9C8] border border-[#9EC2A9]/40 font-semibold shadow-xs',
      danger:
        'bg-[#B91C1C] text-white hover:bg-[#991B1B] shadow-xs',
    };

    const sizeStyles = {
      sm: 'text-xs px-3 py-1.5 h-8 gap-1.5',
      md: 'text-sm px-4 py-2 h-10 gap-2',
      lg: 'text-base px-6 py-2.5 h-12 gap-2.5 font-semibold',
    };

    return (
      <button
        ref={ref}
        className={twMerge(clsx(baseStyles, variantStyles[variant], sizeStyles[size], className))}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
