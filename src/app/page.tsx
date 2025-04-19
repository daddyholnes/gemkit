import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-5xl rounded-lg bg-white p-8 shadow-xl dark:bg-gray-800">
        <h1 className="mb-6 text-center text-4xl font-bold text-primary-600">
          AI Studio Hub
        </h1>
        <p className="mb-8 text-center text-lg text-gray-600 dark:text-gray-300">
          Your personal AI workspace for multi-model chat, agent creation, and AI experimentation
        </p>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Feature Card: Multi-LLM Chat */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <h2 className="mb-3 text-xl font-semibold text-gray-800 dark:text-white">
              Multi-LLM Chat
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Chat with multiple AI models simultaneously and compare their responses
            </p>
          </div>
          
          {/* Feature Card: Agent Lab */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <h2 className="mb-3 text-xl font-semibold text-gray-800 dark:text-white">
              Agent Lab
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Create and test custom AI agents with visual programming
            </p>
          </div>
          
          {/* Feature Card: Persistent Memory */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <h2 className="mb-3 text-xl font-semibold text-gray-800 dark:text-white">
              Persistent Memory
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Save conversations and context for long-term AI relationships
            </p>
          </div>
        </div>
        
        <div className="mt-8 flex justify-center">
          <Link 
            href="/chat" 
            className="rounded-md bg-primary-600 px-6 py-3 text-white shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
} 