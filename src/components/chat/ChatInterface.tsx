'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ModelType, MODELS } from '@/services/llm/modelRouter';
import { ChatMessage, ChatService } from '@/services/firebase/chatService';

interface ChatInterfaceProps {
  initialMessages?: ChatMessage[];
  conversationId?: string;
  userId?: string;
  onTitleChange?: (title: string) => void;
}

export default function ChatInterface({ 
  initialMessages = [], 
  conversationId,
  userId = 'anonymous-user', // Default for development
  onTitleChange 
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelType>('gemini-1.5-pro');
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatService = new ChatService();
  
  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Set title based on first user message if it's a new conversation
  useEffect(() => {
    if (messages.length > 0 && !conversationId && onTitleChange) {
      const firstUserMessage = messages.find(m => m.role === 'user');
      if (firstUserMessage) {
        // Generate title from first few words
        const words = firstUserMessage.content.split(' ');
        const title = words.slice(0, 5).join(' ') + (words.length > 5 ? '...' : '');
        onTitleChange(title);
      }
    }
  }, [messages, conversationId, onTitleChange]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;
    
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: Date.now(),
    };
    
    // Add user message to UI immediately
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);
    
    try {
      // If we have a conversation ID, add message to Firestore
      if (conversationId) {
        await chatService.addMessage(conversationId, {
          role: userMessage.role,
          content: userMessage.content,
          model: selectedModel,
        });
      }
      
      // Get AI response
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          model: selectedModel,
          userId: userId,
          conversationId: conversationId,
          includeMemory: true,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }
      
      const data = await response.json();
      
      // Create the assistant message
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.response,
        timestamp: Date.now(),
        model: selectedModel,
      };
      
      // Add to UI
      setMessages(prev => [...prev, assistantMessage]);
      
      // If we have a conversation ID, add to Firestore
      if (conversationId) {
        await chatService.addMessage(conversationId, {
          role: assistantMessage.role,
          content: assistantMessage.content,
          model: selectedModel,
        });
      }
      // If we don't have a conversation ID, create a new one
      else if (userId !== 'anonymous-user') {
        const title = userMessage.content.split(' ').slice(0, 5).join(' ') + 
          (userMessage.content.split(' ').length > 5 ? '...' : '');
        
        const newConversationId = await chatService.createConversation(
          userId,
          title,
          userMessage
        );
        
        // Add the assistant message to the new conversation
        await chatService.addMessage(newConversationId, {
          role: assistantMessage.role,
          content: assistantMessage.content,
          model: selectedModel,
        });
        
        // Notify parent of new conversation if needed
        if (onTitleChange) {
          onTitleChange(title);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to get a response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex h-full flex-col">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">AI Chat</h2>
        
        {/* Model Selector */}
        <div>
          <select
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as ModelType)}
          >
            {Object.values(MODELS).map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4 dark:bg-gray-900">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 rounded-full bg-primary-100 p-3 text-primary-600 dark:bg-primary-900 dark:text-primary-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
              Start a conversation
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Send a message to begin chatting with the AI
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-3xl rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : message.role === 'system'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                      : 'bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                  } ${message.role !== 'user' ? 'shadow' : ''}`}
                >
                  {message.content}
                  {message.model && (
                    <div className="mt-1 text-xs opacity-70">
                      via {MODELS[message.model]?.name || message.model}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {error && (
              <div className="flex justify-center">
                <div className="rounded-lg bg-red-100 px-4 py-2 text-red-800 dark:bg-red-900 dark:text-red-200">
                  {error}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 rounded-md border border-gray-300 px-4 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="rounded-md bg-primary-600 px-4 py-2 text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={isLoading || !inputValue.trim()}
          >
            {isLoading ? (
              <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
} 