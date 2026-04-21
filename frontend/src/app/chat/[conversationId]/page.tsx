'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ChatScreen from '@/components/chat/ChatScreen';
import { useChat } from '@/hooks/useChat';
import api from '@/services/api';
import { toast } from 'sonner';

export default function ChatRoomPage() {
  const { conversationId } = useParams();
  const [participantName, setParticipantName] = useState('Chat');
  const [currentUserId, setCurrentUserId] = useState('');
  const [loading, setLoading] = useState(true);

  // Mocking userId for demonstration if not found
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUserId(user.id || 'user-' + Math.random().toString(36).substr(2, 9));
  }, []);

  const { messages, setMessages, sendMessage } = useChat(
    conversationId as string,
    currentUserId
  );

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const history = await api.get(`/chat/messages/${conversationId}`) as any;
        setMessages(history);
        
        // Also fetch conversation details to get participant name
        const conversations = await api.get('/chat/conversations') as any;
        const currentChat = conversations.find((c: any) => c.id === conversationId);
        if (currentChat) {
          setParticipantName(currentChat.participantName);
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
