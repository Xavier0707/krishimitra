import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'forest' | 'agri' | 'earth' | 'warning' | 'critical' | 'neutral' | 'demo';
  size?: 'sm' | 'md';
}

export function Badge({
  className,
  variant = 'neutral',
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    forest: 'bg-forest-100 text-forest-800 border-forest-200',
    agri: 'bg-agri-100 text-agri-800 border-agri-200',
    earth: 'bg-earth-100 text-earth-800 border-earth-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
    critical: 'bg-rose-100 text-rose-800 border-rose-200',
    neutral: 'bg-cream-200 text-charcoal-700 border-cream-300',
    demo: 'bg-amber-50 text-amber-800 border-amber-300 font-mono tracking-tight',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 rounded',
    md: 'text-xs px-2.5 py-1 rounded-md font-medium',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1 border',
          variantStyles[variant],
          sizeStyles[size],
          className
        )
      )}
      {...props}
    >
      {children}
    </span>
  );
}
