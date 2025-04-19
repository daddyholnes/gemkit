'use client';

import { useState } from 'react';
import ChatInterface from "@/components/chat/ChatInterface";
import ChatHistory from "@/components/chat/ChatHistory";
import ContextPanel from "@/components/chat/ContextPanel";

export default function ChatPage() {
  // For demo purposes, using a hard-coded user ID
  // In a real app, this would come from authentication
  const [userId] = useState('demo-user-123');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  
  return (
    <div className="flex h-screen flex-col">
      <div className="flex h-full">
        {/* Sidebar: Chat History */}
        <div className="w-64 border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <ChatHistory userId={userId} />
        </div>
        
        {/* Main Chat Area */}
        <div className="flex-1">
          <ChatInterface 
            userId={userId}
            conversationId={selectedConversationId || undefined}
            onTitleChange={(title) => console.log('New conversation:', title)}
          />
        </div>
        
        {/* Sidebar: Context & Tools */}
        <div className="w-64 border-l border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <ContextPanel 
            userId={userId}
            conversationId={selectedConversationId || undefined}
          />
        </div>
      </div>
    </div>
  );
} 