import { create } from 'zustand';
import api from '@/services/api';
import { socketService } from '@/services/socket/socket';
import { useAuthStore } from '@/store/authStore';

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
  unreadCounts: Record<string, number>; // chatId -> count
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
  setSeen: (chatId: string, messageIds: string[], userId: string) => void;
  deleteMessage: (chatId: string, messageId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeChatId: null,
  messages: {},
  onlineUsers: [],
  typingUsers: {},
  unreadCounts: {},
  loading: false,

  fetchConversations: async () => {
    set({ loading: true });
    try {
      const response: any = await api.get('/chat/list');
      const conversations = response.data || [];
      
      const unreadCounts: Record<string, number> = {};
      conversations.forEach((chat: any) => {
        unreadCounts[chat.id] = chat._count?.messages || 0;
      });

      set({ conversations, unreadCounts });
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
      console.log(`[ChatStore] fetchMessages response for ${chatId}:`, response);
      const messagesArray = response.data || [];
      
      set((state) => ({
        messages: {
          ...state.messages,
          [chatId]: Array.isArray(messagesArray) ? messagesArray : []
        }
      }));
    } catch (error: any) {
      if (error._isCancelled) return;
      console.error('Failed to fetch messages', error);
    }
  },

  setActiveChat: (chatId) => set({ activeChatId: chatId }),

  sendMessage: async (chatId, text, attachments = []) => {
    const authStore = useAuthStore?.getState?.();
    const user = authStore?.user;

    if (!user) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      chatId,
      senderId: user.id,
      text,
      attachments,
      createdAt: new Date().toISOString(),
      seenBy: [{ id: user.id }],
      sender: {
        id: user.id,
        username: user.username || '',
        name: user.name || '',
        avatarUrl: user.avatarUrl || ''
      }
    };

    // Add optimistically
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: [...(state.messages[chatId] || []), optimisticMessage]
      },
      conversations: state.conversations.map(c => 
        c.id === chatId ? { ...c, updatedAt: optimisticMessage.createdAt, messages: [optimisticMessage] } : c
      ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    }));

    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('sendMessage', { chatId, text, attachments });
    }
  },

  receiveMessage: (message) => {
    const { activeChatId } = get();
    const authStore = useAuthStore?.getState?.();
    const user = authStore?.user;


    set((state) => {
      const chatMessages = Array.isArray(state.messages[message.chatId]) ? state.messages[message.chatId] : [];
      
      // Handle optimistic message replacement if it's from current user
      let updatedMessages;
      if (message.senderId === user?.id) {
        // Find if there's a temp message with same text (approximate match)
        const tempMsgIndex = chatMessages.findIndex(m => m.id.startsWith('temp-') && m.text === message.text);
        if (tempMsgIndex !== -1) {
          updatedMessages = [...chatMessages];
          updatedMessages[tempMsgIndex] = message;
        } else {
          updatedMessages = chatMessages.find(m => m.id === message.id) ? chatMessages : [...chatMessages, message];
        }
      } else {
        updatedMessages = chatMessages.find(m => m.id === message.id) ? chatMessages : [...chatMessages, message];
      }

      // Update unread count if chat is not active
      const newUnreadCounts = { ...state.unreadCounts };
      if (activeChatId !== message.chatId && message.senderId !== user?.id) {
        newUnreadCounts[message.chatId] = (newUnreadCounts[message.chatId] || 0) + 1;
      }

      return {
        messages: {
          ...state.messages,
          [message.chatId]: updatedMessages
        },
        unreadCounts: newUnreadCounts,
        // Update conversation last message/updatedAt
        conversations: state.conversations.map((c) => 
          c.id === message.chatId 
            ? { ...c, updatedAt: message.createdAt, messages: [message] } 
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
    
    set((state) => {
      const authStore = useAuthStore?.getState?.();
      const user = authStore?.user;
      if (!user) return state;

      const chatMessages = state.messages[chatId] || [];
      const updatedMessages = chatMessages.map(m => {
        if (messageIds.includes(m.id)) {
          const alreadySeen = m.seenBy.some(p => p.id === user.id);
          if (!alreadySeen) {
            return { ...m, seenBy: [...m.seenBy, { id: user.id }] };
          }
        }
        return m;
      });

      return {
        messages: {
          ...state.messages,
          [chatId]: updatedMessages
        },
        unreadCounts: {
          ...state.unreadCounts,
          [chatId]: 0
        }
      };
    });
  },

  setSeen: (chatId, messageIds, userId) => {
    set((state) => {
      const chatMessages = state.messages[chatId] || [];
      const updatedMessages = chatMessages.map(m => {
        if (messageIds.includes(m.id)) {
          const alreadySeen = m.seenBy.some(p => p.id === userId);
          if (!alreadySeen) {
            return { ...m, seenBy: [...m.seenBy, { id: userId }] };
          }
        }
        return m;
      });

      return {
        messages: {
          ...state.messages,
          [chatId]: updatedMessages
        }
      };
    });
  },

  deleteMessage: (chatId, messageId) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: (state.messages[chatId] || []).filter(m => m.id !== messageId)
      }
    }));
  }
}));
