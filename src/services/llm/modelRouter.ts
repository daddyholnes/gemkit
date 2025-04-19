import { GeminiService, ModelOptions, ChatMessage } from './geminiService';
import { OpenAIService } from './openaiService';
import { VertexAIService } from './vertexAIService';

// Define the supported model types
export type ModelType = 
  // Google models
  | 'gemini-1.5-pro' 
  | 'gemini-1.5-flash'
  | 'gemini-1.5-flash-lite'
  | 'gemini-1.0-pro'
  | 'gemini-1.0-pro-vision'
  // OpenAI models
  | 'gpt-4-turbo' 
  | 'gpt-3.5-turbo'
  | 'gpt-4o'
  // Anthropic models
  | 'claude-3-opus' 
  | 'claude-3-sonnet'
  | 'claude-3-haiku'
  | 'claude-2.1'
  // Mistral models
  | 'mistral-small-2402'
  | 'mistral-medium-2312'
  | 'mistral-large-2402';

export interface ModelInfo {
  id: ModelType;
  provider: 'google' | 'openai' | 'anthropic' | 'mistral';
  name: string;
  description: string;
  maxTokens: number;
  supportsFunctions: boolean;
  supportsVision: boolean;
  free: boolean;
}

// Model metadata
export const MODELS: Record<ModelType, ModelInfo> = {
  // Google Gemini Models
  'gemini-1.5-pro': {
    id: 'gemini-1.5-pro',
    provider: 'google',
    name: 'Gemini 1.5 Pro',
    description: 'Most capable Google model with 1M context window',
    maxTokens: 1048576,
    supportsFunctions: true,
    supportsVision: true,
    free: false,
  },
  'gemini-1.5-flash': {
    id: 'gemini-1.5-flash',
    provider: 'google',
    name: 'Gemini 1.5 Flash',
    description: 'Fast and efficient Google model',
    maxTokens: 1048576,
    supportsFunctions: true,
    supportsVision: true,
    free: false,
  },
  'gemini-1.5-flash-lite': {
    id: 'gemini-1.5-flash-lite',
    provider: 'google',
    name: 'Gemini 1.5 Flash Lite',
    description: 'Optimized for cost-efficiency and latency',
    maxTokens: 1048576,
    supportsFunctions: true,
    supportsVision: true,
    free: false,
  },
  'gemini-1.0-pro': {
    id: 'gemini-1.0-pro',
    provider: 'google',
    name: 'Gemini 1.0 Pro',
    description: 'Versatile language model for various tasks',
    maxTokens: 32768,
    supportsFunctions: true,
    supportsVision: false,
    free: false,
  },
  'gemini-1.0-pro-vision': {
    id: 'gemini-1.0-pro-vision',
    provider: 'google',
    name: 'Gemini 1.0 Pro Vision',
    description: 'Supports text, images, and vision tasks',
    maxTokens: 32768,
    supportsFunctions: true,
    supportsVision: true,
    free: false,
  },
  
  // OpenAI Models
  'gpt-4-turbo': {
    id: 'gpt-4-turbo',
    provider: 'openai',
    name: 'GPT-4 Turbo',
    description: 'OpenAI\'s most capable model',
    maxTokens: 128000,
    supportsFunctions: true,
    supportsVision: true,
    free: false,
  },
  'gpt-4o': {
    id: 'gpt-4o',
    provider: 'openai',
    name: 'GPT-4o',
    description: 'OpenAI\'s most advanced multimodal model',
    maxTokens: 128000,
    supportsFunctions: true,
    supportsVision: true,
    free: false,
  },
  'gpt-3.5-turbo': {
    id: 'gpt-3.5-turbo',
    provider: 'openai',
    name: 'GPT-3.5 Turbo',
    description: 'Efficient OpenAI model with good capabilities',
    maxTokens: 16000,
    supportsFunctions: true,
    supportsVision: true,
    free: false,
  },
  
  // Anthropic Claude Models
  'claude-3-opus': {
    id: 'claude-3-opus',
    provider: 'anthropic',
    name: 'Claude 3 Opus',
    description: 'Anthropic\'s most capable model',
    maxTokens: 200000,
    supportsFunctions: true,
    supportsVision: true,
    free: false,
  },
  'claude-3-sonnet': {
    id: 'claude-3-sonnet',
    provider: 'anthropic',
    name: 'Claude 3 Sonnet',
    description: 'Balanced Claude model for performance and efficiency',
    maxTokens: 180000,
    supportsFunctions: true,
    supportsVision: true,
    free: false,
  },
  'claude-3-haiku': {
    id: 'claude-3-haiku',
    provider: 'anthropic',
    name: 'Claude 3 Haiku',
    description: 'Fast, compact model for high-throughput applications',
    maxTokens: 150000,
    supportsFunctions: true,
    supportsVision: true,
    free: false,
  },
  'claude-2.1': {
    id: 'claude-2.1',
    provider: 'anthropic',
    name: 'Claude 2.1',
    description: 'Previous generation Claude model',
    maxTokens: 100000,
    supportsFunctions: false,
    supportsVision: false,
    free: false,
  },
  
  // Mistral AI Models
  'mistral-small-2402': {
    id: 'mistral-small-2402',
    provider: 'mistral',
    name: 'Mistral Small 2402',
    description: 'Balanced model for everyday use',
    maxTokens: 32000,
    supportsFunctions: true,
    supportsVision: false,
    free: false,
  },
  'mistral-medium-2312': {
    id: 'mistral-medium-2312',
    provider: 'mistral',
    name: 'Mistral Medium 2312',
    description: 'Advanced reasoning and context understanding',
    maxTokens: 32000,
    supportsFunctions: true,
    supportsVision: false,
    free: false,
  },
  'mistral-large-2402': {
    id: 'mistral-large-2402',
    provider: 'mistral',
    name: 'Mistral Large 2402',
    description: 'Superior model for complex tasks',
    maxTokens: 32000,
    supportsFunctions: true,
    supportsVision: false,
    free: false,
  },
};

/**
 * ModelRouter class to route requests to the appropriate LLM service
 */
export class ModelRouter {
  private geminiService: GeminiService;
  private openaiService: OpenAIService;
  private vertexAIService: VertexAIService | null = null;
  
  constructor() {
    this.geminiService = new GeminiService();
    this.openaiService = new OpenAIService();
    
    // Initialize Vertex AI service only on the server side
    if (typeof window === 'undefined') {
      try {
        this.vertexAIService = new VertexAIService();
      } catch (error) {
        console.warn('Could not initialize Vertex AI service:', error);
      }
    }
  }
  
  /**
   * Get a list of all available models
   */
  getAvailableModels(): ModelInfo[] {
    return Object.values(MODELS);
  }
  
  /**
   * Generate text using the specified model
   */
  async generateText(modelId: ModelType, prompt: string, options: ModelOptions = {}): Promise<string> {
    const model = MODELS[modelId];
    
    if (!model) {
      throw new Error(`Model "${modelId}" is not supported`);
    }
    
    switch (model.provider) {
      case 'google':
        return this.geminiService.generateText(prompt, options);
      case 'openai':
        return this.openaiService.generateText(prompt, options, modelId);
      case 'anthropic':
      case 'mistral':
        if (!this.vertexAIService) {
          throw new Error(`${model.provider} models are only available server-side via Vertex AI`);
        }
        return this.vertexAIService.generateText(prompt, options, modelId);
      default:
        throw new Error(`Unknown provider "${model.provider}"`);
    }
  }
  
  /**
   * Generate streaming text using the specified model
   */
  async *generateTextStream(modelId: ModelType, prompt: string, options: ModelOptions = {}): AsyncGenerator<string> {
    const model = MODELS[modelId];
    
    if (!model) {
      throw new Error(`Model "${modelId}" is not supported`);
    }
    
    switch (model.provider) {
      case 'google':
        yield* this.geminiService.generateTextStream(prompt, options);
        break;
      case 'openai':
        yield* this.openaiService.generateTextStream(prompt, options, modelId);
        break;
      case 'anthropic':
      case 'mistral':
        if (!this.vertexAIService) {
          throw new Error(`${model.provider} models are only available server-side via Vertex AI`);
        }
        // We don't support streaming text generation for Vertex AI models yet
        const fullResponse = await this.vertexAIService.generateText(prompt, options, modelId);
        yield fullResponse;
        break;
      default:
        throw new Error(`Unknown provider "${model.provider}"`);
    }
  }
  
  /**
   * Process a chat with history using the specified model
   */
  async chat(modelId: ModelType, messages: ChatMessage[], options: ModelOptions = {}): Promise<string> {
    const model = MODELS[modelId];
    
    if (!model) {
      throw new Error(`Model "${modelId}" is not supported`);
    }
    
    switch (model.provider) {
      case 'google':
        return this.geminiService.chatWithHistory(messages, options);
      case 'openai':
        return this.openaiService.chatWithHistory(messages, options, modelId);
      case 'anthropic':
      case 'mistral':
        if (!this.vertexAIService) {
          throw new Error(`${model.provider} models are only available server-side via Vertex AI`);
        }
        return this.vertexAIService.chatWithHistory(messages, options, modelId);
      default:
        throw new Error(`Unknown provider "${model.provider}"`);
    }
  }
  
  /**
   * Process a streaming chat with the specified model
   */
  async *chatStream(modelId: ModelType, messages: ChatMessage[], options: ModelOptions = {}): AsyncGenerator<string> {
    const model = MODELS[modelId];
    
    if (!model) {
      throw new Error(`Model "${modelId}" is not supported`);
    }
    
    switch (model.provider) {
      case 'google':
        // Use non-streaming version for now until streaming is implemented
        const geminiResponse = await this.geminiService.chatWithHistory(messages, options);
        yield geminiResponse;
        break;
      case 'openai':
        yield* this.openaiService.chatWithHistoryStream(messages, options, modelId);
        break;
      case 'anthropic':
      case 'mistral':
        if (!this.vertexAIService) {
          throw new Error(`${model.provider} models are only available server-side via Vertex AI`);
        }
        yield* this.vertexAIService.chatWithHistoryStream(messages, options, modelId);
        break;
      default:
        throw new Error(`Unknown provider "${model.provider}"`);
    }
  }
} 