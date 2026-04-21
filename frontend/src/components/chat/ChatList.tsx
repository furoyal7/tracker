'use client';

import React from 'react';
import { format } from 'date-fns';
import Link from 'next/link';

interface Conversation {
  id: string;
  participantName: string;
  messages: { text: string; createdAt: string }[];
  updatedAt: string;
}

interface ChatListProps {
  conversations: Conversation[];
}

export default function ChatList({ conversations }: ChatListProps) {
  return (
    <div className="flex flex-col w-full h-full bg-white divide-y divide-gray-100">
      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-gray-500">
          <p>No conversations yet.</p>
        </div>
      ) : (
        conversations.map((chat) => {
          const lastMessage = chat.messages[0];
          return (
            <Link
              key={chat.id}
              href={`/chat/${chat.id}`}
              className="flex items-center p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-4">
                {chat.participantName[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {chat.participantName}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {format(new Date(chat.updatedAt), 'HH:mm')}
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate">
                  {lastMessage ? lastMessage.text : 'No messages'}
                </p>
              </div>
            </Link>
          );
        })
      )}
    </div>
  );
}
