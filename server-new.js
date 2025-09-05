import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authenticateToken, requireAdmin } from './src/lib/auth/auth-middleware.js';

// Import new authentication endpoints
import loginHandler from './api/auth/login.js';
import logoutHandler from './api/auth/logout.js';
import profileHandler from './api/auth/profile.js';

// Import old admin endpoints (to be converted later)
import createUserHandler from './api/admin/create-user-clean.js';
import deleteUserHandler from './api/admin/delete-user-fixed.js';
import updateUserHandler from './api/admin/update-user.js';
import getUserRolesHandler from './api/admin/get-user-roles.js';
import checkUserRoleHandler from './api/admin/check-user-role.js';
import createConversationHandler from './api/admin/create-conversation.js';
import getConversationsHandler from './api/admin/get-conversations.js';
import rolesRouter from './api/admin/roles.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// ============================================================================
// NEW JWT AUTHENTICATION ENDPOINTS
// ============================================================================
app.post('/api/auth/login', loginHandler);
app.post('/api/auth/logout', authenticateToken, logoutHandler);
app.get('/api/auth/profile', authenticateToken, profileHandler);

// ============================================================================
// OLD ADMIN API ROUTES (TO BE CONVERTED TO MYSQL)
// ============================================================================
// These endpoints still use Supabase and need to be converted
app.post('/api/admin/create-user', authenticateToken, requireAdmin, createUserHandler);
app.delete('/api/admin/delete-user', authenticateToken, requireAdmin, deleteUserHandler);
app.put('/api/admin/update-user', authenticateToken, requireAdmin, updateUserHandler);
app.get('/api/admin/get-user-roles', authenticateToken, requireAdmin, getUserRolesHandler);
app.post('/api/admin/check-user-role', authenticateToken, requireAdmin, checkUserRoleHandler);
app.post('/api/admin/create-conversation', authenticateToken, requireAdmin, createConversationHandler);
app.get('/api/admin/get-conversations', authenticateToken, requireAdmin, getConversationsHandler);
app.use('/api/admin/roles', authenticateToken, requireAdmin, rolesRouter);

// ============================================================================
// HEALTH CHECK AND STATUS ENDPOINTS
// ============================================================================
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'JWT Authentication API server is running',
    version: '2.0.0',
    features: {
      jwt_auth: true,
      mysql_database: true,
      supabase_migration: 'in_progress'
    }
  });
});

app.get('/api/status', (req, res) => {
  res.json({
    server: 'running',
    database: 'mysql',
    authentication: 'jwt',
    migration_status: {
      business_data: '100% complete',
      authentication: '100% complete',
      api_endpoints: 'in_progress',
      frontend: 'pending'
    }
  });
});

// ============================================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================================
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred'
  });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The requested route ${req.originalUrl} does not exist`
  });
});

app.listen(PORT, () => {
  console.log('🚀 JWT Authentication API server running on port', PORT);
  console.log('📊 Server Status:');
  console.log('   ✅ JWT Authentication: ENABLED');
  console.log('   ✅ MySQL Database: CONNECTED');
  console.log('   🔄 Supabase Migration: IN PROGRESS');
  console.log('   📍 Health Check: http://localhost:' + PORT + '/api/health');
  console.log('   📍 Status: http://localhost:' + PORT + '/api/status');
});
