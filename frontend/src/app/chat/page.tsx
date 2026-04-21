'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Plus, Search, MoreVertical } from 'lucide-react';
import ChatList from '@/components/chat/ChatList';
import api from '@/services/api';
import { toast } from 'sonner';

export default function ChatListPage() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await api.get('/chat/conversations') as any;
        setConversations(data);
      } catch (error: any) {
        toast.error('Failed to load conversations');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-white max-w-md mx-auto shadow-xl relative overflow-hidden">
      {/* Premium WhatsApp-style Header */}
      <div className="px-4 py-4 bg-[#075e54] text-white shadow-lg z-20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="hover:bg-white/10 p-1.5 rounded-full transition-all active:scale-90">
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-xl font-bold tracking-tight">Messages</h1>
          </div>
          <div className="flex items-center gap-4">
            <Search className="w-5 h-5 opacity-80 cursor-pointer hover:opacity-100" />
            <MoreVertical className="w-5 h-5 opacity-80 cursor-pointer hover:opacity-100" />
          </div>
        </div>
        
        {/* Quick Filters / Status Row */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1 text-sm font-medium opacity-90">
          <span className="border-b-2 border-white pb-1 px-1">All</span>
          <span className="opacity-60 px-1">Unread</span>
          <span className="opacity-60 px-1">Groups</span>
        </div>
      </div>
      
      {/* Search Bar (Sub-header) */}
      <div className="p-3 bg-white border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search or start new chat" 
            className="w-full bg-gray-50 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-[#25d366] transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 gap-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#075e54]"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-4 w-4 bg-[#075e54]/20 rounded-full"></div>
              </div>
            </div>
            <p className="text-xs font-bold text-[#075e54] uppercase tracking-widest animate-pulse">Syncing Secure Chats</p>
          </div>
        ) : (
          <ChatList conversations={conversations} />
        )}
      </div>

      {/* Floating Action Button for New Chat */}
      <button className="absolute bottom-24 right-6 w-14 h-14 bg-[#25d366] text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-[#128c7e] transition-all active:scale-95 z-30 group">
        <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Premium Tab Bar */}
      <div className="border-t border-gray-100 p-2 flex justify-around bg-gray-50/80 backdrop-blur-md pb-safe">
        <div className="flex flex-col items-center gap-1 text-[#075e54] px-4 py-1">
          <div className="relative">
            <div className="w-6 h-6 bg-[#075e54] rounded-full flex items-center justify-center shadow-sm">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            </div>
            {conversations.length > 0 && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full" />}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest">Chats</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-gray-400 opacity-60 px-4 py-1 hover:opacity-100 transition-opacity">
          <div className="w-6 h-6 bg-gray-200 rounded-full" />
          <span className="text-[10px] font-medium uppercase tracking-widest">Status</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-gray-400 opacity-60 px-4 py-1 hover:opacity-100 transition-opacity">
          <div className="w-6 h-6 bg-gray-200 rounded-full" />
          <span className="text-[10px] font-medium uppercase tracking-widest">Calls</span>
        </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
