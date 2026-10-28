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
  ShieldCheck,
  Sprout,
} from 'lucide-react';
import { Badge } from '../ui/badge';

export function Sidebar() {
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

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#092622] text-white min-h-screen border-r border-[#10312B] select-none shrink-0">
      {/* Brand & Logo */}
      <div className="p-5 border-b border-[#10312B]">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#1F4A3F] border border-[#4E7967]/40 flex items-center justify-center text-[#DBF2DE] group-hover:scale-105 transition-transform shadow-soft">
            <Sprout className="w-6 h-6 text-[#DBF2DE]" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-white block">
              KrishiConnect <span className="text-[#9EC2A9] font-black">AI</span>
            </span>
            <span className="text-[11px] text-[#9EC2A9]/80 font-medium block">
              किसान निर्णय मंच
            </span>
          </div>
        </Link>
        <div className="mt-3.5 flex items-center justify-between">
          <Badge variant="mint" size="sm" className="bg-[#1F4A3F] text-[#DBF2DE] border-[#4E7967]">
            डेमो मोड (सत्यापित)
          </Badge>
          <span className="text-[10px] text-[#9EC2A9]/70 flex items-center gap-1 font-mono">
            <ShieldCheck className="w-3 h-3 text-[#9EC2A9]" /> MP Agmarknet
          </span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-[#1F4A3F] text-white shadow-soft border border-[#4E7967]/50 font-semibold'
                  : 'text-[#9EC2A9]/80 hover:bg-[#10312B] hover:text-[#DBF2DE]'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-[#DBF2DE]' : 'text-[#9EC2A9]/70'
                }`}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Active Farmer Profile Card in Sidebar Footer */}
      <div className="p-4 border-t border-[#10312B] bg-[#092622]/90">
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#10312B] transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-[#1F4A3F] border border-[#4E7967]/40 flex items-center justify-center text-[#DBF2DE] font-bold text-xs">
            RP
          </div>
          <div className="truncate flex-1">
            <p className="text-xs font-bold text-white truncate">रामेश पटेल</p>
            <p className="text-[11px] text-[#9EC2A9]/80 truncate">सीहोर, म.प्र. (8 एकड़)</p>
          </div>
        </Link>
      </div>
    </aside>
  );
}
