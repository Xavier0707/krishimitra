import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  icon,
  badge,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={twMerge(
        clsx(
          'flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1',
          className
        )
      )}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2.5 flex-wrap">
          {icon && (
            <div className="w-9 h-9 rounded-xl bg-[#EAF4E8] text-[#1F4A3F] border border-[#DCE9DD] flex items-center justify-center shrink-0">
              {icon}
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-black text-[#10312B] tracking-tight">
            {title}
          </h1>
          {badge}
        </div>
        {subtitle && (
          <p className="text-xs sm:text-sm text-[#52685B] leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
