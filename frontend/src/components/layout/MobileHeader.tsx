'use client';
import React from 'react';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { User as UserIcon } from 'lucide-react';

export const MobileHeader = () => {
  const user = useAuthStore((state) => state.user);
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-header px-6 pt-safe pb-4">
      <div className="flex items-center justify-between h-12 max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          {/* Avatar Profile Identity */}
          <Link href="/settings" className="relative group active:scale-95 transition-all">
             <div className="h-10 w-10 rounded-2xl bg-blue-50 flex items-center justify-center overflow-hidden border border-blue-100/50 shadow-sm">
                {user?.avatarUrl ? (
                   <img src={user.avatarUrl} alt="ME" className="h-full w-full object-cover" />
                ) : (
                   <UserIcon size={18} className="text-blue-600" />
                )}
             </div>
             <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
          </Link>

          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1.5 opacity-80">
              <span className="text-[8px] font-black text-blue-600 uppercase tracking-[0.3em] leading-none">
                {user?.username ? `@${user.username}` : 'Identity Secured'}
              </span>
              {user?.role === 'ADMIN' && (
                <Link href="/admin/exchange" className="text-[7px] font-black bg-rose-500 text-white px-1.5 py-0.5 rounded uppercase tracking-widest leading-none">
                  Admin
                </Link>
              )}
            </div>
            <h1 className="text-[13px] font-black text-slate-900 tracking-[0.05em] leading-none uppercase">
              {user?.name || user?.email?.split('@')[0] || 'Merchant Portal'}
            </h1>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center justify-end space-x-1.5 mb-1.5">
            <div className="h-1 w-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            <span className="text-[7px] font-black text-slate-800 uppercase tracking-[0.2em] leading-none">Live Sync</span>
          </div>
          <p className="text-[8px] font-bold text-slate-400 font-mono italic tracking-tighter opacity-70">{today}</p>
        </div>
      </div>
    </header>
  );
};
