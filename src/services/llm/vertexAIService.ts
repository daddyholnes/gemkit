import { ModelOptions, ChatMessage } from './geminiService';

export class VertexAIService {
  private projectId: string;
  private location: string;
  
  constructor() {
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT || '';
    this.location = process.env.VERTEX_AI_LOCATION || 'us-central1';
    
    if (!this.projectId) {
      throw new Error('Google Cloud Project ID is not defined in environment variables');
    }
  }
  
  /**
   * Converts our internal model ID to Vertex AI publisher model format
   */
  private getPublisherModel(modelId: string): string {
    // Claude models on Vertex AI
    if (modelId.startsWith('claude-')) {
      return `publishers/anthropic/models/${modelId}`;
    }
    
    // Mistral models on Vertex AI
    if (modelId.startsWith('mistral-')) {
      return `publishers/mistralai/models/${modelId}`;
    }
    
    throw new Error(`Model ${modelId} is not supported in Vertex AI service`);
  }
  
  /**
   * Convert our chat message format to Vertex AI format
   */
  private formatMessagesForVertexAI(messages: ChatMessage[], modelType: 'claude' | 'mistral'): any {
    if (modelType === 'claude') {
      // Claude format in Vertex AI
      return messages.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : msg.role === 'system' ? 'system' : 'user',
        content: msg.content
      }));
    } else {
      // Mistral format in Vertex AI
      return messages.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : msg.role === 'system' ? 'system' : 'user',
        content: msg.content
      }));
    }
  }
  
  /**
   * Generate text with a model using Vertex AI
   */
  async generateText(prompt: string, options: ModelOptions = {}, modelId: string): Promise<string> {
    // This function must be called server-side
    if (typeof window !== 'undefined') {
      throw new Error('Vertex AI calls can only be made server-side');
    }
    
    // Dynamically import to avoid client-side loading
    const { PredictionServiceClient } = require('@google-cloud/aiplatform');
    const predictionClient = new PredictionServiceClient({
      projectId: this.projectId,
    });
    
    const modelType = modelId.startsWith('claude-') ? 'claude' : 'mistral';
    const publisherModel = this.getPublisherModel(modelId);
    const endpoint = `projects/${this.projectId}/locations/${this.location}/publishers/google/models/${publisherModel}`;
    
    try {
      const promptInstance = {
        prompt: prompt,
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxOutputTokens || 1024,
        topK: options.topK,
        topP: options.topP || 0.95,
      };
      
      const [response] = await predictionClient.predict({
        endpoint,
        instances: [promptInstance],
      });
      
      return response.predictions[0].content;
    } catch (error) {
      console.error(`Error generating text with ${modelId} via Vertex AI:`, error);
      throw error;
    }
  }
  
  /**
   * Process a chat conversation with a model using Vertex AI
   */
  async chatWithHistory(messages: ChatMessage[], options: ModelOptions = {}, modelId: string): Promise<string> {
    // This function must be called server-side
    if (typeof window !== 'undefined') {
      throw new Error('Vertex AI calls can only be made server-side');
    }
    
    // Dynamically import to avoid client-side loading
    const { VertexAI } = require('@google-cloud/vertexai');
    const vertexAI = new VertexAI({
      project: this.projectId,
      location: this.location,
    });
    
    const modelType = modelId.startsWith('claude-') ? 'claude' : 'mistral';
    const publisherModel = this.getPublisherModel(modelId);
    
    try {
      const generativeModel = vertexAI.getGenerativeModel({
        model: publisherModel,
      });
      
      const formattedMessages = this.formatMessagesForVertexAI(messages, modelType);
      
      const result = await generativeModel.generateContent({
        contents: formattedMessages,
        generationConfig: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: options.maxOutputTokens || 1024,
          topK: options.topK,
          topP: options.topP || 0.95,
        },
      });
      
      return result.response.text();
    } catch (error) {
      console.error(`Error in chat with ${modelId} via Vertex AI:`, error);
      throw error;
    }
  }
  
  /**
   * Process a streaming chat with a model using Vertex AI
   */
  async *chatWithHistoryStream(messages: ChatMessage[], options: ModelOptions = {}, modelId: string): AsyncGenerator<string> {
    // This function must be called server-side
    if (typeof window !== 'undefined') {
      throw new Error('Vertex AI streaming calls can only be made server-side');
    }
    
    // Dynamically import to avoid client-side loading
    const { VertexAI } = require('@google-cloud/vertexai');
    const vertexAI = new VertexAI({
      project: this.projectId,
      location: this.location,
    });
    
    const modelType = modelId.startsWith('claude-') ? 'claude' : 'mistral';
    const publisherModel = this.getPublisherModel(modelId);
    
    try {
      const generativeModel = vertexAI.getGenerativeModel({
        model: publisherModel,
      });
      
      const formattedMessages = this.formatMessagesForVertexAI(messages, modelType);
      
      const result = await generativeModel.generateContentStream({
        contents: formattedMessages,
        generationConfig: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: options.maxOutputTokens || 1024,
          topK: options.topK,
          topP: options.topP || 0.95,
        },
      });
      
      for await (const chunk of result.stream) {
        const textChunk = chunk.candidates[0]?.content?.parts[0]?.text;
        if (textChunk) {
          yield textChunk;
        }
      }
    } catch (error) {
      console.error(`Error streaming chat with ${modelId} via Vertex AI:`, error);
      throw error;
    }
  }
} 