import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'dev_root',
  password: process.env.MYSQL_PASSWORD || 'Developer@1234',
  database: process.env.MYSQL_DATABASE || 'logicworks_crm',
  port: process.env.MYSQL_PORT || 3306,
  multipleStatements: false
};

// GET /api/projects/my-projects - Get user's projects based on role/department
router.get('/', async (req, res) => {
  try {
    const { user_id } = req.query;
    
    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      console.log('🔍 MyProjects: Fetching projects for user:', user_id);
      
      // First, get user profile to determine department and access level
      const [userProfiles] = await mysqlConnection.execute(`
        SELECT 
          up.id,
          up.user_id,
          up.email,
          up.display_name,
          up.employee_id,
          up.is_admin,
          up.attributes,
          e.full_name,
          e.department,
          e.job_title
        FROM user_profiles up
        LEFT JOIN employees e ON up.employee_id = e.id
        WHERE up.user_id = ?
      `, [user_id]);

      if (userProfiles.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'User profile not found'
        });
      }

      const userProfile = userProfiles[0];
      console.log('🔍 MyProjects: User profile loaded:', userProfile);

      // Parse attributes to get department if not available from employees table
      let userDepartment = userProfile.department;
      if (!userDepartment && userProfile.attributes) {
        try {
          const attributes = JSON.parse(userProfile.attributes);
          userDepartment = attributes.department || 'General';
        } catch (e) {
          userDepartment = 'General';
        }
      }

      // Build comprehensive query with role-based filtering
      let baseQuery = `
        SELECT 
          p.id,
          p.name,
          p.client,
          p.description,
          p.budget,
          p.due_date,
          p.status,
          p.services,
          p.sales_disposition_id,
          p.assigned_pm_id,
          p.assignment_date,
          p.created_at,
          p.updated_at,
          p.total_amount,
          p.amount_paid,
          e.full_name as assigned_pm_name,
          e.department as pm_department,
          e.job_title as pm_job_title,
          sd.customer_name as sales_customer_name,
          sd.gross_value as sales_gross_value,
          sd.cash_in as sales_cash_in,
          sd.remaining as sales_remaining,
          sd.tax_deduction as sales_tax_deduction,
          sd.seller as sales_seller,
          sd.sale_date as sales_date,
          sd.payment_mode as sales_payment_mode,
          sd.company as sales_company,
          sd.sales_source as sales_source
        FROM projects p
        LEFT JOIN employees e ON p.assigned_pm_id = e.id
        LEFT JOIN sales_dispositions sd ON p.sales_disposition_id = sd.id
      `;

      const queryParams = [];
      let whereConditions = [];

      // Apply role-based filtering
      if (userProfile.is_admin) {
        console.log('🔍 MyProjects: Admin user - showing all projects');
        // Admin users see all projects - no additional filtering needed
      } else if (userDepartment === 'Upseller') {
        console.log('🔍 MyProjects: Upseller user - showing only assigned projects');
        // Upsellers see only their assigned projects
        whereConditions.push('p.assigned_pm_id = ?');
        queryParams.push(userProfile.employee_id);
      } else if (userDepartment === 'Front Sales') {
        console.log('🔍 MyProjects: Front Sales user - showing projects from their sales');
        // Front Sales users see projects from their sales
        whereConditions.push('p.sales_disposition_id IN (SELECT id FROM sales_dispositions WHERE user_id = ?)');
        queryParams.push(user_id);
      } else {
        console.log('🔍 MyProjects: Other user type - showing all projects');
        // Other users see all projects (no additional filtering)
      }

      // Add WHERE clause if conditions exist
      if (whereConditions.length > 0) {
        baseQuery += ` WHERE ${whereConditions.join(' AND ')}`;
      }

      baseQuery += ` ORDER BY p.created_at DESC`;

      console.log('🔍 MyProjects: Executing query:', baseQuery);
      const [projects] = await mysqlConnection.execute(baseQuery, queryParams);

      console.log(`🔍 MyProjects: Found ${projects.length} projects`);

      // Transform the data
      const transformedProjects = projects.map(project => {
        // Parse services if it's a JSON string
        let services = [];
        if (project.services) {
          try {
            services = typeof project.services === 'string' 
              ? JSON.parse(project.services) 
              : project.services;
          } catch (e) {
            services = [];
          }
        }

        return {
          id: project.id,
          name: project.name,
          client: project.client || 'N/A',
          description: project.description,
          budget: parseFloat(project.budget) || 0,
          due_date: project.due_date,
          status: project.status,
          services: services,
          sales_disposition_id: project.sales_disposition_id,
          assigned_pm_id: project.assigned_pm_id,
          assignment_date: project.assignment_date,
          created_at: project.created_at,
          updated_at: project.updated_at,
          total_amount: parseFloat(project.total_amount) || 0,
          amount_paid: parseFloat(project.amount_paid) || 0,
          assigned_pm_name: project.assigned_pm_name || 'Unassigned',
          pm_department: project.pm_department || 'N/A',
          pm_job_title: project.pm_job_title || 'N/A',
          sales_customer_name: project.sales_customer_name || 'N/A',
          sales_gross_value: parseFloat(project.sales_gross_value) || 0,
          sales_cash_in: parseFloat(project.sales_cash_in) || 0,
          sales_remaining: parseFloat(project.sales_remaining) || 0,
          sales_tax_deduction: parseFloat(project.sales_tax_deduction) || 0,
          sales_seller: project.sales_seller || 'N/A',
          sales_date: project.sales_date || 'N/A',
          sales_payment_mode: project.sales_payment_mode || 'N/A',
          sales_company: project.sales_company || 'N/A',
          sales_source: project.sales_source || 'N/A',
          display_total_amount: project.total_amount > 0 ? project.total_amount : (project.sales_gross_value || 0),
          display_amount_paid: project.amount_paid > 0 ? project.amount_paid : (project.sales_cash_in || 0),
          display_remaining: project.sales_remaining || 0,
          display_budget: project.budget > 0 ? project.budget : (project.sales_gross_value || 0)
        };
      });

      res.status(200).json({
        success: true,
        data: transformedProjects
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error fetching my projects:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch my projects',
      details: error.message
    });
  }
});

// PUT /api/projects/my-projects/:id/status - Update project status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!id || !status) {
      return res.status(400).json({
        success: false,
        error: 'Project ID and status are required'
      });
    }

    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      console.log(`🔍 MyProjects: Updating project ${id} status to ${status}`);
      
      // Update project status
      const [result] = await mysqlConnection.execute(`
        UPDATE projects 
        SET 
          status = ?,
          updated_at = NOW()
        WHERE id = ?
      `, [status, id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        });
      }

      console.log(`✅ Project ${id} status updated to ${status} successfully`);

      res.status(200).json({
        success: true,
        message: 'Project status updated successfully',
        data: {
          id,
          status,
          updated_at: new Date().toISOString()
        }
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error updating project status:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to update project status',
      details: error.message
    });
  }
});

export default router;
