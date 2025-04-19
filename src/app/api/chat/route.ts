import { NextRequest, NextResponse } from 'next/server';
import { ModelRouter, ModelType } from '@/services/llm/modelRouter';
import { ChatMessage } from '@/services/firebase/chatService';
import { ContextManager } from '@/services/memory/contextManager';
import { getServerFirebase } from '@/services/firebase/firebaseInstance';

// Initialize services
const modelRouter = new ModelRouter();
const contextManager = new ContextManager();

export async function POST(request: NextRequest) {
  try {
    const { 
      messages, 
      model = 'gemini-1.5-pro', 
      stream = false, 
      options = {},
      userId = 'anonymous-user', // For development without auth
      conversationId,
      includeMemory = true,
    } = await request.json();
    
    // Validate request
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid messages format. Expected a non-empty array of message objects.' },
        { status: 400 }
      );
    }

    // Create context window to include relevant memories if requested
    let contextMessages = messages;
    let relevantMemories = [];
    
    if (includeMemory && userId !== 'anonymous-user') {
      try {
        // Create context window with relevant memories
        const contextWindow = await contextManager.createContextWindow(userId, messages as ChatMessage[]);
        
        // Store current context in memory
        if (conversationId) {
          await contextManager.extractMemoriesFromConversation(
            userId,
            conversationId,
            messages as ChatMessage[]
          );
        }
        
        // Get the relevant memories
        relevantMemories = contextWindow.relevantMemories;
        
        // Add system message with context if we have relevant memories
        if (relevantMemories.length > 0) {
          const memoryContext = contextManager.formatContextForPrompt(contextWindow);
          const systemMessage: ChatMessage = {
            role: 'system',
            content: `Here is relevant context that might help with the user's query:\n${memoryContext}`,
            timestamp: Date.now(),
          };
          
          // Add system message at the beginning
          contextMessages = [systemMessage, ...messages];
        }
      } catch (error) {
        console.error('Error creating context window:', error);
        // Continue without memories if there's an error
      }
    }
    
    // Process based on streaming preference
    if (stream) {
      // Create a stream response
      const encoder = new TextEncoder();
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            // Call the appropriate model with streaming
            const streamGenerator = modelRouter.chatStream(
              model as ModelType,
              contextMessages as any, // Cast to avoid type errors
              options
            );
            
            // Write each chunk to the stream
            for await (const chunk of streamGenerator) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`));
            }
            
            // End the stream
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        }
      });
      
      // Return the stream response
      return new NextResponse(readableStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // Process as a regular request
      const response = await modelRouter.chat(
        model as ModelType,
        contextMessages as any, // Cast to avoid type errors
        options
      );
      
      // Return response with additional context information
      return NextResponse.json({ 
        response,
        includedMemories: relevantMemories.length > 0,
        memoryCount: relevantMemories.length,
      });
    }
  } catch (error: any) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred processing your request' },
      { status: 500 }
    );
  }
}

// GET endpoint for retrieving available models
export async function GET() {
  try {
    const models = modelRouter.getAvailableModels();
    return NextResponse.json({ models });
  } catch (error: any) {
    console.error('Error fetching models:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred fetching models' },
      { status: 500 }
    );
  }
} 