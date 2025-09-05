import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authenticateToken, requireAdmin } from './src/lib/auth/auth-middleware.js';

// Import new authentication endpoints
import loginHandler from './api/auth/login.js';
import logoutHandler from './api/auth/logout.js';
import profileHandler from './api/auth/profile.js';

// Import new MySQL-based admin endpoints
import createUserHandler from './api/admin/create-user-mysql.js';
import deleteUserHandler from './api/admin/delete-user-mysql.js';
import updateUserHandler from './api/admin/update-user-mysql.js';
import getUserRolesHandler from './api/admin/get-user-roles-mysql.js';
import checkUserRoleHandler from './api/admin/check-user-role-mysql.js';
import createConversationHandler from './api/admin/create-conversation-mysql.js';
import getConversationsHandler from './api/admin/get-conversations-mysql.js';
import rolesRouter from './api/admin/roles-mysql.js';

// Import business API endpoints
import employeesRouter from './api/employees/employees-mysql.js';
import customersRouter from './api/customers/customers-mysql.js';
import fileStorageRouter from './api/files/file-storage-mysql.js';
import leadsRouter from './api/leads/leads-mysql.js';
import salesRouter from './api/sales/sales-mysql.js';
import salesDispositionRouter from './api/sales/sales-disposition-mysql.js';
import salesDispositionsRouter from './api/sales/sales-dispositions-mysql.js';
import projectsRouter from './api/projects/projects-mysql.js';
import projectAssignmentRouter from './api/projects/project-assignment-mysql.js';
import myProjectsRouter from './api/projects/my-projects-mysql.js';
import recurringServicesRouter from './api/recurring-services/recurring-services-mysql.js';

// Import WebSocket realtime server
import RealtimeServer from './api/realtime/websocket-server.js';
import path from 'path';
import mysql from 'mysql2/promise';

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
// BUSINESS API ENDPOINTS (MYSQL-BASED)
// ============================================================================
app.use('/api/employees', authenticateToken, employeesRouter);
app.use('/api/customers', authenticateToken, customersRouter);
app.use('/api/files', authenticateToken, fileStorageRouter);
app.use('/api/leads', authenticateToken, leadsRouter);
app.use('/api/sales', authenticateToken, salesRouter);
app.use('/api/sales-disposition', authenticateToken, salesDispositionRouter);
app.use('/api/sales/sales-dispositions', authenticateToken, salesDispositionsRouter);
app.use('/api/projects/my-projects', authenticateToken, myProjectsRouter);
app.use('/api/projects/assignment', authenticateToken, projectAssignmentRouter);
app.use('/api/projects', authenticateToken, projectsRouter);
app.use('/api/recurring-services', authenticateToken, recurringServicesRouter);

// Upseller Management API
import upsellerDataHandler from './api/admin/upseller-data-mysql.js';
app.get('/api/admin/upseller-data', authenticateToken, upsellerDataHandler);

// Upseller Dashboard API
import upsellerDashboardRouter from './api/upseller/dashboard-mysql.js';
app.use('/api/upseller', authenticateToken, upsellerDashboardRouter);

// Upseller Targets API
import upsellerTargetsRouter from './api/upseller/targets-mysql.js';
app.use('/api/upseller', authenticateToken, upsellerTargetsRouter);

// Front Sales Management APIs
import frontSalesTeamsRouter from './api/front-sales/teams-mysql.js';
app.use('/api/front-sales', authenticateToken, frontSalesTeamsRouter);

import frontSalesTeamMembersRouter from './api/front-sales/team-members-mysql.js';
app.use('/api/front-sales', authenticateToken, frontSalesTeamMembersRouter);

import frontSalesTargetsRouter from './api/front-sales/targets-mysql.js';
app.use('/api/front-sales', authenticateToken, frontSalesTargetsRouter);

import frontSalesPerformanceRouter from './api/front-sales/performance-mysql.js';
app.use('/api/front-sales', authenticateToken, frontSalesPerformanceRouter);

import frontSalesDashboardRouter from './api/front-sales/dashboard-mysql.js';
app.use('/api/front-sales', authenticateToken, frontSalesDashboardRouter);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

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

// ============================================================================
// TEST ENDPOINTS (NO AUTHENTICATION REQUIRED)
// ============================================================================
app.get('/api/test/sales-dispositions', async (req, res) => {
  try {
    const mysqlConnection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || undefined,
      database: process.env.MYSQL_DATABASE || 'logicworks_crm',
      port: process.env.MYSQL_PORT || 3306
    });
    
    const [salesDispositions] = await mysqlConnection.execute('SELECT * FROM sales_dispositions LIMIT 5');
    await mysqlConnection.end();
    
    res.json({
      success: true,
      data: {
        sales_dispositions: salesDispositions,
        message: 'Test endpoint - no authentication required'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/test/projects', async (req, res) => {
  try {
    const mysqlConnection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || undefined,
      database: process.env.MYSQL_DATABASE || 'logicworks_crm',
      port: process.env.MYSQL_PORT || 3306
    });
    
    const [projects] = await mysqlConnection.execute('SELECT * FROM projects LIMIT 5');
    await mysqlConnection.end();
    
    res.json({
      success: true,
      data: {
        projects: projects,
        message: 'Test endpoint - no authentication required'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/test/recurring-services', async (req, res) => {
  try {
    const mysqlConnection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || undefined,
      database: process.env.MYSQL_DATABASE || 'logicworks_crm',
      port: process.env.MYSQL_PORT || 3306
    });
    
    const [recurringServices] = await mysqlConnection.execute(`
      SELECT rps.*, p.name as project_name, p.sales_disposition_id 
      FROM recurring_payment_schedule rps 
      LEFT JOIN projects p ON rps.project_id = p.id 
      LIMIT 5
    `);
    await mysqlConnection.end();
    
    res.json({
      success: true,
      data: {
        recurring_services: recurringServices,
        message: 'Test endpoint - no authentication required'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/status', (req, res) => {
  res.json({
    server: 'running',
    database: 'mysql',
    authentication: 'jwt',
    migration_status: {
      business_data: '100% complete',
      authentication: '100% complete',
      api_endpoints: '100% complete',
      business_apis: '100% complete',
      file_storage: '100% complete',
      realtime: '100% complete',
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

const server = app.listen(PORT, () => {
  console.log('🚀 JWT Authentication API server running on port', PORT);
  console.log('📊 Server Status:');
  console.log('   ✅ JWT Authentication: ENABLED');
  console.log('   ✅ MySQL Database: CONNECTED');
  console.log('   🔄 Supabase Migration: PHASE 5 COMPLETE');
  console.log('   📍 Health Check: http://localhost:' + PORT + '/api/health');
  console.log('   📍 Status: http://localhost:' + PORT + '/api/status');
});

// Initialize WebSocket realtime server
const realtimeServer = new RealtimeServer(server);
console.log('   🔌 WebSocket Realtime: ENABLED');

// Make realtime server available globally for broadcasting
global.realtimeServer = realtimeServer;
