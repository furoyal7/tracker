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

const navItems = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: Receipt, label: 'Ledger', href: '/transactions' },
  { icon: Users, label: 'Debts', href: '/debts' },
  { icon: MessageSquare, label: 'Chat', href: '/chat' },
  { icon: Repeat, label: 'Exchange', href: '/exchange' },
  { icon: PieChart, label: 'Reports', href: '/reports' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export const MobileBottomNav = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass pb-safe">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-0.5 transition-all duration-200",
                isActive ? "text-blue-600 scale-105" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <div className={cn(
                "p-1 rounded-xl transition-all duration-200",
                isActive && "bg-blue-50 text-blue-600"
              )}>
                <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={cn(
                "text-[8px] font-black uppercase tracking-tighter transition-all duration-200 leading-none",
                isActive ? "opacity-100" : "opacity-60"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
