import mysql from 'mysql2/promise';
import { extractTokenFromHeader } from '../../src/lib/auth/jwt-utils.js';
import dotenv from 'dotenv';

dotenv.config();

const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || undefined,
  database: process.env.MYSQL_DATABASE || 'logicworks_crm',
  port: process.env.MYSQL_PORT || 3306,
  multipleStatements: false
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(400).json({ 
        error: 'No token provided',
        message: 'No authentication token found in request'
      });
    }

    // Connect to database
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      // Add token to revoked sessions (optional - for token blacklisting)
      // This is a simple approach. For production, consider using Redis for better performance
      await mysqlConnection.execute(`
        INSERT INTO auth_user_sessions (
          id, user_id, token_hash, expires_at, is_revoked
        ) VALUES (
          UUID(), 
          (SELECT id FROM auth_users WHERE id = ? LIMIT 1), 
          ?, 
          DATE_ADD(NOW(), INTERVAL 1 DAY), 
          TRUE
        )
      `, [req.user?.id || 'unknown', token]);

      // Log logout action
      await mysqlConnection.execute(`
        INSERT INTO auth_audit_log (
          user_id, action, ip_address, user_agent, details
        ) VALUES (?, ?, ?, ?, ?)
      `, [
        req.user?.id || null,
        'logout',
        req.ip || req.connection.remoteAddress,
        req.headers['user-agent'] || null,
        JSON.stringify({
          timestamp: new Date().toISOString(),
          token_revoked: true
        })
      ]);

    } finally {
      await mysqlConnection.end();
    }

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Logout successful',
      data: {
        message: 'You have been successfully logged out'
      }
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'An error occurred during logout'
    });
  }
}
