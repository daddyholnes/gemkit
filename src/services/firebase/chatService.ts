import { clientDb } from './firebaseConfig';
import { collection, addDoc, updateDoc, getDoc, getDocs, query, where, orderBy, doc, Timestamp, serverTimestamp } from 'firebase/firestore';
import { ModelType } from '../llm/modelRouter';

// Chat message interface
export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Timestamp | number;
  model?: ModelType;
}

// Conversation interface
export interface Conversation {
  id?: string;
  title: string;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  messages: ChatMessage[];
  lastMessage?: string;
  models: ModelType[];
}

// Chat service class for Firestore operations
export class ChatService {
  private conversationsRef = collection(clientDb, 'conversations');
  
  /**
   * Create a new conversation
   */
  async createConversation(userId: string, title: string, initialMessage?: ChatMessage): Promise<string> {
    try {
      const messages = initialMessage ? [initialMessage] : [];
      
      const newConversation: Omit<Conversation, 'id'> = {
        title,
        userId,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
        messages,
        lastMessage: initialMessage?.content || '',
        models: initialMessage?.model ? [initialMessage.model] : [],
      };
      
      const docRef = await addDoc(this.conversationsRef, newConversation);
      return docRef.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }
  
  /**
   * Get a conversation by ID
   */
  async getConversation(conversationId: string): Promise<Conversation | null> {
    try {
      const docRef = doc(this.conversationsRef, conversationId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Conversation;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting conversation:', error);
      throw error;
    }
  }
  
  /**
   * Get all conversations for a user
   */
  async getUserConversations(userId: string): Promise<Conversation[]> {
    try {
      const q = query(
        this.conversationsRef,
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as Conversation[];
    } catch (error) {
      console.error('Error getting user conversations:', error);
      throw error;
    }
  }
  
  /**
   * Add a message to a conversation
   */
  async addMessage(
    conversationId: string, 
    message: Omit<ChatMessage, 'id' | 'timestamp'>
  ): Promise<void> {
    try {
      const docRef = doc(this.conversationsRef, conversationId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error(`Conversation ${conversationId} does not exist`);
      }
      
      const conversation = docSnap.data() as Conversation;
      const newMessage: ChatMessage = {
        ...message,
        timestamp: serverTimestamp() as Timestamp,
      };
      
      const messages = [...conversation.messages, newMessage];
      const models = message.model 
        ? [...new Set([...conversation.models, message.model])]
        : conversation.models;
      
      await updateDoc(docRef, {
        messages,
        lastMessage: message.content,
        updatedAt: serverTimestamp(),
        models,
      });
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  }
  
  /**
   * Update conversation title
   */
  async updateConversationTitle(conversationId: string, title: string): Promise<void> {
    try {
      const docRef = doc(this.conversationsRef, conversationId);
      await updateDoc(docRef, {
        title,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating conversation title:', error);
      throw error;
    }
  }
  
  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId: string): Promise<void> {
    try {
      const docRef = doc(this.conversationsRef, conversationId);
      await updateDoc(docRef, {
        deleted: true,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }
} 