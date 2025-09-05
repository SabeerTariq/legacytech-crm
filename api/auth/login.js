import mysql from 'mysql2/promise';
import { comparePassword, generateToken } from '../../src/lib/auth/jwt-utils.js';
import { logAuthAttempt as logAuthAttemptMiddleware } from '../../src/lib/auth/auth-middleware.js';
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
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Missing credentials',
        message: 'Email and password are required'
      });
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid input type',
        message: 'Email and password must be strings'
      });
    }

    // Connect to database
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      // Get user from auth_users table
      const [users] = await mysqlConnection.execute(`
        SELECT id, email, password_hash, display_name, is_admin, is_active
        FROM auth_users 
        WHERE email = ? AND is_active = TRUE
      `, [email]);

      if (users.length === 0) {
        // Log failed attempt
        await logAuthAttemptMiddleware(req, null, false);
        
        return res.status(401).json({ 
          error: 'Authentication failed',
          message: 'Invalid email or password'
        });
      }

      const user = users[0];

      // Verify password
      const isPasswordValid = await comparePassword(password, user.password_hash);
      
      if (!isPasswordValid) {
        // Log failed attempt
        await logAuthAttemptMiddleware(req, null, false);
        
        return res.status(401).json({ 
          error: 'Authentication failed',
          message: 'Invalid email or password'
        });
      }

      // Get additional user info from user_profiles and employees
      const [userProfiles] = await mysqlConnection.execute(`
        SELECT up.*, e.department, e.full_name, e.job_title
        FROM user_profiles up
        LEFT JOIN employees e ON up.employee_id = e.id
        WHERE up.user_id = ?
      `, [user.id]);

      let userProfile = null;
      if (userProfiles.length > 0) {
        userProfile = userProfiles[0];
      }

      // Update last sign in
      await mysqlConnection.execute(`
        UPDATE auth_users 
        SET last_sign_in_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `, [user.id]);

      // Generate JWT token
      const token = generateToken({
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        is_admin: user.is_admin
      });

      // Log successful login
      await logAuthAttemptMiddleware(req, user, true);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            display_name: user.display_name,
            is_admin: user.is_admin,
            department: userProfile?.department || null,
            full_name: userProfile?.full_name || user.display_name,
            job_title: userProfile?.job_title || null
          },
          token,
          expires_in: 24 * 60 * 60 // 24 hours in seconds
        }
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'An error occurred during login'
    });
  }
}
