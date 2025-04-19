// MCP Service Index
// This file exports either the full proprietary implementation or the public version
// based on environment configuration

const fs = require('fs');
const path = require('path');

// Check if we're in commercial mode
const useCommercialVersion = process.env.USE_COMMERCIAL_MCP === 'true';

// Check if the proprietary files exist (for safety)
const emotionalContextServicePath = path.join(__dirname, 'emotionalContextService.js');
const memoryEnhancedServicePath = path.join(__dirname, 'memoryEnhancedService.js');

const hasProprietaryFiles = 
  fs.existsSync(emotionalContextServicePath) && 
  fs.existsSync(memoryEnhancedServicePath);

// Determine which version to use
const usePrivate = useCommercialVersion && hasProprietaryFiles;

// Export the appropriate versions
let memoryService, emotionalService, mcpSetup;

if (usePrivate) {
  // Use the full proprietary versions
  console.log('Using commercial MCP implementation with proprietary features');
  memoryService = require('./memoryEnhancedService');
  emotionalService = require('./emotionalContextService');
} else {
  // Use the public versions
  console.log('Using public MCP implementation');
  memoryService = require('./public/memoryEnhancedService');
  emotionalService = require('./public/emotionalContextService');
}

// Always export the MCP setup
mcpSetup = require('./mcpSetup');

module.exports = {
  // Main services
  memoryService,
  emotionalService,
  mcpSetup,
  
  // Convenience aliases
  memory: memoryService,
  emotional: emotionalService,
  mcp: mcpSetup
}; 