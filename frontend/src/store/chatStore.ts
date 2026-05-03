import { create } from 'zustand';
import api from '@/services/api';
import { socketService } from '@/services/socket/socket';

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  attachments: string[];
  createdAt: string;
  seenBy: { id: string }[];
  sender?: {
    id: string;
    username: string;
    name: string;
    avatarUrl: string;
  };
}

interface Chat {
  id: string;
  type: 'PRIVATE' | 'GROUP' | 'SUPPORT';
  updatedAt: string;
  participants: {
    id: string;
    username: string;
    name: string;
    avatarUrl: string;
    isOnline: boolean;
    lastSeen: string;
  }[];
  messages: Message[];
}

interface ChatState {
  conversations: Chat[];
  activeChatId: string | null;
  messages: Record<string, Message[]>; // chatId -> messages
  onlineUsers: string[];
  typingUsers: Record<string, string[]>; // chatId -> userIds
  loading: boolean;

  // Actions
  fetchConversations: () => Promise<void>;
  fetchMessages: (chatId: string) => Promise<void>;
  setActiveChat: (chatId: string | null) => void;
  sendMessage: (chatId: string, text: string, attachments?: string[]) => Promise<void>;
  receiveMessage: (message: Message) => void;
  setOnlineUsers: (userIds: string[]) => void;
  setTyping: (chatId: string, userId: string, isTyping: boolean) => void;
  markSeen: (chatId: string, messageIds: string[]) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeChatId: null,
  messages: {},
  onlineUsers: [],
  typingUsers: {},
  loading: false,

  fetchConversations: async () => {
    set({ loading: true });
    try {
      const response: any = await api.get('/chat/list');
      set({ conversations: response.data || [] });
    } catch (error: any) {
      if (error._isCancelled) return;
      console.error('Failed to fetch conversations', error);
    } finally {
      set({ loading: false });
    }
  },

  fetchMessages: async (chatId) => {
    try {
      const response: any = await api.get(`/message/${chatId}`);
      set((state) => ({
        messages: {
          ...state.messages,
          [chatId]: response.data || []
        }
      }));
    } catch (error: any) {
      if (error._isCancelled) return;
      console.error('Failed to fetch messages', error);
    }
  },

  setActiveChat: (chatId) => set({ activeChatId: chatId }),

  sendMessage: async (chatId, text, attachments = []) => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('sendMessage', { chatId, text, attachments });
    }
  },

  receiveMessage: (message) => {
    set((state) => {
      const chatMessages = state.messages[message.chatId] || [];
      // Prevent duplicates
      if (chatMessages.find((m) => m.id === message.id)) return state;

      return {
        messages: {
          ...state.messages,
          [message.chatId]: [...chatMessages, message]
        },
        // Update conversation last message/updatedAt
        conversations: state.conversations.map((c) => 
          c.id === message.chatId 
            ? { ...c, updatedAt: message.createdAt } 
            : c
        ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      };
    });
  },

  setOnlineUsers: (userIds) => set({ onlineUsers: userIds }),

  setTyping: (chatId, userId, isTyping) => {
    set((state) => {
      const currentTyping = state.typingUsers[chatId] || [];
      const updatedTyping = isTyping 
        ? [...new Set([...currentTyping, userId])]
        : currentTyping.filter(id => id !== userId);
      
      return {
        typingUsers: {
          ...state.typingUsers,
          [chatId]: updatedTyping
        }
      };
    });
  },

  markSeen: (chatId, messageIds) => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('markSeen', { chatId, messageIds });
    }
    
    // Optimistic update
    set((state) => {
      const chatMessages = state.messages[chatId] || [];
      // This is simplified, real logic would update seenBy array
      return state;
    });
  }
}));
