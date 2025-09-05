const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY
);

async function debugUpsellCustomers() {
  console.log('🔍 Debugging Upsell Customer Selection...\n');

  try {
    // 1. Check if we can connect to the database
    console.log('1. Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('sales_dispositions')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('❌ Database connection failed:', testError);
      return;
    }
    console.log('✅ Database connection successful\n');

    // 2. Check total customers in sales_dispositions
    console.log('2. Checking total customers in sales_dispositions...');
    const { count: totalCustomers, error: countError } = await supabase
      .from('sales_dispositions')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Error counting customers:', countError);
    } else {
      console.log(`✅ Total customers in sales_dispositions: ${totalCustomers}\n`);
    }

    // 3. Check projects table structure
    console.log('3. Checking projects table structure...');
    const { data: projectsSample, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .limit(5);
    
    if (projectsError) {
      console.error('❌ Error fetching projects:', projectsError);
    } else {
      console.log('✅ Projects table structure:');
      console.log('Sample projects:', projectsSample);
      console.log('');
    }

    // 4. Check if there are any projects with assigned_pm_id
    console.log('4. Checking projects with assigned_pm_id...');
    const { data: assignedProjects, error: assignedError } = await supabase
      .from('projects')
      .select('id, name, assigned_pm_id, sales_disposition_id')
      .not('assigned_pm_id', 'is', null);
    
    if (assignedError) {
      console.error('❌ Error fetching assigned projects:', assignedError);
    } else {
      console.log(`✅ Projects with assigned_pm_id: ${assignedProjects?.length || 0}`);
      if (assignedProjects && assignedProjects.length > 0) {
        console.log('Sample assigned projects:', assignedProjects.slice(0, 3));
      }
      console.log('');
    }

    // 5. Check employees table for upsellers
    console.log('5. Checking employees table for upsellers...');
    const { data: upsellers, error: upsellersError } = await supabase
      .from('employees')
      .select('id, full_name, department, email')
      .eq('department', 'Upseller');
    
    if (upsellersError) {
      console.error('❌ Error fetching upsellers:', upsellersError);
    } else {
      console.log(`✅ Upsellers found: ${upsellers?.length || 0}`);
      if (upsellers && upsellers.length > 0) {
        console.log('Sample upsellers:', upsellers.slice(0, 3));
      }
      console.log('');
    }

    // 6. Check specific upseller assignments (if any exist)
    if (assignedProjects && assignedProjects.length > 0) {
      console.log('6. Checking specific upseller assignments...');
      const upsellerIds = [...new Set(assignedProjects.map(p => p.assigned_pm_id).filter(id => id))];
      
      for (const upsellerId of upsellerIds.slice(0, 3)) { // Check first 3 upsellers
        const { data: upsellerProjects, error: upsellerError } = await supabase
          .from('projects')
          .select('id, name, assigned_pm_id, sales_disposition_id')
          .eq('assigned_pm_id', upsellerId);
        
        if (upsellerError) {
          console.error(`❌ Error fetching projects for upseller ${upsellerId}:`, upsellerError);
        } else {
          console.log(`✅ Upseller ${upsellerId} has ${upsellerProjects?.length || 0} assigned projects`);
          if (upsellerProjects && upsellerProjects.length > 0) {
            console.log('Sample projects:', upsellerProjects.slice(0, 2));
          }
        }
      }
      console.log('');
    }

    // 7. Check sales_disposition_id links
    console.log('7. Checking sales_disposition_id links in projects...');
    const { data: linkedProjects, error: linkedError } = await supabase
      .from('projects')
      .select('id, name, sales_disposition_id')
      .not('sales_disposition_id', 'is', null);
    
    if (linkedError) {
      console.error('❌ Error fetching linked projects:', linkedError);
    } else {
      console.log(`✅ Projects with sales_disposition_id: ${linkedProjects?.length || 0}`);
      if (linkedProjects && linkedProjects.length > 0) {
        console.log('Sample linked projects:', linkedProjects.slice(0, 3));
      }
      console.log('');
    }

    // 8. Test the actual customer query logic
    console.log('8. Testing customer query logic...');
    if (assignedProjects && assignedProjects.length > 0) {
      const sampleUpsellerId = assignedProjects[0].assigned_pm_id;
      console.log(`Testing with upseller ID: ${sampleUpsellerId}`);
      
      // Get projects assigned to this upseller
      const { data: testProjects, error: testProjectsError } = await supabase
        .from('projects')
        .select('sales_disposition_id')
        .eq('assigned_pm_id', sampleUpsellerId)
        .not('sales_disposition_id', 'is', null);

      if (testProjectsError) {
        console.error('❌ Error in test projects query:', testProjectsError);
      } else {
        console.log(`✅ Test upseller has ${testProjects?.length || 0} projects with sales_disposition_id`);
        
        if (testProjects && testProjects.length > 0) {
          const salesDispositionIds = testProjects
            .map(p => p.sales_disposition_id)
            .filter(id => id !== null);
          
          console.log('Sales disposition IDs:', salesDispositionIds);
          
          // Now try to get customers
          const { data: testCustomers, error: testCustomersError } = await supabase
            .from('sales_dispositions')
            .select('id, customer_name, email')
            .in('id', salesDispositionIds)
            .limit(5);
          
          if (testCustomersError) {
            console.error('❌ Error in test customers query:', testCustomersError);
          } else {
            console.log(`✅ Found ${testCustomers?.length || 0} customers for test upseller`);
            if (testCustomers && testCustomers.length > 0) {
              console.log('Sample customers:', testCustomers);
            }
          }
        }
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

debugUpsellCustomers();
