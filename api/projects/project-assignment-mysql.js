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

// GET /api/projects/assignment/unassigned - Get unassigned projects with role-based filtering
router.get('/unassigned', async (req, res) => {
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
      // First, get user profile to determine access level
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
      console.log('🔍 ProjectAssignment: User profile loaded:', userProfile);

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

      // Build base query for unassigned projects
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
          p.updated_at
        FROM projects p
        WHERE p.status = 'unassigned'
      `;

      const queryParams = [];

      // Apply relationship-based filtering based on user role
      if (userProfile.is_admin) {
        console.log('🔍 ProjectAssignment: Admin user - showing all unassigned projects');
        // Admin users see all unassigned projects - no additional filtering needed
      } else if (userDepartment === 'Upseller') {
        console.log('🔍 ProjectAssignment: Upseller user - showing unassigned projects they can be assigned to');
        // Upsellers see unassigned projects they can be assigned to (no filtering needed for assignment view)
      } else if (userDepartment === 'Front Sales') {
        console.log('🔍 ProjectAssignment: Front Sales user - showing unassigned projects from their sales');
        // Front Sales users see unassigned projects from their sales
        baseQuery += ` AND p.sales_disposition_id IN (
          SELECT id FROM sales_dispositions WHERE user_id = ?
        )`;
        queryParams.push(user_id);
      } else {
        console.log('🔍 ProjectAssignment: Other user type - showing all unassigned projects');
        // Other users see all unassigned projects (no additional filtering)
      }

      baseQuery += ` ORDER BY p.created_at DESC`;

      console.log('🔍 ProjectAssignment: Executing query:', baseQuery);
      const [projects] = await mysqlConnection.execute(baseQuery, queryParams);

      console.log(`🔍 ProjectAssignment: Found ${projects.length} unassigned projects`);

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
          updated_at: project.updated_at
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
    console.error('Error fetching unassigned projects:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch unassigned projects',
      details: error.message
    });
  }
});

// GET /api/projects/assignment/project-managers - Get project managers (users with upseller role)
router.get('/project-managers', async (req, res) => {
  try {
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      console.log("🔍 ProjectAssignment: Loading project managers with upseller role...");
      
      // Get users who have been assigned the "upseller" role through role management
      const [upsellerUsers] = await mysqlConnection.execute(`
        SELECT 
          up.user_id,
          up.email,
          up.display_name,
          e.id as employee_id,
          e.full_name,
          e.department,
          e.job_title
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        JOIN user_profiles up ON ur.user_id = up.user_id
        LEFT JOIN employees e ON up.employee_id = e.id
        WHERE r.name = 'upseller'
        ORDER BY e.full_name, up.display_name
      `);

      console.log(`🔍 ProjectAssignment: Found ${upsellerUsers.length} users with upseller role`);

      // Transform the data to match the expected format
      const transformedPMs = upsellerUsers.map(user => ({
        id: user.employee_id || user.user_id, // Use employee_id if available, otherwise user_id
        full_name: user.full_name || user.display_name || 'Unknown',
        email: user.email || '',
        department: user.department || 'Upseller',
        job_title: user.job_title || 'Project Manager'
      }));

      res.status(200).json({
        success: true,
        data: transformedPMs
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error fetching project managers:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch project managers',
      details: error.message
    });
  }
});

// POST /api/projects/assignment/assign - Assign a project to a project manager
router.post('/assign', async (req, res) => {
  try {
    const { project_id, pm_id } = req.body;
    
    if (!project_id || !pm_id) {
      return res.status(400).json({
        success: false,
        error: 'Project ID and PM ID are required'
      });
    }

    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      console.log(`🔍 ProjectAssignment: Assigning project ${project_id} to PM ${pm_id}`);
      
      // Update project assignment
      const [result] = await mysqlConnection.execute(`
        UPDATE projects 
        SET 
          assigned_pm_id = ?,
          assignment_date = NOW(),
          status = 'assigned',
          updated_at = NOW()
        WHERE id = ?
      `, [pm_id, project_id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        });
      }

      console.log(`✅ Project ${project_id} assigned to PM ${pm_id} successfully`);

      res.status(200).json({
        success: true,
        message: 'Project assigned successfully',
        data: {
          project_id,
          pm_id,
          assignment_date: new Date().toISOString()
        }
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error assigning project:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to assign project',
      details: error.message
    });
  }
});

export default router;
