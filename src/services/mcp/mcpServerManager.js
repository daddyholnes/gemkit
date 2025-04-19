// MCP Server Manager
// Handles loading and managing different types of MCP servers

/**
 * Server Manager for Model Control Protocol
 * This provides a public interface while keeping implementation details private
 */
class MCPServerManager {
  constructor() {
    this.servers = {};
    this.registeredTypes = {};
  }

  /**
   * Register a server type with the manager
   * @param {string} type - Type identifier (e.g., 'openai', 'anthropic')
   * @param {Function} serverClass - Server class constructor
   */
  registerServerType(type, serverClass) {
    this.registeredTypes[type] = serverClass;
  }

  /**
   * Create a new server instance
   * @param {string} id - Unique server ID
   * @param {string} type - Server type (must be registered)
   * @param {Object} config - Configuration for the server
   * @returns {Object} The created server instance
   */
  createServer(id, type, config = {}) {
    if (!this.registeredTypes[type]) {
      throw new Error(`Server type '${type}' is not registered`);
    }

    if (this.servers[id]) {
      throw new Error(`Server with ID '${id}' already exists`);
    }

    const ServerClass = this.registeredTypes[type];
    const server = new ServerClass(config);

    this.servers[id] = {
      instance: server,
      type,
      config
    };

    return server;
  }

  /**
   * Get a server instance by ID
   * @param {string} id - Server ID
   * @returns {Object} Server instance
   */
  getServer(id) {
    if (!this.servers[id]) {
      throw new Error(`Server with ID '${id}' not found`);
    }
    return this.servers[id].instance;
  }

  /**
   * Check if a server exists
   * @param {string} id - Server ID
   * @returns {boolean} Whether the server exists
   */
  hasServer(id) {
    return !!this.servers[id];
  }

  /**
   * Remove a server instance
   * @param {string} id - Server ID
   * @returns {boolean} Success status
   */
  async removeServer(id) {
    if (!this.servers[id]) {
      return false;
    }

    const server = this.servers[id].instance;
    if (server.isConnected) {
      await server.disconnect();
    }

    delete this.servers[id];
    return true;
  }

  /**
   * Get all server IDs
   * @returns {string[]} Array of server IDs
   */
  getServerIds() {
    return Object.keys(this.servers);
  }

  /**
   * Get server info for all servers
   * @returns {Object} Map of server info objects
   */
  getServersInfo() {
    const info = {};
    for (const [id, server] of Object.entries(this.servers)) {
      info[id] = {
        type: server.type,
        status: server.instance.getStatus()
      };
    }
    return info;
  }
  
  /**
   * Connect all servers
   * @returns {Promise<Object>} Map of connection results
   */
  async connectAll() {
    const results = {};
    for (const id of Object.keys(this.servers)) {
      results[id] = await this.servers[id].instance.connect();
    }
    return results;
  }
  
  /**
   * Disconnect all servers
   * @returns {Promise<Object>} Map of disconnection results
   */
  async disconnectAll() {
    const results = {};
    for (const id of Object.keys(this.servers)) {
      results[id] = await this.servers[id].instance.disconnect();
    }
    return results;
  }
}

// Create and export a singleton instance
const mcpServerManager = new MCPServerManager();
module.exports = mcpServerManager; 