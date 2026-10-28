import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'forest' | 'mint' | 'sage' | 'agri' | 'earth' | 'warning' | 'critical' | 'neutral' | 'demo';
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
    forest: 'bg-[#EAF4E8] text-[#10312B] border-[#DCE9DD]',
    mint: 'bg-[#DBF2DE] text-[#092622] border-[#9EC2A9]/60 font-semibold',
    sage: 'bg-[#D5E8D8] text-[#10312B] border-[#9EC2A9]',
    agri: 'bg-[#DBF2DE] text-[#10312B] border-[#9EC2A9]/70 font-semibold',
    earth: 'bg-[#F5EBE1] text-[#6E4226] border-[#E3D1C1]',
    warning: 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]',
    critical: 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]',
    neutral: 'bg-[#F3F8F2] text-[#52685B] border-[#DCE9DD]',
    demo: 'bg-[#DBF2DE] text-[#092622] border-[#9EC2A9] font-mono tracking-tight font-medium',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 rounded-lg',
    md: 'text-xs px-2.5 py-1 rounded-lg font-medium',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 border leading-none',
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
