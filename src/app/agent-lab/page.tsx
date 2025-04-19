export default function AgentLabPage() {
  return (
    <div className="flex h-screen flex-col">
      <div className="flex h-full">
        {/* Sidebar: Agent Templates */}
        <div className="w-64 border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="p-4">
            <h2 className="mb-4 text-lg font-semibold text-gray-700 dark:text-gray-200">Agent Templates</h2>
            <div className="space-y-2">
              <div className="cursor-pointer rounded-md bg-gray-100 p-2 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600">
                <h3 className="text-sm font-medium text-gray-800 dark:text-white">Research Assistant</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Searches and summarizes information</p>
              </div>
              <div className="cursor-pointer rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                <h3 className="text-sm font-medium text-gray-800 dark:text-white">Code Assistant</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Helps with coding tasks</p>
              </div>
              <div className="cursor-pointer rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                <h3 className="text-sm font-medium text-gray-800 dark:text-white">Data Analyst</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Analyzes and visualizes data</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Agent Design Area */}
        <div className="flex-1 bg-gray-50 p-4 dark:bg-gray-900">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Agent Lab</h1>
            <p className="text-gray-600 dark:text-gray-300">Create and test custom AI agents with visual programming</p>
          </div>
          
          <div className="flex h-full flex-col items-center justify-center">
            <div className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mx-auto mb-4 h-12 w-12 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              </svg>
              <h2 className="mb-2 text-xl font-medium text-gray-700 dark:text-gray-200">Create a New Agent</h2>
              <p className="mb-4 text-gray-500 dark:text-gray-400">
                Start from scratch or select a template from the sidebar
              </p>
              <button className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                Create Agent
              </button>
            </div>
          </div>
        </div>
        
        {/* Sidebar: Tools */}
        <div className="w-64 border-l border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="p-4">
            <h2 className="mb-4 text-lg font-semibold text-gray-700 dark:text-gray-200">Available Tools</h2>
            
            <div className="mb-4">
              <h3 className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-300">Search Tools</h3>
              <div className="space-y-1">
                <div className="rounded-md p-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700">
                  <span className="font-medium">Web Search</span>
                </div>
                <div className="rounded-md p-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700">
                  <span className="font-medium">Knowledge Base</span>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-300">Code Tools</h3>
              <div className="space-y-1">
                <div className="rounded-md p-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700">
                  <span className="font-medium">Code Interpreter</span>
                </div>
                <div className="rounded-md p-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700">
                  <span className="font-medium">Repository Access</span>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-300">Data Tools</h3>
              <div className="space-y-1">
                <div className="rounded-md p-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700">
                  <span className="font-medium">CSV Analyzer</span>
                </div>
                <div className="rounded-md p-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700">
                  <span className="font-medium">Database Connector</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 