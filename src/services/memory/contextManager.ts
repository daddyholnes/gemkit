import { clientDb } from '../firebase/firebaseConfig';
import { ChatMessage } from '../firebase/chatService';
import { VertexService } from '../gcloud/vertexService';
import { collection, addDoc, updateDoc, getDocs, query, where, orderBy, doc, serverTimestamp } from 'firebase/firestore';

// Memory interfaces
export interface MemoryEntry {
  id?: string;
  userId: string;
  conversationId?: string;
  content: string;
  embedding?: number[];
  type: 'message' | 'summary' | 'knowledge' | 'fact';
  importance: number; // 0-10 scale
  createdAt: any; // Firestore Timestamp
  metadata?: Record<string, any>;
}

export interface ContextWindow {
  messages: ChatMessage[];
  totalTokens: number;
  relevantMemories: MemoryEntry[];
}

// Context Manager class
export class ContextManager {
  private vertexService: VertexService;
  private memoriesRef = collection(clientDb, 'memories');
  private maxContextSize = 4000; // Default token limit
  
  constructor() {
    this.vertexService = new VertexService();
  }
  
  /**
   * Store a memory entry with embedding
   */
  async storeMemory(memoryEntry: Omit<MemoryEntry, 'id' | 'embedding' | 'createdAt'>): Promise<string> {
    try {
      // Generate embedding for the content
      const embeddings = await this.vertexService.getTextEmbeddings([memoryEntry.content]);
      
      const entry: Omit<MemoryEntry, 'id'> = {
        ...memoryEntry,
        embedding: embeddings[0],
        createdAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(this.memoriesRef, entry);
      return docRef.id;
    } catch (error) {
      console.error('Error storing memory:', error);
      throw error;
    }
  }
  
  /**
   * Extract memories from conversation messages
   */
  async extractMemoriesFromConversation(
    userId: string,
    conversationId: string,
    messages: ChatMessage[]
  ): Promise<string[]> {
    // Skip if no messages
    if (!messages || messages.length === 0) return [];
    
    // For now, just extract user messages as memories
    // In a more advanced implementation, this would use LLM to generate summaries and extract key facts
    const userMessages = messages.filter(msg => msg.role === 'user');
    
    const memoryIds = [];
    
    for (const message of userMessages) {
      // Store each user message as a memory
      const memoryId = await this.storeMemory({
        userId,
        conversationId,
        content: message.content,
        type: 'message',
        importance: 5, // Medium importance by default
        metadata: {
          messageTimestamp: message.timestamp,
        },
      });
      
      memoryIds.push(memoryId);
    }
    
    return memoryIds;
  }
  
  /**
   * Get relevant memories based on a query
   */
  async getRelevantMemories(
    userId: string,
    query: string,
    limit: number = 5
  ): Promise<MemoryEntry[]> {
    try {
      // Get all memories for this user
      const q = query(
        this.memoriesRef,
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const memories = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as MemoryEntry[];
      
      // If there are no memories, return empty array
      if (memories.length === 0) return [];
      
      // Find similar memories using embeddings
      const queryEmbedding = (await this.vertexService.getTextEmbeddings([query]))[0];
      
      // Calculate similarity for each memory
      const memoriesWithSimilarity = memories.map(memory => {
        // If memory has no embedding, assign zero similarity
        if (!memory.embedding) return { memory, similarity: 0 };
        
        const similarity = this.vertexService.calculateCosineSimilarity(
          queryEmbedding,
          memory.embedding
        );
        
        return { memory, similarity };
      });
      
      // Sort by similarity and take top results
      return memoriesWithSimilarity
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)
        .map(item => item.memory);
    } catch (error) {
      console.error('Error getting relevant memories:', error);
      throw error;
    }
  }
  
  /**
   * Create a context window for a conversation
   */
  async createContextWindow(
    userId: string,
    messages: ChatMessage[],
    maxTokens: number = this.maxContextSize
  ): Promise<ContextWindow> {
    // Simple token estimation (can be replaced with a more accurate tokenizer)
    const estimateTokens = (text: string): number => {
      return Math.ceil(text.length / 4);
    };
    
    // Calculate tokens for current messages
    let currentTokens = 0;
    for (const message of messages) {
      currentTokens += estimateTokens(message.content);
    }
    
    // Get relevant memories if we have space in the context window
    let relevantMemories: MemoryEntry[] = [];
    
    if (currentTokens < maxTokens && messages.length > 0) {
      // Use the last user message as the query
      const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
      
      if (lastUserMessage) {
        // Calculate remaining space for memories
        const remainingTokens = maxTokens - currentTokens;
        const maxMemoriesToInclude = Math.floor(remainingTokens / 100); // Rough estimate
        
        // Get relevant memories
        relevantMemories = await this.getRelevantMemories(
          userId,
          lastUserMessage.content,
          maxMemoriesToInclude
        );
      }
    }
    
    return {
      messages,
      totalTokens: currentTokens,
      relevantMemories,
    };
  }
  
  /**
   * Format context window for LLM prompt
   */
  formatContextForPrompt(contextWindow: ContextWindow): string {
    let prompt = '';
    
    // Add relevant memories as context
    if (contextWindow.relevantMemories.length > 0) {
      prompt += 'Previous relevant context:\n';
      
      for (const memory of contextWindow.relevantMemories) {
        prompt += `- ${memory.content}\n`;
      }
      
      prompt += '\n';
    }
    
    // Format conversation history
    prompt += 'Conversation history:\n';
    for (const message of contextWindow.messages) {
      const role = message.role === 'user' ? 'User' : 'Assistant';
      prompt += `${role}: ${message.content}\n`;
    }
    
    return prompt;
  }
} 