import React from 'react';
import { Badge } from './badge';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface MetricCardProps {
  label: string;
  value: React.ReactNode;
  unit?: string;
  icon?: React.ReactNode;
  statusBadge?: {
    text: string;
    variant?: 'forest' | 'mint' | 'sage' | 'warning' | 'critical' | 'neutral' | 'demo';
  };
  subtitle?: string;
  source?: string;
  isLive?: boolean;
  isDemo?: boolean;
  className?: string;
}

export function MetricCard({
  label,
  value,
  unit,
  icon,
  statusBadge,
  subtitle,
  source,
  isLive,
  isDemo,
  className,
}: MetricCardProps) {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-white rounded-2xl border border-[#DCE9DD] p-5 shadow-soft transition-all duration-150 hover:shadow-card hover:border-[#C4DAC7] flex flex-col justify-between',
          className
        )
      )}
    >
      <div>
        {/* Header row: Label + Icon */}
        <div className="flex items-start justify-between gap-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#52685B]">
            {label}
          </span>
          {icon && (
            <div className="w-9 h-9 rounded-xl bg-[#EAF4E8] text-[#1F4A3F] border border-[#DCE9DD] flex items-center justify-center shrink-0">
              {icon}
            </div>
          )}
        </div>

        {/* Main Value & Unit */}
        <div className="mt-2.5 flex items-baseline gap-1.5 flex-wrap">
          <div className="text-2xl sm:text-3xl font-black text-[#10312B] tracking-tight">
            {value}
          </div>
          {unit && (
            <span className="text-xs font-semibold text-[#52685B]">{unit}</span>
          )}
        </div>

        {/* Subtitle / Details */}
        {subtitle && (
          <p className="mt-1 text-xs text-[#52685B] leading-relaxed">{subtitle}</p>
        )}
      </div>

      {/* Footer row: Status badge / Source */}
      {(statusBadge || source || isLive !== undefined || isDemo) && (
        <div className="mt-3.5 pt-3 border-t border-[#DCE9DD]/70 flex items-center justify-between text-[11px] text-[#718579] flex-wrap gap-2">
          {statusBadge && (
            <Badge variant={statusBadge.variant || 'mint'} size="sm">
              {statusBadge.text}
            </Badge>
          )}

          {source && <span className="truncate max-w-[200px]">{source}</span>}

          {isDemo && !statusBadge && (
            <Badge variant="demo" size="sm">
              डेमो डेटा
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
