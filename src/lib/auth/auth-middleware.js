import { verifyToken, extractTokenFromHeader } from './jwt-utils.js';
import mysql from 'mysql2/promise';

const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'dev_root',
  password: process.env.MYSQL_PASSWORD || 'Developer@1234',
  database: process.env.MYSQL_DATABASE || 'logicworks_crm',
  port: process.env.MYSQL_PORT || 3306,
  multipleStatements: false
};

/**
 * Authentication middleware for Express routes
 * Verifies JWT token and adds user info to req.user
 */
export async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        message: 'Please provide a valid authentication token'
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'The provided token is invalid or expired'
      });
    }

    // Get fresh user data from database
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    try {
      const [users] = await mysqlConnection.execute(`
        SELECT id, email, display_name, is_admin, is_active, created_at, updated_at
        FROM auth_users 
        WHERE id = ? AND is_active = TRUE
      `, [decoded.id]);

      if (users.length === 0) {
        return res.status(401).json({ 
          error: 'User not found',
          message: 'User account not found or inactive'
        });
      }

      const user = users[0];
      
      // Add user info to request object
      req.user = {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        is_admin: user.is_admin,
        created_at: user.created_at,
        updated_at: user.updated_at
      };

      next();
    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({ 
      error: 'Authentication error',
      message: 'An error occurred during authentication'
    });
  }
}

/**
 * Admin-only middleware
 * Must be used after authenticateToken
 */
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'Please authenticate first'
    });
  }

  if (!req.user.is_admin) {
    return res.status(403).json({ 
      error: 'Admin access required',
      message: 'This operation requires administrator privileges'
    });
  }

  next();
}

/**
 * Optional authentication middleware
 * Adds user info if token is provided, but doesn't require it
 */
export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        const mysqlConnection = await mysql.createConnection(mysqlConfig);
        try {
          const [users] = await mysqlConnection.execute(`
            SELECT id, email, display_name, is_admin, is_active
            FROM auth_users 
            WHERE id = ? AND is_active = TRUE
          `, [decoded.id]);

          if (users.length > 0) {
            const user = users[0];
            req.user = {
              id: user.id,
              email: user.email,
              display_name: user.display_name,
              is_admin: user.is_admin
            };
          }
        } finally {
          await mysqlConnection.end();
        }
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    // Continue without authentication
    next();
  }
}

/**
 * Role-based access control middleware
 * @param {string[]} allowedRoles - Array of allowed role names
 */
export function requireRole(allowedRoles) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please authenticate first'
      });
    }

    try {
      const mysqlConnection = await mysql.createConnection(mysqlConfig);
      try {
        // Get user roles
        const [userRoles] = await mysqlConnection.execute(`
          SELECT r.name 
          FROM user_roles ur
          JOIN roles r ON ur.role_id = r.id
          WHERE ur.user_id = ?
        `, [req.user.id]);

        const userRoleNames = userRoles.map(role => role.name);
        
        // Check if user has any of the allowed roles
        const hasAllowedRole = userRoleNames.some(role => 
          allowedRoles.includes(role)
        );

        if (!hasAllowedRole) {
          return res.status(403).json({ 
            error: 'Insufficient permissions',
            message: `Required roles: ${allowedRoles.join(', ')}`
          });
        }

        next();
      } finally {
        await mysqlConnection.end();
      }
    } catch (error) {
      console.error('Role check middleware error:', error);
      return res.status(500).json({ 
        error: 'Role verification error',
        message: 'An error occurred while checking user roles'
      });
    }
  };
}

/**
 * Log authentication attempts
 * @param {Object} req - Express request object
 * @param {Object} user - User object (null if authentication failed)
 * @param {boolean} success - Whether authentication was successful
 */
export async function logAuthAttempt(req, user, success) {
  try {
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    try {
      // Safely extract IP address
      let ipAddress = 'unknown';
      if (req.ip) {
        ipAddress = req.ip;
      } else if (req.connection && req.connection.remoteAddress) {
        ipAddress = req.connection.remoteAddress;
      } else if (req.headers['x-forwarded-for']) {
        ipAddress = req.headers['x-forwarded-for'].split(',')[0];
      } else if (req.headers['x-real-ip']) {
        ipAddress = req.headers['x-real-ip'];
      }

      await mysqlConnection.execute(`
        INSERT INTO auth_audit_log (
          user_id, action, ip_address, user_agent, details
        ) VALUES (?, ?, ?, ?, ?)
      `, [
        user?.id || null,
        success ? 'login_success' : 'login_failed',
        ipAddress,
        req.headers['user-agent'] || null,
        JSON.stringify({
          email: req.body?.email || 'unknown',
          success,
          timestamp: new Date().toISOString()
        })
      ]);
    } finally {
      await mysqlConnection.end();
    }
  } catch (error) {
    console.error('Failed to log auth attempt:', error);
    // Don't throw error, just log it
  }
}
