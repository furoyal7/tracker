'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, Send } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
}

interface ChatScreenProps {
  conversationId: string;
  participantName: string;
  currentUserId: string;
  messages: Message[];
  onSendMessage: (text: string) => void;
}

export default function ChatScreen({
  conversationId,
  participantName,
  currentUserId,
  messages,
  onSendMessage,
}: ChatScreenProps) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#e5ddd5] max-w-md mx-auto relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center px-4 py-3 bg-[#075e54] text-white shadow-md z-10">
        <Link href="/chat" className="mr-4">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#075e54] font-bold mr-3 overflow-hidden">
          {participantName[0].toUpperCase()}
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-lg leading-tight">{participantName}</h2>
          <p className="text-xs text-green-100">online</p>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm relative ${
                  isMe
                    ? 'bg-[#dcf8c6] text-gray-900 rounded-tr-none'
                    : 'bg-white text-gray-900 rounded-tl-none'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <div className="flex justify-end mt-1">
                  <span className="text-[10px] text-gray-500">
                    {format(new Date(msg.createdAt), 'HH:mm')}
                  </span>
                </div>
                {/* Bubble tail simulation */}
                <div 
                  className={`absolute top-0 w-2 h-2 ${
                    isMe 
                      ? 'right-[-2px] bg-[#dcf8c6] [clip-path:polygon(0_0,0_100%,100%_0)]' 
                      : 'left-[-2px] bg-white [clip-path:polygon(100%_0,100%_100%,0_0)]'
                  }`}
                />
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <div className="bg-[#f0f0f0] p-3 flex items-center gap-2 shadow-inner">
        <form onSubmit={handleSend} className="flex-1 flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message"
            className="flex-1 bg-white px-4 py-2 rounded-full text-sm outline-none border border-gray-200 focus:border-[#25d366]"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-10 h-10 bg-[#128c7e] text-white rounded-full flex items-center justify-center disabled:opacity-50 transition-all active:scale-95"
          >
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        </form>
      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
