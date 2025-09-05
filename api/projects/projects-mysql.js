import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || undefined,
  database: process.env.MYSQL_DATABASE || 'logicworks_crm',
  port: process.env.MYSQL_PORT || 3306,
  multipleStatements: false
};

// GET /api/projects - Get projects with filters
router.get('/', async (req, res) => {
  try {
    const { 
      assigned_pm_id,
      sales_disposition_ids,
      page = 1, 
      limit = 100,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      // Build the base query
      let baseQuery = `
        SELECT 
          id,
          name,
          description,
          status,
          budget,
          due_date,
          assigned_pm_id,
          sales_disposition_id,
          is_recurring,
          recurring_frequency,
          next_payment_date,
          total_installments,
          current_installment,
          installment_frequency,
          created_at,
          updated_at
        FROM projects 
        WHERE 1=1
      `;

      const queryParams = [];

      // Add assigned_pm_id filter
      if (assigned_pm_id) {
        baseQuery += ` AND assigned_pm_id = ?`;
        queryParams.push(assigned_pm_id);
      }

      // Add sales_disposition_ids filter
      if (sales_disposition_ids) {
        const ids = sales_disposition_ids.split(',').map(id => id.trim());
        if (ids.length > 0) {
          const placeholders = ids.map(() => '?').join(',');
          baseQuery += ` AND sales_disposition_id IN (${placeholders})`;
          queryParams.push(...ids);
        }
      }

      // Add sorting and pagination
      baseQuery += ` ORDER BY ${sort_by} ${sort_order} LIMIT ? OFFSET ?`;
      queryParams.push(parseInt(limit), offset);

      console.log('Projects query:', baseQuery);
      console.log('Projects query parameters:', queryParams);

      // Execute the query
      const [projects] = await mysqlConnection.execute(baseQuery, queryParams);

      console.log('Projects found:', projects.length);

      // Get total count for pagination
      let countQuery = `SELECT COUNT(*) as total FROM projects WHERE 1=1`;
      const countParams = [];

      if (assigned_pm_id) {
        countQuery += ` AND assigned_pm_id = ?`;
        countParams.push(assigned_pm_id);
      }

      if (sales_disposition_ids) {
        const ids = sales_disposition_ids.split(',').map(id => id.trim());
        if (ids.length > 0) {
          const placeholders = ids.map(() => '?').join(',');
          countQuery += ` AND sales_disposition_id IN (${placeholders})`;
          countParams.push(...ids);
        }
      }

      const [countResult] = await mysqlConnection.execute(countQuery, countParams);
      const totalCount = countResult[0].total;

      res.status(200).json({
        success: true,
        data: {
          projects: projects,
          pagination: {
            total: totalCount,
            page: parseInt(page),
            limit: parseInt(limit),
            total_pages: Math.ceil(totalCount / parseInt(limit))
          }
        }
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch projects',
      details: error.message
    });
  }
});

// GET /api/projects/test - Simple test endpoint
router.get('/test', async (req, res) => {
  res.json({
    success: true,
    message: 'Projects router is working!',
    timestamp: new Date().toISOString()
  });
});

// GET /api/projects/all-comprehensive - Get all projects with comprehensive data for AllProjects view
router.get('/all-comprehensive', async (req, res) => {
  try {
    console.log('🔍 All-comprehensive endpoint called');
    
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      // Comprehensive query using the ACTUAL database schema
      const [projects] = await mysqlConnection.execute(`
        SELECT 
          p.id,
          p.name,
          p.client,
          p.description,
          p.due_date,
          p.status,
          p.assigned_pm_id,
          p.services,
          p.created_at,
          p.total_amount,
          p.amount_paid,
          p.budget,
          p.sales_disposition_id,
          -- Employee/PM data
          e.full_name as assigned_pm_name,
          e.department as pm_department,
          e.job_title as pm_job_title,
          -- Sales data
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
        ORDER BY p.created_at DESC
      `);

      if (projects.length === 0) {
        return res.status(200).json({
          success: true,
          data: []
        });
      }

      // Transform the data to match the frontend expectations
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
          due_date: project.due_date,
          status: project.status,
          assigned_pm_id: project.assigned_pm_id,
          services: services,
          created_at: project.created_at,
          // Ensure numeric fields are properly parsed
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
          // Improved calculation logic for Total Value and Cash Received
          // Priority: project.total_amount > sales_dispositions.gross_value > 0
          display_total_amount: (project.total_amount !== null && project.total_amount !== undefined && project.total_amount !== '') ? parseFloat(project.total_amount) : (parseFloat(project.sales_gross_value) || 0),
          // Priority: project.amount_paid > sales_dispositions.cash_in > 0  
          display_amount_paid: (project.amount_paid !== null && project.amount_paid !== undefined && project.amount_paid !== '') ? parseFloat(project.amount_paid) : (parseFloat(project.sales_cash_in) || 0),
          display_remaining: parseFloat(project.sales_remaining) || 0,
          display_budget: parseFloat(project.budget) || 0
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
    console.error('Error in all-comprehensive endpoint:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch comprehensive projects',
      details: error.message
    });
  }
});

// PUT /api/projects/:id/status - Update project status
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
      console.log(`🔍 ProjectDetail: Updating project ${id} status to ${status}`);
      
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

// GET /api/projects/:id - Get specific project with comprehensive data
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      console.log('🔍 ProjectDetail: Fetching project:', id);
      
      // Get comprehensive project data with related information
      const [projects] = await mysqlConnection.execute(`
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
        WHERE p.id = ?
      `, [id]);

      if (projects.length === 0) {
        return res.status(404).json({
          error: 'Project not found',
          message: 'Project could not be found'
        });
      }

      const project = projects[0];
      console.log('🔍 ProjectDetail: Found project:', project.name);

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

      // Transform the data to match the expected format
      const transformedProject = {
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

      console.log('🔍 ProjectDetail: Returning transformed project data');

      res.status(200).json({
        success: true,
        data: transformedProject
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch project',
      details: error.message
    });
  }
});

export default router;
