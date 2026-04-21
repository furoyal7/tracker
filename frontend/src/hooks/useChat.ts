import { useEffect, useState, useCallback } from 'react';
import { socketService } from '@/services/socket/socket';

export const useChat = (conversationId?: string, userId?: string) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = socketService.connect(userId);

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    if (conversationId) {
      socket.emit('join_conversation', conversationId);

      socket.on('receive_message', (message: any) => {
        if (message.conversationId === conversationId) {
          setMessages((prev) => {
            // Avoid duplicate messages
            if (prev.some((m) => m.id === message.id)) return prev;
            return [...prev, message];
          });
        }
      });
    }

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('receive_message');
    };
  }, [conversationId, userId]);

  const sendMessage = useCallback((text: string) => {
    const socket = socketService.getSocket();
    if (socket && conversationId && userId) {
      socket.emit('send_message', {
        conversationId,
        senderId: userId,
        text,
      });
    }
  }, [conversationId, userId]);

  return { messages, setMessages, isConnected, sendMessage };
};
