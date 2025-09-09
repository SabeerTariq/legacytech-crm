import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'dev_root',
  password: process.env.MYSQL_PASSWORD || 'Developer@1234',
  database: process.env.MYSQL_DATABASE || 'logicworks_crm',
  port: process.env.MYSQL_PORT || 3306,
  multipleStatements: false
};

/**
 * Generate employee user email based on name and department
 */
function generateEmployeeUserEmail(fullName, department) {
  // Clean the name and department
  const cleanName = fullName.replace(/[^a-zA-Z\s]/g, '').trim();
  const cleanDepartment = department ? department.replace(/[^a-zA-Z\s]/g, '').trim() : '';
  
  // Convert to lowercase and replace spaces with dots
  const namePart = cleanName.toLowerCase().replace(/\s+/g, '.');
  const departmentPart = cleanDepartment.toLowerCase().replace(/\s+/g, '.');
  
  // Create email
  let email = `${namePart}@logicworks.com`;
  
  // Add department prefix if available
  if (departmentPart) {
    email = `${namePart}.${departmentPart}@logicworks.com`;
  }
  
  return email;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { employee_id, password, permissions } = req.body;

    // Validate required fields
    if (!employee_id || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        message: 'employee_id and password are required' 
      });
    }

    console.log('Creating user for employee:', employee_id);

    // Connect to MySQL database
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      // Start transaction
      await mysqlConnection.beginTransaction();

      try {
        // Get employee data first
        const [employeeData] = await mysqlConnection.execute(`
          SELECT * FROM employees WHERE id = ?
        `, [employee_id]);

        if (employeeData.length === 0) {
          return res.status(400).json({ 
            error: 'Employee not found',
            message: 'Employee could not be found'
          });
        }

        const employee = employeeData[0];
        console.log('Employee found:', employee.full_name);

        // Generate or get user management email
        let userManagementEmail = employee.user_management_email;
        
        if (!userManagementEmail) {
          // Generate user management email
          userManagementEmail = generateEmployeeUserEmail(employee.full_name, employee.department);
          
          // Update employee with the generated email
          await mysqlConnection.execute(`
            UPDATE employees 
            SET user_management_email = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `, [userManagementEmail, employee_id]);
        }

        console.log('Using user management email:', userManagementEmail);

        // Clean up any existing data that might cause conflicts
        console.log('Cleaning up any existing data for employee:', employee_id);
        
        // Check if user profile already exists for this employee
        const [existingProfile] = await mysqlConnection.execute(`
          SELECT user_id, email FROM user_profiles WHERE employee_id = ?
        `, [employee_id]);

        if (existingProfile.length > 0) {
          const existingUserId = existingProfile[0].user_id;
          console.log('Found existing profile for employee, deleting auth user:', existingUserId);
          
          // Delete existing user data
          await mysqlConnection.execute(`DELETE FROM user_roles WHERE user_id = ?`, [existingUserId]);
          await mysqlConnection.execute(`DELETE FROM auth_user_sessions WHERE user_id = ?`, [existingUserId]);
          await mysqlConnection.execute(`DELETE FROM auth_password_reset_tokens WHERE user_id = ?`, [existingUserId]);
          await mysqlConnection.execute(`DELETE FROM auth_audit_log WHERE user_id = ?`, [existingUserId]);
          await mysqlConnection.execute(`DELETE FROM user_profiles WHERE user_id = ?`, [existingUserId]);
          await mysqlConnection.execute(`DELETE FROM auth_users WHERE id = ?`, [existingUserId]);
        }

        // Create new auth user
        const authUserId = uuidv4();
        const passwordHash = await bcrypt.hash(password, 12);
        
        await mysqlConnection.execute(`
          INSERT INTO auth_users (
            id, email, password_hash, display_name, is_admin, 
            is_active, email_confirmed_at, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, [
          authUserId, 
          userManagementEmail, 
          passwordHash, 
          employee.full_name,
          permissions?.is_admin || false,
          true,
          new Date()
        ]);

        console.log('Auth user created:', authUserId);

        // Create user profile
        await mysqlConnection.execute(`
          INSERT INTO user_profiles (
            id, user_id, employee_id, display_name, email, 
            is_active, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, [
          uuidv4(),
          authUserId,
          employee_id,
          employee.full_name,
          userManagementEmail,
          true
        ]);

        console.log('User profile created');

        // Assign roles if specified
        if (permissions && permissions.roles && Array.isArray(permissions.roles)) {
          for (const roleName of permissions.roles) {
            // Get role ID
            const [roles] = await mysqlConnection.execute(`
              SELECT id FROM roles WHERE name = ?
            `, [roleName]);

            if (roles.length > 0) {
              await mysqlConnection.execute(`
                INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)
              `, [authUserId, roles[0].id]);
              console.log(`Role '${roleName}' assigned`);
            } else {
              console.log(`Role '${roleName}' not found, skipping`);
            }
          }
        }

        // Commit transaction
        await mysqlConnection.commit();

        // Get the created user data
        const [newUser] = await mysqlConnection.execute(`
          SELECT 
            au.id,
            au.email,
            au.display_name,
            au.is_admin,
            au.is_active,
            up.employee_id,
            e.department,
            e.job_title,
            GROUP_CONCAT(r.name SEPARATOR ', ') as roles
          FROM auth_users au
          JOIN user_profiles up ON au.id = up.user_id
          JOIN employees e ON up.employee_id = e.id
          LEFT JOIN user_roles ur ON au.id = ur.user_id
          LEFT JOIN roles r ON ur.role_id = r.id
          WHERE au.id = ?
          GROUP BY au.id, au.email, au.display_name, au.is_admin, au.is_active, up.employee_id, e.department, e.job_title
        `, [authUserId]);

        if (newUser.length === 0) {
          return res.status(500).json({
            error: 'User creation failed',
            message: 'User was created but could not be retrieved'
          });
        }

        const user = newUser[0];
        return res.status(201).json({
          success: true,
          message: 'User created successfully',
          data: {
            user_id: user.id,
            email: user.email,
            display_name: user.display_name,
            is_admin: user.is_admin,
            is_active: user.is_active,
            employee_id: user.employee_id,
            department: user.department,
            job_title: user.job_title,
            roles: user.roles || 'No roles assigned',
            created_at: new Date().toISOString()
          }
        });

      } catch (error) {
        // Rollback transaction on error
        await mysqlConnection.rollback();
        throw error;
      }

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error in create-user API:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to create user',
      details: error.message
    });
  }
}
