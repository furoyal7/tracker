'use client';

import { useEffect } from 'react';
import { socketService } from '@/services/socket/socket';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';

export default function SocketInitializer() {
  const { user } = useAuthStore();
  const { receiveMessage, setOnlineUsers, setTyping } = useChatStore();

  useEffect(() => {
    if (user?.id) {
      const socket = socketService.connect();

      socket.on('receiveMessage', (message) => {
        receiveMessage(message);
      });

      socket.on('onlineUsers', (userIds) => {
        setOnlineUsers(userIds);
      });

      socket.on('typing', ({ chatId, userId, isTyping }) => {
        setTyping(chatId, userId, isTyping);
      });

      return () => {
        socket.off('receiveMessage');
        socket.off('onlineUsers');
        socket.off('typing');
      };
    } else {
      socketService.disconnect();
    }
  }, [user?.id, receiveMessage, setOnlineUsers, setTyping]);

  return null;
}
