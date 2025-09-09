// Debug version of auth middleware - add this temporarily to see the exact error
import { verifyToken, extractTokenFromHeader } from './src/lib/auth/jwt-utils.js';
import mysql from 'mysql2/promise';

const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'dev_root',
  password: process.env.MYSQL_PASSWORD || 'Developer@1234',
  database: process.env.MYSQL_DATABASE || 'logicworks_crm',
  port: process.env.MYSQL_PORT || 3306,
  multipleStatements: false
};

export async function debugAuthenticateToken(req, res, next) {
  try {
    console.log('=== AUTH DEBUG START ===');
    console.log('Environment check:');
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('MYSQL_HOST:', process.env.MYSQL_HOST);
    console.log('MYSQL_USER:', process.env.MYSQL_USER);
    console.log('MYSQL_DATABASE:', process.env.MYSQL_DATABASE);
    
    const authHeader = req.headers.authorization;
    console.log('Auth header:', authHeader);
    
    const token = extractTokenFromHeader(authHeader);
    console.log('Extracted token:', token ? 'EXISTS' : 'MISSING');

    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ 
        error: 'Access token required',
        message: 'Please provide a valid authentication token'
      });
    }

    console.log('Verifying token...');
    const decoded = verifyToken(token);
    console.log('Decoded token:', decoded);
    
    if (!decoded) {
      console.log('Token verification failed');
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'The provided token is invalid or expired'
      });
    }

    console.log('Connecting to database...');
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    console.log('Database connected successfully');
    
    try {
      console.log('Querying user with ID:', decoded.id);
      const [users] = await mysqlConnection.execute(`
        SELECT id, email, display_name, is_admin, is_active, created_at, updated_at
        FROM auth_users 
        WHERE id = ? AND is_active = TRUE
      `, [decoded.id]);

      console.log('Query result:', users);

      if (users.length === 0) {
        console.log('User not found or inactive');
        return res.status(401).json({ 
          error: 'User not found',
          message: 'User account not found or inactive'
        });
      }

      const user = users[0];
      console.log('User found:', user);
      
      req.user = {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        is_admin: user.is_admin,
        created_at: user.created_at,
        updated_at: user.updated_at
      };

      console.log('Authentication successful, calling next()');
      next();
    } finally {
      await mysqlConnection.end();
      console.log('Database connection closed');
    }

  } catch (error) {
    console.error('=== AUTH DEBUG ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error object:', error);
    console.error('=== END AUTH DEBUG ===');
    
    return res.status(500).json({ 
      error: 'Authentication error',
      message: 'An error occurred during authentication',
      debug: {
        errorType: error.constructor.name,
        errorMessage: error.message
      }
    });
  }
}
