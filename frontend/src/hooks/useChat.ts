import { useEffect, useState, useCallback } from 'react';
import { socketService } from '@/services/socket/socket';

export const useChat = (conversationId?: string, userId?: string) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const socket = socketService.connect();

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    if (conversationId) {
      socket.emit('join_conversation', conversationId);

      socket.on('receive_message', (message: any) => {
        if (message.conversationId === conversationId) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === message.id)) return prev;
            return [...prev, message];
          });
        }
      });

      socket.on('user_typing', (data: any) => {
        if (data.conversationId === conversationId && data.userId !== userId) {
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 3000);
        }
      });
    }

    return () => {
      if (conversationId) {
        socket.emit('leave_conversation', conversationId);
      }
      socket.off('connect');
      socket.off('disconnect');
      socket.off('receive_message');
      socket.off('user_typing');
    };
  }, [conversationId, userId]);

  const sendMessage = useCallback((text: string) => {
    const socket = socketService.getSocket();
    if (socket && conversationId) {
      socket.emit('send_message', { conversationId, text });
    }
  }, [conversationId]);

  const sendTyping = useCallback(() => {
    const socket = socketService.getSocket();
    if (socket && conversationId) {
      socket.emit('typing', { conversationId });
    }
  }, [conversationId]);

  return { messages, setMessages, isConnected, isTyping, sendMessage, sendTyping };
};
