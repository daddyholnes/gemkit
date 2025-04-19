import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

// In a real app, you'd import these from your services
// For demo purposes, we're simulating the MCP service
const mcpService = {
  generateText: async ({ userId, modelId, prompt }) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      text: `Response from ${modelId} for prompt: ${prompt}`,
      model: modelId,
      memory: {
        enhanced: true,
        emotionalContextApplied: true,
        timestamp: new Date().toISOString()
      }
    };
  }
};

export default function McpDemo() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState('gpt-4');
  const [userId] = useState(() => uuidv4()); // Generate a random user ID
  
  const messagesEndRef = useRef(null);
  
  // Models we support
  const models = [
    { id: 'gpt-4', name: 'OpenAI GPT-4', provider: 'OpenAI' },
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', provider: 'Anthropic' },
    { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google' },
  ];

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      // Call MCP service with memory enhancement
      const response = await mcpService.generateText({
        userId,
        modelId: model,
        prompt: input
      });
      
      // Add assistant message
      const assistantMessage = {
        role: 'assistant',
        content: response.text,
        model: response.model,
        memory: response.memory,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      // Add error message
      setMessages(prev => [
        ...prev, 
        { 
          role: 'system', 
          content: 'Error generating response. Please try again.',
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">MCP Demo - Memory Enhanced Chat</h1>
      
      {/* Model selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Select Model:</label>
        <div className="flex flex-wrap gap-2">
          {models.map(m => (
            <button
              key={m.id}
              onClick={() => setModel(m.id)}
              className={`px-3 py-1 rounded text-sm ${
                model === m.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {m.name} ({m.provider})
            </button>
          ))}
        </div>
      </div>
      
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto mb-4 border rounded-lg p-4 space-y-4">
        {messages.map((message, index) => (
          <div 
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div 
              className={`max-w-[75%] rounded-lg p-3 ${
                message.role === 'user' 
                  ? 'bg-blue-100 text-blue-900'
                  : message.role === 'system'
                    ? 'bg-red-100 text-red-900' 
                    : 'bg-gray-100'
              }`}
            >
              <div className="text-sm font-medium mb-1">
                {message.role === 'user' ? 'You' : 
                 message.role === 'system' ? 'System' : 
                 `AI (${message.model})`}
              </div>
              <div>{message.content}</div>
              {message.memory && (
                <div className="mt-2 text-xs text-gray-500">
                  Memory enhanced: {message.memory.enhanced ? 'Yes' : 'No'} | 
                  Emotional context: {message.memory.emotionalContextApplied ? 'Applied' : 'None'}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
      
      {/* User ID display */}
      <div className="mt-2 text-xs text-gray-500">
        User ID: {userId} (Memory tracking enabled)
      </div>
    </div>
  );
} 