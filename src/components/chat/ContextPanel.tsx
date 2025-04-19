'use client';

import { useState, useEffect } from 'react';
import { MemoryEntry } from '@/services/memory/contextManager';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { clientDb } from '@/services/firebase/firebaseConfig';

interface ContextPanelProps {
  userId: string;
  conversationId?: string;
}

export default function ContextPanel({ userId, conversationId }: ContextPanelProps) {
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    async function fetchMemories() {
      // Don't fetch if we don't have a user id
      if (!userId || userId === 'anonymous-user') {
        setMemories([]);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Create a query to get the most recent or relevant memories
        const memoriesRef = collection(clientDb, 'memories');
        let q;
        
        if (conversationId) {
          // If we have a conversation ID, get memories for that conversation
          q = query(
            memoriesRef,
            where('userId', '==', userId),
            where('conversationId', '==', conversationId),
            orderBy('createdAt', 'desc'),
            limit(5)
          );
        } else {
          // Otherwise just get the most recent memories for this user
          q = query(
            memoriesRef,
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(5)
          );
        }
        
        const querySnapshot = await getDocs(q);
        const fetchedMemories = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as MemoryEntry[];
        
        setMemories(fetchedMemories);
      } catch (error) {
        console.error('Error fetching memories:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchMemories();
  }, [userId, conversationId]);
  
  function formatDate(timestamp: any): string {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  }
  
  return (
    <div className="p-4">
      <h2 className="mb-4 text-lg font-semibold text-gray-700 dark:text-gray-200">Context & Memory</h2>
      
      <div className="mb-4">
        <h3 className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-300">Active Memory</h3>
        <div className="rounded-md bg-gray-50 p-2 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
          <p>Your conversations are saved and can be referenced by the AI in future chats.</p>
        </div>
      </div>
      
      <div className="mb-4">
        <h3 className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-300">Recent Memories</h3>
        
        {isLoading ? (
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        ) : memories.length === 0 ? (
          <div className="rounded-md bg-gray-50 p-2 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
            <p>No memories available yet. Start chatting to create some!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {memories.map((memory) => (
              <div key={memory.id} className="rounded-md border border-gray-200 p-2 dark:border-gray-700">
                <p className="text-xs text-gray-800 dark:text-gray-200 line-clamp-2">
                  {memory.content}
                </p>
                <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                  <span>{memory.type}</span>
                  <span>{formatDate(memory.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <h3 className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-300">Available Tools</h3>
        <div className="space-y-1">
          <div className="rounded-md p-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700">
            <span className="font-medium">Web Search</span>
          </div>
          <div className="rounded-md p-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700">
            <span className="font-medium">File Upload</span>
          </div>
          <div className="rounded-md p-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700">
            <span className="font-medium">Code Interpreter</span>
          </div>
        </div>
      </div>
    </div>
  );
} 