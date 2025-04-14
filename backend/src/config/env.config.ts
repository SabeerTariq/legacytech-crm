import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'legacytech_crm',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    dialect: process.env.DB_DIALECT || 'mysql'
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_secret_key_not_secure',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    cookieExpiresIn: parseInt(process.env.JWT_COOKIE_EXPIRES_IN || '7', 10)
  }
};
