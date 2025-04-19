import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

export interface ModelOptions {
  temperature?: number;
  maxOutputTokens?: number;
  topK?: number;
  topP?: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export class GeminiService {
  private gemini: GoogleGenerativeAI;
  private model: GenerativeModel;
  
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      throw new Error('Gemini API key is not defined in environment variables');
    }
    
    this.gemini = new GoogleGenerativeAI(apiKey);
    this.model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-pro' });
  }
  
  /**
   * Generate a response from Gemini model
   */
  async generateText(prompt: string, options: ModelOptions = {}): Promise<string> {
    const generationConfig = {
      temperature: options.temperature || 0.7,
      maxOutputTokens: options.maxOutputTokens || 2048,
      topK: options.topK || 40,
      topP: options.topP || 0.95,
    };
    
    try {
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig,
      });
      
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating text with Gemini:', error);
      throw error;
    }
  }
  
  /**
   * Generate a streaming response from Gemini model
   */
  async *generateTextStream(prompt: string, options: ModelOptions = {}): AsyncGenerator<string> {
    const generationConfig = {
      temperature: options.temperature || 0.7,
      maxOutputTokens: options.maxOutputTokens || 2048,
      topK: options.topK || 40,
      topP: options.topP || 0.95,
    };
    
    try {
      const result = await this.model.generateContentStream({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig,
      });
      
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
          yield chunkText;
        }
      }
    } catch (error) {
      console.error('Error streaming text with Gemini:', error);
      throw error;
    }
  }
  
  /**
   * Process a chat conversation with Gemini
   */
  async chatWithHistory(messages: ChatMessage[], options: ModelOptions = {}): Promise<string> {
    const generationConfig = {
      temperature: options.temperature || 0.7,
      maxOutputTokens: options.maxOutputTokens || 2048,
      topK: options.topK || 40,
      topP: options.topP || 0.95,
    };
    
    try {
      const chat = this.model.startChat();
      
      // Add all messages to the chat history
      for (const message of messages) {
        if (message.role === 'user') {
          await chat.sendMessage(message.content);
        }
      }
      
      // Get the last user message for the final response
      const lastUserMessage = messages.filter(m => m.role === 'user').pop();
      if (!lastUserMessage) {
        throw new Error('No user message found in conversation history');
      }
      
      const result = await chat.sendMessage(lastUserMessage.content);
      return result.response.text();
    } catch (error) {
      console.error('Error in chat with Gemini:', error);
      throw error;
    }
  }
} 