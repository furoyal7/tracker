'use client';
import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { socketService } from '@/services/socket/socket';
import { toast } from 'sonner';
import { MobileHeader } from './MobileHeader';
import { MobileBottomNav } from './MobileBottomNav';
import { MessageSquare } from 'lucide-react';

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated, getCurrentUser, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (_hasHydrated) {
      if (!isAuthenticated) {
        router.push('/login');
      } else {
        getCurrentUser(); // Sync profile data
      }
    }
  }, [_hasHydrated, isAuthenticated, router, getCurrentUser]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const socket = socketService.connect(user.id);
      
      const handleNewMessage = (message: any) => {
        // Only show notification if:
        // 1. Message is NOT from the current user
        // 2. User is NOT currently in the conversation room
        const currentChatId = pathname?.split('/').pop();
        
        if (message.senderId !== user.id && message.conversationId !== currentChatId) {
          toast(
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => router.push(`/chat/${message.conversationId}`)}>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">New Message</p>
                <p className="text-sm font-bold text-slate-900 truncate">{message.senderName}</p>
                <p className="text-xs text-slate-500 truncate">{message.text}</p>
              </div>
            </div>,
            {
              duration: 4000,
              className: "rounded-3xl border-none shadow-2xl bg-white p-4",
            }
          );
        }
      };

      socket.on('receive_message', handleNewMessage);
      return () => {
        socket.off('receive_message', handleNewMessage);
      };
    }
  }, [isAuthenticated, user?.id, pathname, router]);

  if (!_hasHydrated) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="relative">
          <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-100 animate-pulse">
            <span className="text-white font-black text-2xl italic">M</span>
          </div>
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 w-1/2 animate-[shimmer_1.5s_infinite_linear]" />
          </div>
        </div>
      </div>
    );
  }

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
