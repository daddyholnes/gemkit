// Google Cloud Vertex AI service
import { getGoogleCloudLocation, getGoogleCloudProjectId } from './serviceAccount';

// Interface for text embedding options
export interface EmbeddingOptions {
  dimensions?: number;
  taskType?: 'RETRIEVAL_QUERY' | 'RETRIEVAL_DOCUMENT' | 'SEMANTIC_SIMILARITY' | 'CLASSIFICATION' | 'CLUSTERING';
}

// Vertex AI service class
export class VertexService {
  private projectId: string;
  private location: string;
  
  constructor() {
    this.projectId = getGoogleCloudProjectId();
    this.location = getGoogleCloudLocation();
  }
  
  /**
   * Get text embeddings using Vertex AI
   */
  async getTextEmbeddings(texts: string[], options: EmbeddingOptions = {}): Promise<number[][]> {
    // Dynamically import Vertex AI to avoid issues with server components
    const { VertexAI } = await import('@google-cloud/vertexai');
    
    // Create Vertex AI client
    const vertexAI = new VertexAI({
      project: this.projectId,
      location: this.location,
    });
    
    const textEmbeddingModel = 'textembedding-gecko@latest';
    const embeddingModel = vertexAI.preview.getTextEmbeddingModel({
      model: textEmbeddingModel,
    });
    
    // Set default dimensions if not provided
    const dimensions = options.dimensions || 768;
    const taskType = options.taskType || 'RETRIEVAL_DOCUMENT';
    
    try {
      const embedRequest = {
        instances: texts.map(text => ({ content: text })),
        parameters: {
          dimensions,
          taskType,
        },
      };
      
      const response = await embeddingModel.predictEmbedding(embedRequest);
      
      if (!response || !response.predictions) {
        throw new Error('No predictions returned from embedding model');
      }
      
      // Extract embeddings from response
      return response.predictions.map(prediction => prediction.embeddings.values);
    } catch (error) {
      console.error('Error generating text embeddings:', error);
      throw error;
    }
  }
  
  /**
   * Get similar texts based on embeddings
   * This is a simple implementation - for production, use Vertex AI Matching Engine
   */
  calculateCosineSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Embeddings must have the same dimensions');
    }
    
    // Calculate dot product
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }
    
    // Handle zero vectors
    if (norm1 === 0 || norm2 === 0) {
      return 0;
    }
    
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }
  
  /**
   * Get most similar texts from a corpus based on a query
   * For larger datasets, use Vertex AI Matching Engine or Vector Search
   */
  async findSimilarTexts(
    query: string, 
    corpus: { id: string; text: string }[],
    limit: number = 5
  ): Promise<Array<{ id: string; text: string; similarity: number }>> {
    try {
      // Get embeddings for query and corpus
      const queryEmbedding = (await this.getTextEmbeddings([query], { taskType: 'RETRIEVAL_QUERY' }))[0];
      const corpusEmbeddings = await this.getTextEmbeddings(
        corpus.map(item => item.text),
        { taskType: 'RETRIEVAL_DOCUMENT' }
      );
      
      // Calculate similarities
      const similarities = corpusEmbeddings.map((embedding, index) => ({
        id: corpus[index].id,
        text: corpus[index].text,
        similarity: this.calculateCosineSimilarity(queryEmbedding, embedding),
      }));
      
      // Sort by similarity (descending) and take top results
      return similarities
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);
    } catch (error) {
      console.error('Error finding similar texts:', error);
      throw error;
    }
  }
} 