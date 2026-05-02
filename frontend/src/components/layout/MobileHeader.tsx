'use client';
import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { User as UserIcon, Menu, X, LayoutDashboard, Receipt, Package, Users, Repeat, MessageCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import { usePathname } from 'next/navigation';

export const MobileHeader = () => {
  const user = useAuthStore((state) => state.user);
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });

  const menuItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Transactions', href: '/transactions', icon: Receipt },
    { label: 'Inventory', href: '/inventory', icon: Package },
    { label: 'Debts', href: '/debts', icon: Users },
    { label: 'Exchange', href: '/exchange', icon: Repeat },
    { label: 'Chat', href: '/chat', icon: MessageCircle },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-50 px-4 py-3">
        <div className="flex items-center justify-between h-10 max-w-7xl mx-auto">
          
          <div className="flex items-center gap-3">
            {/* Hamburger Button (Mobile Only) */}
            <button 
              onClick={() => setIsOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-600 active:bg-slate-100 rounded-xl transition-all"
            >
              <Menu size={20} />
            </button>

            {/* Logo Identity */}
            <Link href="/" className="flex items-center gap-2 active:scale-95 transition-all">
              <div className="h-9 w-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
                <span className="text-white font-black text-lg italic leading-none">M</span>
              </div>
              <span className="text-xs font-black text-slate-900 uppercase tracking-widest hidden sm:block">MoneyManager</span>
            </Link>
          </div>

          {/* Desktop Nav Links (Visible on LG+) */}
          <nav className="hidden lg:flex items-center space-x-8">
            {menuItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "text-[10px] font-black uppercase tracking-[0.2em] transition-colors",
                  pathname === item.href ? "text-blue-600" : "text-slate-400 hover:text-blue-600"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end text-right">
              <div className="flex items-center justify-end space-x-1 mb-0.5">
                <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[7px] font-black text-slate-800 uppercase tracking-[0.1em] leading-none">Live Sync</span>
              </div>
              <p className="text-[8px] font-bold text-slate-400 font-mono tracking-tighter opacity-70">{today}</p>
            </div>
            
            <Link href="/settings" className="relative group active:scale-95 transition-all">
              <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center overflow-hidden border border-blue-100/50">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="ME" className="h-full w-full object-cover" />
                ) : (
                  <UserIcon size={16} className="text-blue-600" />
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
