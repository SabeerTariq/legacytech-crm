import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = "https://yipyteszzyycbqgzpfrf.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required in .env file');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkDatabaseIssues() {
  console.log('🔍 Checking Database Issues...\n');

  try {
    // Test 1: Check projects table
    console.log('1️⃣ Testing projects table...');
    
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select(`
        *,
        sales_disposition:sales_dispositions(*)
      `)
      .eq("status", "unassigned")
      .limit(1);

    if (projectsError) {
      console.error('❌ Projects query error:', projectsError);
    } else {
      console.log('✅ Projects query successful:', projects?.length || 0, 'projects found');
    }

    // Test 2: Check sales_dispositions table
    console.log('\n2️⃣ Testing sales_dispositions table...');
    
    const { data: salesDispositions, error: salesError } = await supabase
      .from('sales_dispositions')
      .select('*')
      .limit(1);

    if (salesError) {
      console.error('❌ Sales dispositions query error:', salesError);
    } else {
      console.log('✅ Sales dispositions query successful:', salesDispositions?.length || 0, 'records found');
    }

    // Test 3: Check employees table
    console.log('\n3️⃣ Testing employees table...');
    
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('*')
      .eq('department', 'Production')
      .limit(1);

    if (employeesError) {
      console.error('❌ Employees query error:', employeesError);
    } else {
      console.log('✅ Employees query successful:', employees?.length || 0, 'employees found');
    }

    // Test 4: Check services table
    console.log('\n4️⃣ Testing services table...');
    
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('*')
      .limit(1);

    if (servicesError) {
      console.error('❌ Services query error:', servicesError);
    } else {
      console.log('✅ Services query successful:', services?.length || 0, 'services found');
    }

    // Test 5: Check project_assignments table
    console.log('\n5️⃣ Testing project_assignments table...');
    
    const { data: assignments, error: assignmentsError } = await supabase
      .from('project_assignments')
      .select('*')
      .limit(1);

    if (assignmentsError) {
      console.error('❌ Project assignments query error:', assignmentsError);
    } else {
      console.log('✅ Project assignments query successful:', assignments?.length || 0, 'assignments found');
    }

    // Test 6: Try to create a test sales disposition
    console.log('\n6️⃣ Testing sales disposition creation...');
    
    const testSalesData = {
      sale_date: new Date().toISOString().split('T')[0],
      customer_name: 'Test Customer',
      phone_number: '123-456-7890',
      email: 'test@example.com',
      business_name: 'Test Business',
      service_sold: 'Test Service',
      services_included: ['Test Service'],
      gross_value: 1000,
      cash_in: 500,
      remaining: 500,
      payment_mode: 'WIRE',
      company: 'Test Company',
      sales_source: 'BARK',
      lead_source: 'PAID_MARKETING',
      sale_type: 'FRONT',
      user_id: 'de514a73-4782-439e-b2ea-3f49fe568e24'
    };

    const { data: testSales, error: testSalesError } = await supabase
      .from('sales_dispositions')
      .insert(testSalesData)
      .select()
      .single();

    if (testSalesError) {
      console.error('❌ Test sales disposition creation error:', testSalesError);
      console.error('Error details:', testSalesError.details);
      console.error('Error hint:', testSalesError.hint);
    } else {
      console.log('✅ Test sales disposition created successfully:', testSales.id);
      
      // Clean up test data
      await supabase
        .from('sales_dispositions')
        .delete()
        .eq('id', testSales.id);
      console.log('🧹 Test data cleaned up');
    }

    // Test 7: Check table schemas
    console.log('\n7️⃣ Checking table schemas...');
    
    const tables = ['projects', 'sales_dispositions', 'employees', 'services', 'project_assignments'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(0);
        
        if (error) {
          console.error(`❌ ${table} table error:`, error.message);
        } else {
          console.log(`✅ ${table} table accessible`);
        }
      } catch (err) {
        console.error(`❌ ${table} table exception:`, err.message);
      }
    }

    console.log('\n🎉 Database issues check completed!');

  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

// Run the script
checkDatabaseIssues(); 