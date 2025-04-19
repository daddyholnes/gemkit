import React from 'react';

const SandboxComponent = () => {
  return (
    <div className="space-y-4">
      <div className="text-gray-300">Console output will appear here...</div>
      <div className="flex gap-2">
        <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
          Run Example
        </button>
        <button className="px-3 py-1 bg-gray-700 text-white text-sm rounded hover:bg-gray-600 transition-colors">
          Clear Console
        </button>
      </div>
    </div>
  );
};

export default SandboxComponent; 