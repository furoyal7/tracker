'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, Send, Check, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
  seenBy: { id: string }[];
}

interface ChatScreenProps {
  chatId: string;
  participant: any;
  currentUserId: string;
  messages: Message[];
  onSendMessage: (text: string) => void;
  onTyping?: (isTyping: boolean) => void;
  isTyping?: boolean;
  isOnline?: boolean;
}

export default function ChatScreen({
  chatId,
  participant,
  currentUserId,
  messages,
  onSendMessage,
  onTyping,
  isTyping,
  isOnline,
}: ChatScreenProps) {
  const [inputText, setInputText] = useState('');
  const { t } = useTranslation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
      onTyping?.(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    onTyping?.(true);
    typingTimeoutRef.current = setTimeout(() => {
      onTyping?.(false);
    }, 2000);
  };

  const participantName = participant?.name || participant?.username || 'Chat';

  return (
    <div className="flex flex-col h-screen bg-[#efeae2] max-w-md mx-auto relative overflow-hidden font-sans">
      {/* Premium Header */}
      <div className="flex items-center px-4 py-4 bg-[#075e54] text-white shadow-xl z-20">
        <Link href="/chat" className="mr-3 p-1 hover:bg-white/10 rounded-full transition-all active:scale-90">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <div className="relative mr-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-lg overflow-hidden border border-white/10">
            {participant?.avatarUrl ? (
              <img src={participant.avatarUrl} alt={participantName} className="w-full h-full object-cover" />
            ) : (
              participantName[0]?.toUpperCase()
            )}
          </div>
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#25d366] border-2 border-[#075e54] rounded-full" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-base leading-tight truncate">{participantName}</h2>
          {isTyping ? (
            <p className="text-[10px] text-[#25d366] animate-pulse font-bold uppercase tracking-widest">{t('chat.typing')}</p>
          ) : (
            <p className="text-[10px] text-white/70 font-medium">{isOnline ? t('chat.online') : t('chat.offline')}</p>
          )}
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          const isSeen = msg.seenBy?.some(p => p.id !== currentUserId);
          
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div
                className={`max-w-[85%] px-3 py-1.5 rounded-xl shadow-sm relative group ${
                  isMe
                    ? 'bg-[#dcf8c6] text-gray-900 rounded-tr-none'
                    : 'bg-white text-gray-900 rounded-tl-none'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                <div className="flex justify-end items-center gap-1 mt-0.5">
                  <span className="text-[9px] font-medium text-gray-500/80 uppercase">
                    {format(new Date(msg.createdAt), 'HH:mm')}
                  </span>
                  {isMe && (
                    <span className={isSeen ? 'text-blue-500' : 'text-gray-400'}>
                      {isSeen ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                    </span>
                  )}
                </div>
                {/* Bubble tail */}
                <div 
                  className={`absolute top-0 w-2.5 h-2.5 ${
                    isMe 
                      ? 'right-[-3px] bg-[#dcf8c6] [clip-path:polygon(0_0,0_100%,100%_0)]' 
                      : 'left-[-3px] bg-white [clip-path:polygon(100%_0,100%_100%,0_0)]'
                  }`}
                />
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Premium Input Area */}
      <div className="bg-[#f0f2f5] p-3 flex items-center gap-2 border-t border-gray-200/50">
        <form onSubmit={handleSend} className="flex-1 flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            placeholder={t('chat.typeMessage')}
            className="flex-1 bg-white px-5 py-3 rounded-2xl text-sm outline-none shadow-sm border border-transparent focus:border-[#25d366]/30 transition-all placeholder:text-gray-400"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-12 h-12 bg-[#128c7e] text-white rounded-full flex items-center justify-center shadow-lg disabled:opacity-50 disabled:grayscale transition-all active:scale-90"
          >
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        </form>
      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.08);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
