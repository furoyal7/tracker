'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { MobileHeader } from './MobileHeader';
import { MobileBottomNav } from './MobileBottomNav';

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, getCurrentUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      getCurrentUser(); // Sync profile data like Telegram
    }
  }, [isAuthenticated, router, getCurrentUser]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-100 flex justify-center">
      {/* 📱 Desktop Centered Phone Shell */}
      <div className="w-full max-w-lg bg-white min-h-screen shadow-2xl relative flex flex-col">
        
        {/* 🔝 Fixed Top Header */}
        <MobileHeader />

        {/* 📜 Main Content Area */}
        <main className="flex-1 w-full pt-20 pb-24 px-6 overflow-y-auto no-scrollbar animate-ingress">
          {children}
        </main>

        {/* 🧭 Fixed Bottom Navigation */}
        <MobileBottomNav />

      </div>
    </div>
  );
};
