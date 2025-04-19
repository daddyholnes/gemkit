import { ModelType } from '@/services/llm/modelRouter';

// Chat types
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  model?: ModelType;
}

export interface ChatProps {
  initialMessages?: Message[];
  onSendMessage?: (message: string, model: ModelType) => Promise<void>;
}

// Agent types
export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  tools: string[];
  model: ModelType;
  temperature: number;
  systemPrompt: string;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: 'search' | 'code' | 'data' | 'utility';
  requiresAuth: boolean;
}

// Sandbox types
export interface CodeExample {
  id: string;
  name: string;
  description: string;
  language: 'javascript' | 'python' | 'typescript' | 'shell';
  code: string;
} 