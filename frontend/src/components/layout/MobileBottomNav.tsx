'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Receipt, 
  Users, 
  PieChart, 
  Settings,
  MessageSquare,
  Repeat
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useTranslation } from 'react-i18next';

export const MobileBottomNav = () => {
  const pathname = usePathname();
  const { t } = useTranslation();

  const navItems = [
    { icon: Home, label: t('nav.home'), href: '/' },
    { icon: Receipt, label: t('nav.ledger'), href: '/transactions' },
    { icon: Users, label: t('nav.debts'), href: '/debts' },
    { icon: MessageSquare, label: t('nav.chat'), href: '/chat' },
    { icon: Repeat, label: t('nav.exchange'), href: '/exchange' },
    { icon: PieChart, label: t('nav.reports'), href: '/reports' },
    { icon: Settings, label: t('nav.settings'), href: '/settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-6 pb-safe lg:hidden">
      <div className="flex items-center justify-between h-20 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link 
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center space-y-1.5 transition-all active:scale-90 px-3",
                isActive ? "text-blue-600" : "text-slate-400"
              )}
            >
              <div className={cn(
                "p-2 rounded-xl transition-all",
                isActive ? "bg-blue-50" : "bg-transparent"
              )}>
                <Icon size={20} strokeWidth={isActive ? 3 : 2} />
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
