import express from 'express';
import mysql from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';
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

// GET /api/employees - Get all employees with pagination and filters
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      search, 
      department, 
      status,
      sort_by = 'full_name',
      sort_order = 'ASC'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      // Build the base query
      let baseQuery = `
        SELECT 
          e.*,
          ed.full_name as dependent_name,
          ed.relationship,
          ed.date_of_birth,
          eec.name as contact_name,
          eec.relationship as contact_relationship,
          eec.contact_number as phone,
          eec.type as contact_type
        FROM employees e
        LEFT JOIN employee_dependents ed ON e.id = ed.employee_id
        LEFT JOIN employee_emergency_contacts eec ON e.id = eec.employee_id
        WHERE 1=1
      `;

      const queryParams = [];

      // Add search filter
      if (search) {
        baseQuery += ` AND (e.full_name LIKE ? OR e.email LIKE ? OR e.employee_id LIKE ?)`;
        const searchTerm = `%${search}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm);
      }

      // Add department filter
      if (department) {
        baseQuery += ` AND e.department = ?`;
        queryParams.push(department);
      }

      // Add status filter
      if (status) {
        baseQuery += ` AND e.status = ?`;
        queryParams.push(status);
      }

      // Add sorting and pagination
      baseQuery += ` ORDER BY e.${sort_by} ${sort_order} LIMIT ? OFFSET ?`;
      queryParams.push(parseInt(limit), offset);

      // Execute the query
      const [employees] = await mysqlConnection.execute(baseQuery, queryParams);

      // Get total count for pagination
      let countQuery = `SELECT COUNT(*) as total FROM employees WHERE 1=1`;
      const countParams = [];

      if (search) {
        countQuery += ` AND (full_name LIKE ? OR email LIKE ? OR employee_id LIKE ?)`;
        const searchTerm = `%${search}%`;
        countParams.push(searchTerm, searchTerm, searchTerm);
      }

      if (department) {
        countQuery += ` AND department = ?`;
        countParams.push(department);
      }

      if (status) {
        countQuery += ` AND status = ?`;
        countParams.push(status);
      }

      const [countResult] = await mysqlConnection.execute(countQuery, countParams);
      const totalCount = countResult[0].total;

      // Group employees with their dependents and emergency contacts
      const employeeMap = new Map();
      
      employees.forEach(row => {
        if (!employeeMap.has(row.id)) {
          employeeMap.set(row.id, {
            id: row.id,
            employee_id: row.employee_id,
            full_name: row.full_name,
            email: row.email,
            phone: row.phone,
            department: row.department,
            job_title: row.job_title,
            hire_date: row.hire_date,
            status: row.status,
            salary: row.salary,
            manager_id: row.manager_id,
            location: row.location,
            user_management_email: row.user_management_email,
            created_at: row.created_at,
            updated_at: row.updated_at,
            dependents: [],
            emergency_contacts: []
          });
        }

        const employee = employeeMap.get(row.id);

        // Add dependent if exists
        if (row.full_name) {
          const existingDependent = employee.dependents.find(d => 
            d.full_name === row.full_name && 
            d.relationship === row.relationship
          );
          if (!existingDependent) {
            employee.dependents.push({
              full_name: row.full_name,
              relationship: row.relationship,
              date_of_birth: row.date_of_birth
            });
          }
        }

        // Add emergency contact if exists
        if (row.contact_name) {
          const existingContact = employee.emergency_contacts.find(c => 
            c.contact_name === row.contact_name && 
            c.phone === row.phone
          );
          if (!existingContact) {
            employee.emergency_contacts.push({
              contact_name: row.contact_name,
              relationship: row.contact_relationship,
              phone: row.phone,
              contact_type: row.contact_type
            });
          }
        }
      });

      const employeesList = Array.from(employeeMap.values());

      res.status(200).json({
        success: true,
        data: {
          employees: employeesList,
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
    console.error('Error fetching employees:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch employees',
      details: error.message
    });
  }
});

// GET /api/employees/:id - Get specific employee
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      // Get employee details
      const [employees] = await mysqlConnection.execute(`
        SELECT * FROM employees WHERE id = ?
      `, [id]);

      if (employees.length === 0) {
        return res.status(404).json({
          error: 'Employee not found',
          message: 'Employee could not be found'
        });
      }

      const employee = employees[0];

      // Get dependents
      const [dependents] = await mysqlConnection.execute(`
        SELECT * FROM employee_dependents WHERE employee_id = ?
      `, [id]);

      // Get emergency contacts
      const [emergencyContacts] = await mysqlConnection.execute(`
        SELECT * FROM employee_emergency_contacts WHERE employee_id = ?
      `, [id]);

      // Get manager info if exists
      let manager = null;
      if (employee.manager_id) {
        const [managers] = await mysqlConnection.execute(`
          SELECT id, full_name, email, department FROM employees WHERE id = ?
        `, [employee.manager_id]);
        if (managers.length > 0) {
          manager = managers[0];
        }
      }

      res.status(200).json({
        success: true,
        data: {
          ...employee,
          dependents,
          emergency_contacts: emergencyContacts,
          manager
        }
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch employee',
      details: error.message
    });
  }
});

// POST /api/employees - Create new employee
router.post('/', async (req, res) => {
  try {
    const employeeData = req.body;
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      // Start transaction
      await mysqlConnection.beginTransaction();

      try {
        // Generate employee ID if not provided
        if (!employeeData.employee_id) {
          employeeData.employee_id = `EMP${Date.now()}`;
        }

        // Create employee
        const [result] = await mysqlConnection.execute(`
          INSERT INTO employees (
            id, employee_id, full_name, email, phone, department, job_title,
            hire_date, status, salary, manager_id, location, user_management_email,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, [
          uuidv4(),
          employeeData.employee_id,
          employeeData.full_name,
          employeeData.email,
          employeeData.phone || null,
          employeeData.department || null,
          employeeData.job_title || null,
          employeeData.hire_date || null,
          employeeData.status || 'active',
          employeeData.salary || null,
          employeeData.manager_id || null,
          employeeData.location || null,
          employeeData.user_management_email || null
        ]);

        const employeeId = result.insertId;

        // Add dependents if provided
        if (employeeData.dependents && Array.isArray(employeeData.dependents)) {
          for (const dependent of employeeData.dependents) {
            await mysqlConnection.execute(`
              INSERT INTO employee_dependents (
                id, employee_id, full_name, relationship, date_of_birth
              ) VALUES (?, ?, ?, ?, ?)
            `, [
              uuidv4(),
              employeeId,
              dependent.full_name,
              dependent.relationship,
              dependent.date_of_birth || null
            ]);
          }
        }

        // Add emergency contacts if provided
        if (employeeData.emergency_contacts && Array.isArray(employeeData.emergency_contacts)) {
          for (const contact of employeeData.emergency_contacts) {
            await mysqlConnection.execute(`
              INSERT INTO employee_emergency_contacts (
                id, employee_id, name, relationship, contact_number, type
              ) VALUES (?, ?, ?, ?, ?, ?)
            `, [
              uuidv4(),
              employeeId,
              contact.contact_name,
              contact.relationship,
              contact.phone || null,
              contact.contact_type || 'emergency'
            ]);
          }
        }

        // Commit transaction
        await mysqlConnection.commit();

        // Get the created employee
        const [newEmployee] = await mysqlConnection.execute(`
          SELECT * FROM employees WHERE id = ?
        `, [employeeId]);

        res.status(201).json({
          success: true,
          message: 'Employee created successfully',
          data: newEmployee[0]
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
    console.error('Error creating employee:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to create employee',
      details: error.message
    });
  }
});

// PUT /api/employees/:id - Update employee
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      // Start transaction
      await mysqlConnection.beginTransaction();

      try {
        // Check if employee exists
        const [existingEmployees] = await mysqlConnection.execute(`
          SELECT id FROM employees WHERE id = ?
        `, [id]);

        if (existingEmployees.length === 0) {
          return res.status(404).json({
            error: 'Employee not found',
            message: 'Employee could not be found'
          });
        }

        // Update employee fields
        const employeeFields = [
          'full_name', 'email', 'phone', 'department', 'job_title',
          'hire_date', 'status', 'salary', 'manager_id', 'location', 'user_management_email'
        ];

        const updateFields = [];
        const updateValues = [];

        employeeFields.forEach(field => {
          if (updates[field] !== undefined) {
            updateFields.push(`${field} = ?`);
            updateValues.push(updates[field]);
          }
        });

        if (updateFields.length > 0) {
          updateFields.push('updated_at = CURRENT_TIMESTAMP');
          updateValues.push(id);

          await mysqlConnection.execute(`
            UPDATE employees SET ${updateFields.join(', ')} WHERE id = ?
          `, updateValues);
        }

        // Update dependents if provided
        if (updates.dependents !== undefined) {
          // Delete existing dependents
          await mysqlConnection.execute(`
            DELETE FROM employee_dependents WHERE employee_id = ?
          `, [id]);

          // Add new dependents
          if (Array.isArray(updates.dependents)) {
            for (const dependent of updates.dependents) {
              await mysqlConnection.execute(`
                INSERT INTO employee_dependents (
                  id, employee_id, full_name, relationship, date_of_birth
                ) VALUES (?, ?, ?, ?, ?)
              `, [
                uuidv4(),
                id,
                dependent.full_name,
                dependent.relationship,
                dependent.date_of_birth || null
              ]);
            }
          }
        }

        // Update emergency contacts if provided
        if (updates.emergency_contacts !== undefined) {
          // Delete existing emergency contacts
          await mysqlConnection.execute(`
            DELETE FROM employee_emergency_contacts WHERE employee_id = ?
          `, [id]);

          // Add new emergency contacts
          if (Array.isArray(updates.emergency_contacts)) {
            for (const contact of updates.emergency_contacts) {
              await mysqlConnection.execute(`
                INSERT INTO employee_emergency_contacts (
                  id, employee_id, name, relationship, contact_number, type
                ) VALUES (?, ?, ?, ?, ?, ?)
              `, [
                uuidv4(),
                id,
                contact.contact_name,
                contact.relationship,
                contact.phone || null,
                contact.contact_type || 'emergency'
              ]);
            }
          }
        }

        // Commit transaction
        await mysqlConnection.commit();

        // Get the updated employee
        const [updatedEmployee] = await mysqlConnection.execute(`
          SELECT * FROM employees WHERE id = ?
        `, [id]);

        res.status(200).json({
          success: true,
          message: 'Employee updated successfully',
          data: updatedEmployee[0]
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
    console.error('Error updating employee:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to update employee',
      details: error.message
    });
  }
});

// DELETE /api/employees/:id - Delete employee
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      // Start transaction
      await mysqlConnection.beginTransaction();

      try {
        // Check if employee exists
        const [existingEmployees] = await mysqlConnection.execute(`
          SELECT id, full_name FROM employees WHERE id = ?
        `, [id]);

        if (existingEmployees.length === 0) {
          return res.status(404).json({
            error: 'Employee not found',
            message: 'Employee could not be found'
          });
        }

        const employee = existingEmployees[0];

        // Delete related records first
        await mysqlConnection.execute(`
          DELETE FROM employee_dependents WHERE employee_id = ?
        `, [id]);

        await mysqlConnection.execute(`
          DELETE FROM employee_emergency_contacts WHERE employee_id = ?
        `, [id]);

        // Delete the employee
        await mysqlConnection.execute(`
          DELETE FROM employees WHERE id = ?
        `, [id]);

        // Commit transaction
        await mysqlConnection.commit();

        res.status(200).json({
          success: true,
          message: 'Employee deleted successfully',
          data: {
            deleted_employee: {
              id: employee.id,
              full_name: employee.full_name
            },
            deleted_at: new Date().toISOString()
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
    console.error('Error deleting employee:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to delete employee',
      details: error.message
    });
  }
});

// GET /api/employees/departments - Get all departments
router.get('/departments/list', async (req, res) => {
  try {
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      const [departments] = await mysqlConnection.execute(`
        SELECT DISTINCT department, COUNT(*) as employee_count
        FROM employees 
        WHERE department IS NOT NULL AND department != ''
        GROUP BY department
        ORDER BY department
      `);

      res.status(200).json({
        success: true,
        data: departments
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch departments',
      details: error.message
    });
  }
});

export default router;
