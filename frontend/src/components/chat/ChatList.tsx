'use client';

import React from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { useTranslation } from 'react-i18next';

interface ChatListProps {
  conversations: any[];
}

export default function ChatList({ conversations }: ChatListProps) {
  const { user: currentUser } = useAuthStore();
  const { onlineUsers } = useChatStore();
  const { t } = useTranslation();

  const formatDate = (date: string) => {
    const d = new Date(date);
    if (isToday(d)) return format(d, 'HH:mm');
    if (isYesterday(d)) return t('chat.yesterday');
    return format(d, 'dd/MM/yy');
  };

  return (
    <div className="flex flex-col w-full h-full bg-white divide-y divide-gray-100">
      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center h-full">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
             <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
          </div>
          <p className="text-gray-400 font-medium">{t('chat.startNewConversation')}</p>
        </div>
      ) : (
        conversations.map((chat) => {
          // Filter out current user to find the "other" participant(s)
          const participants = chat.participants || [];
          const otherParticipants = participants.filter((p: any) => p.id !== currentUser?.id);
          
          // For PRIVATE chats, we show the one other user. For GROUP, we might show a group name or multi-avatar.
          const otherUser = otherParticipants[0] || { name: 'Unknown', username: 'unknown' };
          const lastMessage = chat.messages?.[0];
          const displayName = otherUser.name || otherUser.username;
          const isOnline = onlineUsers.includes(otherUser.id) || otherUser.isOnline;
          
          return (
            <Link
              key={chat.id}
              href={`/chat/${chat.id}`}
              className="flex items-center p-4 hover:bg-gray-50 transition-all active:scale-[0.98]"
            >
              <div className="relative mr-4">
                <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-[#075e54] font-bold text-xl overflow-hidden shadow-inner border border-gray-50">
                  {otherUser.avatarUrl ? (
                    <img src={otherUser.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    displayName[0]?.toUpperCase() || '?'
                  )}
                </div>
                {isOnline && (
                  <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-[#25d366] border-2 border-white rounded-full shadow-sm" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-gray-900 truncate">
                    {displayName}
                  </h3>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                    {chat.updatedAt ? formatDate(chat.updatedAt) : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500 truncate font-medium">
                    {lastMessage ? lastMessage.text : t('chat.noMessages')}
                  </p>
                  {/* Unread dot placeholder */}
                  {/* <div className="w-2 h-2 bg-[#25d366] rounded-full ml-2" /> */}
                </div>
              </div>
            </Link>
          );
        })
      )}
    </div>
  );
}
