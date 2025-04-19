import React from 'react';
import SandboxComponent from '@/components/SandboxComponent';

export default function SandboxPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4 overflow-auto">
        <div className="mb-4">
          <h1 className="text-2xl font-bold mb-2">Sandbox</h1>
          <p className="text-gray-400">Test your code snippets and AI integrations here</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-3">Terminal Output</h2>
          <div className="bg-black rounded p-3 font-mono text-sm whitespace-pre overflow-auto max-h-[400px]">
            <span className="text-green-400">$ </span>
            <span className="text-white">npm run dev</span>
            <div className="text-gray-300 mt-1">Starting development server...</div>
            <div className="text-yellow-300 mt-1">Warning: Type checking enabled, performance may be affected</div>
            <div className="text-green-300 mt-1">Server running at http://localhost:3000</div>
            <div className="text-blue-300 mt-1">{'>'} Ready in 2.4s</div>
          </div>
        </div>
        
        <div className="mt-6">
          <SandboxComponent />
        </div>
      </div>
    </div>
  );
} 