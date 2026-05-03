'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ChatScreen from '@/components/chat/ChatScreen';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { socketService } from '@/services/socket/socket';

export default function ChatRoomPage() {
  const { chatId } = useParams();
  const { user } = useAuthStore();
  const { 
    messages, 
    fetchMessages, 
    sendMessage, 
    receiveMessage,
    onlineUsers,
    typingUsers,
    markSeen
  } = useChatStore();
  
  const [participant, setParticipant] = useState<any>(null);
  const currentUserId = user?.id || '';
  const chatIdStr = chatId as string;

  useEffect(() => {
    if (chatIdStr && currentUserId) {
      fetchMessages(chatIdStr);
      
      // Join chat room
      socketService.emit('joinChat', chatIdStr);
      
      // Fetch participant info (from store conversations if possible)
      const fetchInfo = async () => {
        try {
          const { conversations } = useChatStore.getState();
          const currentChat = conversations.find(c => c.id === chatIdStr);
          if (currentChat) {
            const other = currentChat.participants.find(p => p.id !== currentUserId);
            setParticipant(other);
          } else {
            // Fallback: fetch from API
            const { data }: any = await import('@/services/api').then(m => m.default.get(`/chat/${chatIdStr}`));
            const other = data.participants.find((p: any) => p.id !== currentUserId);
            setParticipant(other);
          }
        } catch (error) {
          console.error('Failed to fetch participant info', error);
        }
      };
      
      fetchInfo();

      return () => {
        socketService.emit('leaveChat', chatIdStr);
      };
    }
  }, [chatIdStr, currentUserId, fetchMessages]);

  // Mark as seen when new messages arrive and we are on this page
  useEffect(() => {
    const chatMessages = messages[chatIdStr] || [];
    const unseenIds = chatMessages
      .filter(m => m.senderId !== currentUserId && !m.seenBy.some(p => p.id === currentUserId))
      .map(m => m.id);
    
    if (unseenIds.length > 0) {
      markSeen(chatIdStr, unseenIds);
    }
  }, [messages, chatIdStr, currentUserId, markSeen]);

  const handleTyping = (isTyping: boolean) => {
    socketService.emit('typing', { chatId: chatIdStr, isTyping });
  };

  const isOtherTyping = typingUsers[chatIdStr]?.some(id => id !== currentUserId);
  const isOnline = participant && (onlineUsers.includes(participant.id) || participant.isOnline);

  return (
    <ChatScreen
      chatId={chatIdStr}
      participant={participant}
      currentUserId={currentUserId}
      messages={messages[chatIdStr] || []}
      onSendMessage={(text) => sendMessage(chatIdStr, text)}
      onTyping={handleTyping}
      isTyping={isOtherTyping}
      isOnline={isOnline}
    />
  );
}
