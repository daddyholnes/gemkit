import OpenAI from 'openai';
import { ModelOptions, ChatMessage } from './geminiService';
import type { ChatCompletionMessageParam } from 'openai/resources';

// Define TypeScript types for OpenAI chat messages
type OpenAIChatRole = 'system' | 'user' | 'assistant' | 'function' | 'tool';

interface OpenAIChatMessage {
  role: OpenAIChatRole;
  content: string;
  name?: string;
}

export class OpenAIService {
  private openai: OpenAI;
  
  constructor() {
    const apiKey = process.env.OPENAI_API_KEY || '';
    if (!apiKey) {
      throw new Error('OpenAI API key is not defined in environment variables');
    }
    
    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }
  
  /**
   * Generate a response from OpenAI model
   */
  async generateText(prompt: string, options: ModelOptions = {}, model: string = 'gpt-4-turbo'): Promise<string> {
    try {
      const completion = await this.openai.completions.create({
        model,
        prompt,
        max_tokens: options.maxOutputTokens || 2048,
        temperature: options.temperature || 0.7,
        top_p: options.topP || 0.95,
        n: 1,
      });
      
      return completion.choices[0]?.text || '';
    } catch (error) {
      console.error('Error generating text with OpenAI:', error);
      throw error;
    }
  }
  
  /**
   * Generate a streaming response from OpenAI model
   */
  async *generateTextStream(prompt: string, options: ModelOptions = {}, model: string = 'gpt-4-turbo'): AsyncGenerator<string> {
    try {
      const completion = await this.openai.completions.create({
        model,
        prompt,
        max_tokens: options.maxOutputTokens || 2048,
        temperature: options.temperature || 0.7,
        top_p: options.topP || 0.95,
        n: 1,
        stream: true,
      });
      
      for await (const chunk of completion) {
        if (chunk.choices[0]?.text) {
          yield chunk.choices[0].text;
        }
      }
    } catch (error) {
      console.error('Error streaming text with OpenAI:', error);
      throw error;
    }
  }
  
  /**
   * Process a chat conversation with OpenAI
   */
  async chatWithHistory(messages: ChatMessage[], options: ModelOptions = {}, model: string = 'gpt-4-turbo'): Promise<string> {
    try {
      // Convert our generic message format to OpenAI's format
      const openAIMessages: ChatCompletionMessageParam[] = messages.map(msg => {
        if (msg.role === 'assistant') {
          return { role: 'assistant', content: msg.content };
        } else if (msg.role === 'system') {
          return { role: 'system', content: msg.content };
        } else {
          return { role: 'user', content: msg.content };
        }
      });
      
      const chatCompletion = await this.openai.chat.completions.create({
        model,
        messages: openAIMessages,
        max_tokens: options.maxOutputTokens || 2048,
        temperature: options.temperature || 0.7,
        top_p: options.topP || 0.95,
      });
      
      return chatCompletion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error in chat with OpenAI:', error);
      throw error;
    }
  }
  
  /**
   * Process a streaming chat conversation with OpenAI
   */
  async *chatWithHistoryStream(messages: ChatMessage[], options: ModelOptions = {}, model: string = 'gpt-4-turbo'): AsyncGenerator<string> {
    try {
      // Convert our generic message format to OpenAI's format
      const openAIMessages: ChatCompletionMessageParam[] = messages.map(msg => {
        if (msg.role === 'assistant') {
          return { role: 'assistant', content: msg.content };
        } else if (msg.role === 'system') {
          return { role: 'system', content: msg.content };
        } else {
          return { role: 'user', content: msg.content };
        }
      });
      
      const stream = await this.openai.chat.completions.create({
        model,
        messages: openAIMessages,
        max_tokens: options.maxOutputTokens || 2048,
        temperature: options.temperature || 0.7,
        top_p: options.topP || 0.95,
        stream: true,
      });
      
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }
    } catch (error) {
      console.error('Error in streaming chat with OpenAI:', error);
      throw error;
    }
  }
} 