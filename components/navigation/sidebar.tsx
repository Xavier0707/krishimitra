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
    <aside className="hidden lg:flex flex-col w-64 bg-forest-900 text-white min-h-screen border-r border-forest-950/40 select-none">
      {/* Brand & Logo */}
      <div className="p-5 border-b border-forest-800/80">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-agri-500/20 border border-agri-400/30 flex items-center justify-center text-agri-400 group-hover:scale-105 transition-transform">
            <Sprout className="w-6 h-6 text-agri-400" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-white block">
              KrishiConnect <span className="text-agri-400 font-black">AI</span>
            </span>
            <span className="text-[11px] text-forest-300 font-medium block">
              मध्य प्रदेश कृषि निर्णय तंत्र
            </span>
          </div>
        </Link>
        <div className="mt-3 flex items-center justify-between">
          <Badge variant="demo" size="sm">
            डेमो मोड (सत्यापित)
          </Badge>
          <span className="text-[10px] text-forest-400 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-agri-400" /> MP Agmarknet
          </span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-forest-800 text-white shadow-sm border border-forest-700/60 font-semibold'
                  : 'text-forest-200/90 hover:bg-forest-800/50 hover:text-white'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-agri-400' : 'text-forest-400'
                }`}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Active Farmer Profile Card in Sidebar Footer */}
      <div className="p-4 border-t border-forest-800/80 bg-forest-950/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-agri-600/30 border border-agri-500/40 flex items-center justify-center text-agri-300 font-bold text-sm">
            RP
          </div>
          <div className="truncate flex-1">
            <p className="text-xs font-semibold text-white truncate">रामेश पटेल</p>
            <p className="text-[11px] text-forest-300 truncate">सीहोर, म.प्र. (8 एकड़)</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
