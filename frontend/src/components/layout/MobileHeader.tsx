'use client';
import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { User as UserIcon, Menu, X, LayoutDashboard, Receipt, Package, Users, Repeat, MessageCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from './LanguageToggle';

export const MobileHeader = () => {
  const user = useAuthStore((state) => state.user);
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });

  const menuItems = [
    { label: t('common.dashboard'), href: '/', icon: LayoutDashboard },
    { label: t('common.transactions'), href: '/transactions', icon: Receipt },
    { label: t('common.inventory'), href: '/inventory', icon: Package },
    { label: t('common.debts'), href: '/debts', icon: Users },
    { label: t('common.exchange'), href: '/exchange', icon: Repeat },
    { label: t('common.chat'), href: '/chat', icon: MessageCircle },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-50 px-4 py-3">
        <div className="flex items-center justify-between h-10 max-w-lg mx-auto">
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsOpen(true)}
              className="p-2 -ml-2 text-slate-600 active:bg-slate-50 rounded-full transition-colors"
            >
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-2">
              <h1 className="text-[18px] font-bold text-slate-900 tracking-tight italic">MoneyManager</h1>
              <span className="bg-emerald-100 text-emerald-600 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter shadow-sm border border-emerald-200">v3.0</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <LanguageToggle />
            <Link href="/profile" className="active:scale-95 transition-all">
              <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center overflow-hidden border border-blue-100/50">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="ME" className="h-full w-full object-cover" />
                ) : (
                  <UserIcon size={18} className="text-blue-600" />
                )}
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* 📱 Mobile Slide-out Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Drawer */}
          <div className="absolute top-0 left-0 bottom-0 w-[280px] bg-white shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
                  <span className="text-white font-black text-xl italic leading-none">M</span>
                </div>
                <span className="text-sm font-black text-slate-900 uppercase tracking-widest">Menu</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 bg-slate-50 rounded-xl text-slate-400">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-95",
                    pathname === item.href 
                      ? "bg-blue-50 text-blue-600" 
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <item.icon size={20} />
                  <span className="text-sm font-bold uppercase tracking-widest">{item.label}</span>
                </Link>
              ))}
            </div>

            <div className="p-6 border-t border-slate-50">
              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden">
                    <UserIcon size={20} className="text-slate-400" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-900">{user?.name || 'Merchant'}</span>
                    <span className="text-[10px] font-medium text-slate-400">@{user?.username}</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
