import pool from './connection.js';

/**
 * Database Service - Centralized database operations
 * Uses connection pooling for better performance
 */
class DatabaseService {
  /**
   * Execute a query with parameters
   * @param {string} query - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<Array>} Query results
   */
  static async query(query, params = []) {
    try {
      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  /**
   * Execute a query and return the first row
   * @param {string} query - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<Object|null>} First row or null
   */
  static async queryOne(query, params = []) {
    const rows = await this.query(query, params);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Execute a transaction
   * @param {Function} callback - Transaction callback function
   * @returns {Promise<any>} Transaction result
   */
  static async transaction(callback) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get connection from pool (for complex operations)
   * @returns {Promise<Connection>} MySQL connection
   */
  static async getConnection() {
    return await pool.getConnection();
  }

  /**
   * Check if database is connected
   * @returns {Promise<boolean>} Connection status
   */
  static async isConnected() {
    try {
      await this.query('SELECT 1');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get pool statistics
   * @returns {Object} Pool statistics
   */
  static getPoolStats() {
    return {
      totalConnections: pool.pool._allConnections.length,
      freeConnections: pool.pool._freeConnections.length,
      usedConnections: pool.pool._allConnections.length - pool.pool._freeConnections.length,
      queuedRequests: pool.pool._connectionQueue.length
    };
  }
}

export default DatabaseService;
