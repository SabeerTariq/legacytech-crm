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

// GET /api/customers - Get customers based on role-based filtering
router.get('/', async (req, res) => {
  try {
    console.log('🔍 Customers API: Request received');
    const { user_id } = req.query;
    console.log('🔍 Customers API: User ID:', user_id);
    
    if (!user_id) {
      console.log('🔍 Customers API: No user ID provided');
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      console.log('🔍 Customers: Fetching customers for user:', user_id);
      
      // First, get user profile to determine role and access level
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
      console.log('🔍 Customers: User profile loaded:', userProfile);

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
          sd.id,
          sd.customer_name,
          sd.email,
          sd.phone_number,
          sd.business_name,
          sd.service_sold,
          sd.gross_value,
          sd.sale_date,
          sd.created_at,
          sd.cash_in,
          sd.remaining,
          sd.user_id,
          sd.payment_mode,
          sd.company,
          sd.sales_source,
          sd.service_details,
          sd.is_upsell,
          p.id as project_id,
          p.name as project_name,
          p.status as project_status,
          p.assigned_pm_id,
          e.full_name as assigned_pm_name
        FROM sales_dispositions sd
        LEFT JOIN projects p ON sd.id = p.sales_disposition_id
        LEFT JOIN employees e ON p.assigned_pm_id = e.id
      `;

      const queryParams = [];
      let whereConditions = [];

      // Apply role-based filtering
      if (userProfile.is_admin) {
        console.log('🔍 Customers: Admin user - showing all customers');
        // Admin users see all customers - no additional filtering needed
      } else if (userDepartment === 'Upseller') {
        console.log('🔍 Customers: Upseller user - showing customers from assigned projects AND sales they made');
        // Upsellers see customers from their assigned projects AND sales they made themselves
        whereConditions.push('(p.assigned_pm_id = ? OR sd.user_id = ?)');
        queryParams.push(userProfile.employee_id, user_id);
      } else if (userDepartment === 'Front Sales') {
        console.log('🔍 Customers: Front Sales user - showing only their own customers');
        // Front Sales users see only their own customers
        whereConditions.push('sd.user_id = ?');
        queryParams.push(user_id);
      } else {
        console.log('🔍 Customers: Other user type - showing all customers');
        // Other users see all customers (no additional filtering)
      }

      // Add WHERE clause if conditions exist
      if (whereConditions.length > 0) {
        baseQuery += ` WHERE ${whereConditions.join(' AND ')}`;
      }

      baseQuery += ` ORDER BY sd.created_at DESC`;

      console.log('🔍 Customers: Executing query:', baseQuery);
      console.log('🔍 Customers: Query params:', queryParams);
      const [sales] = await mysqlConnection.execute(baseQuery, queryParams);

      console.log(`🔍 Customers: Found ${sales.length} sales dispositions`);
      if (sales.length > 0) {
        console.log('🔍 Customers: First sale sample:', sales[0]);
      }

      // Group by unique customers (email + phone combination)
      const customerMap = new Map();
      
      sales.forEach((sale) => {
        const customerKey = `${sale.email}-${sale.phone_number}`;
        
        if (!customerMap.has(customerKey)) {
          // This is a new customer, add them
          customerMap.set(customerKey, {
            id: sale.id,
            customer_name: sale.customer_name,
            email: sale.email,
            phone_number: sale.phone_number,
            business_name: sale.business_name,
            service_sold: sale.service_sold,
            gross_value: parseFloat(sale.gross_value) || 0,
            sale_date: sale.sale_date,
            created_at: sale.created_at,
            cash_in: parseFloat(sale.cash_in) || 0,
            remaining: parseFloat(sale.remaining) || 0,
            total_sales: 1,
            total_value: parseFloat(sale.gross_value) || 0,
            user_id: sale.user_id,
            payment_mode: sale.payment_mode,
            company: sale.company,
            sales_source: sale.sales_source,
            service_details: sale.service_details,
            is_upsell: sale.is_upsell,
            project_id: sale.project_id,
            project_name: sale.project_name,
            project_status: sale.project_status,
            assigned_pm_id: sale.assigned_pm_id,
            assigned_pm_name: sale.assigned_pm_name
          });
        } else {
          // Customer already exists, update totals
          const existingCustomer = customerMap.get(customerKey);
          existingCustomer.total_sales += 1;
          existingCustomer.total_value += (parseFloat(sale.gross_value) || 0);
          
          // Keep the most recent sale date
          if (new Date(sale.sale_date) > new Date(existingCustomer.sale_date)) {
            existingCustomer.sale_date = sale.sale_date;
            existingCustomer.created_at = sale.created_at;
            existingCustomer.service_sold = sale.service_sold;
            existingCustomer.gross_value = parseFloat(sale.gross_value) || 0;
            existingCustomer.cash_in = parseFloat(sale.cash_in) || 0;
            existingCustomer.remaining = parseFloat(sale.remaining) || 0;
            existingCustomer.payment_mode = sale.payment_mode;
            existingCustomer.company = sale.company;
            existingCustomer.sales_source = sale.sales_source;
            existingCustomer.service_details = sale.service_details;
            existingCustomer.is_upsell = sale.is_upsell;
            existingCustomer.project_id = sale.project_id;
            existingCustomer.project_name = sale.project_name;
            existingCustomer.project_status = sale.project_status;
            existingCustomer.assigned_pm_id = sale.assigned_pm_id;
            existingCustomer.assigned_pm_name = sale.assigned_pm_name;
          }
        }
      });

      // Convert map to array and sort by most recent
      const customers = Array.from(customerMap.values())
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      console.log(`🔍 Customers: Aggregated to ${customers.length} unique customers`);

      res.status(200).json({
        success: true,
        data: customers
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch customers',
      details: error.message
    });
  }
});

export default router;