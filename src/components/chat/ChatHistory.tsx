'use client';

import { useState, useEffect } from 'react';
import { Conversation } from '@/services/firebase/chatService';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clientDb } from '@/services/firebase/firebaseConfig';

interface ChatHistoryProps {
  userId: string;
}

export default function ChatHistory({ userId }: ChatHistoryProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  
  useEffect(() => {
    async function fetchConversations() {
      try {
        setIsLoading(true);
        
        const conversationsRef = collection(clientDb, 'conversations');
        const q = query(
          conversationsRef,
          where('userId', '==', userId),
          where('deleted', '==', false),
          orderBy('updatedAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const fetchedConversations = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Conversation[];
        
        setConversations(fetchedConversations);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (userId) {
      fetchConversations();
    }
  }, [userId]);
  
  function formatDate(timestamp: any): string {
    if (!timestamp) return 'Unknown date';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
    // If today, show time
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If this year, show month and day
    if (date.getFullYear() === today.getFullYear()) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    
    // Otherwise show full date
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  }
  
  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Loading conversations...</h2>
        </div>
        <div className="animate-pulse space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }
  
  if (conversations.length === 0) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Chat History</h2>
        </div>
        <div className="text-center p-4">
          <p className="text-gray-500 dark:text-gray-400">No conversations yet</p>
          <Link 
            href="/chat/new" 
            className="mt-2 inline-block text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Start a new chat
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Chat History</h2>
        <Link 
          href="/chat/new" 
          className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
        >
          New Chat
        </Link>
      </div>
      
      <div className="space-y-2">
        {conversations.map((conversation) => (
          <Link
            key={conversation.id}
            href={`/chat/${conversation.id}`}
            passHref
          >
            <div 
              className={`cursor-pointer rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                pathname === `/chat/${conversation.id}` 
                  ? 'bg-gray-100 dark:bg-gray-700' 
                  : ''
              }`}
            >
              <h3 className="text-sm font-medium text-gray-800 dark:text-white truncate">
                {conversation.title || 'Untitled Conversation'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {conversation.lastMessage}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {formatDate(conversation.updatedAt)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 