'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n/context';
import {
  LayoutDashboard,
  TrendingUp,
  CloudSun,
  Stethoscope,
  Map,
  FlaskConical,
  Bot,
  Warehouse,
  User,
  X,
  Sprout,
} from 'lucide-react';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const { t } = useI18n();

  const navItems = [
    { href: '/dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { href: '/dashboard/mandi', label: t.nav.mandi, icon: TrendingUp },
    { href: '/dashboard/weather', label: t.nav.weather, icon: CloudSun },
    { href: '/dashboard/crop-doctor', label: t.nav.cropDoctor, icon: Stethoscope },
    { href: '/dashboard/farm-twin', label: t.nav.farmTwin, icon: Map },
    { href: '/dashboard/soil', label: t.nav.soil, icon: FlaskConical },
    { href: '/dashboard/copilot', label: t.nav.copilot, icon: Bot },
    { href: '/dashboard/storage-planner', label: t.nav.storagePlanner, icon: Warehouse },
    { href: '/dashboard/profile', label: t.nav.profile, icon: User },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#092622]/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-72 bg-[#092622] text-white flex flex-col shadow-float z-10 animate-slideRight border-r border-[#10312B]">
        <div className="p-5 border-b border-[#10312B] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1F4A3F] flex items-center justify-center text-[#DBF2DE]">
              <Sprout className="w-5 h-5 text-[#DBF2DE]" />
            </div>
            <span className="font-extrabold text-base">KrishiConnect AI</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#9EC2A9] hover:text-white rounded-xl hover:bg-[#10312B] transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#1F4A3F] text-white font-semibold border border-[#4E7967]/50 shadow-soft'
                    : 'text-[#9EC2A9]/80 hover:bg-[#10312B] hover:text-[#DBF2DE]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-[#DBF2DE]' : 'text-[#9EC2A9]/70'
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#10312B] bg-[#092622]/95">
          <p className="text-xs font-bold text-white">रामेश पटेल</p>
          <p className="text-[11px] text-[#9EC2A9]/80">सीहोर, म.प्र. (डेमो खाता)</p>
        </div>
      </div>
    </div>
  );
}

export function MobileBottomBar() {
  const pathname = usePathname();
  const { t } = useI18n();

  const items = [
    { href: '/dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { href: '/dashboard/mandi', label: t.nav.mandi, icon: TrendingUp },
    { href: '/dashboard/weather', label: t.nav.weather, icon: CloudSun },
    { href: '/dashboard/copilot', label: t.nav.copilot, icon: Bot },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-[#DCE9DD] py-2 px-3 flex items-center justify-around shadow-float">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-medium transition-all duration-150 ${
              isActive
                ? 'text-[#1F4A3F] font-bold'
                : 'text-[#52685B] hover:text-[#10312B]'
            }`}
          >
            <Icon
              className={`w-5 h-5 mb-0.5 transition-transform ${
                isActive ? 'text-[#1F4A3F] scale-110' : 'text-[#718579]'
              }`}
            />
            <span className="truncate max-w-[68px]">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
