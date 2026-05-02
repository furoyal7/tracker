'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ChatScreen from '@/components/chat/ChatScreen';
import { useChat } from '@/hooks/useChat';
import api from '@/services/api';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';

export default function ChatRoomPage() {
  const { conversationId } = useParams();
  const [participantName, setParticipantName] = useState('Chat');
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const currentUserId = user?.id || '';

  const { messages, setMessages, sendMessage } = useChat(
    conversationId as string,
    currentUserId
  );

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const historyRes = await api.get(`/chat/messages/${conversationId}`) as any;
        setMessages(historyRes.data || []);
        
        // Fetch conversation details to get participant name
        const chatRes = await api.get(`/chat/conversations/${conversationId}`) as any;
        const chat = chatRes.data;
        if (chat) {
          const otherUser = chat.creatorId === currentUserId ? chat.participant : chat.creator;
          if (otherUser) {
            setParticipantName(otherUser.name || otherUser.username);
          }
        }
      } catch (error) {
        toast.error('Failed to load chat history');
      } finally {
        setLoading(false);
      }
    };

    if (conversationId && currentUserId) {
      fetchChatHistory();
    }
  }, [conversationId, currentUserId, setMessages]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#e5ddd5]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#075e54]"></div>
      </div>
    );
  }

  return (
    <ChatScreen
      conversationId={conversationId as string}
      participantName={participantName}
      currentUserId={currentUserId}
      messages={messages}
      onSendMessage={sendMessage}
    />
  );
}
