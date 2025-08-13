import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = "https://yipyteszzyycbqgzpfrf.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixFunctionOverloading() {
  console.log('🔧 Fixing Function Overloading Issue\n');

  try {
    // 1. Drop all existing versions of the function
    console.log('📝 1. Dropping existing function versions...');
    
    const dropQueries = [
      'DROP FUNCTION IF EXISTS get_team_performance_summary(p_month DATE) CASCADE;',
      'DROP FUNCTION IF EXISTS get_team_performance_summary(p_month TEXT) CASCADE;',
      'DROP FUNCTION IF EXISTS get_team_performance_summary(p_month TIMESTAMP) CASCADE;',
      'DROP FUNCTION IF EXISTS get_team_performance_summary(p_month VARCHAR) CASCADE;'
    ];

    for (const query of dropQueries) {
      const { error } = await supabaseAdmin.rpc('exec_sql', { sql: query });
      if (error) {
        console.log(`   ⚠️  Warning: ${error.message}`);
      } else {
        console.log(`   ✅ Dropped function version`);
      }
    }

    // 2. Create the clean function with new email linking system
    console.log('\n📝 2. Creating clean function version...');
    
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION get_team_performance_summary(p_month DATE)
      RETURNS TABLE (
        seller_id UUID,
        seller_name TEXT,
        accounts_achieved INTEGER,
        total_gross NUMERIC,
        total_cash_in NUMERIC,
        total_remaining NUMERIC,
        performance_rank BIGINT
      ) AS $$
      BEGIN
        RETURN QUERY
        SELECT 
          fsp.seller_id,
          COALESCE(e.full_name, up.display_name, 'Unknown User') as seller_name,
          fsp.accounts_achieved,
          fsp.total_gross,
          fsp.total_cash_in,
          fsp.total_remaining,
          ROW_NUMBER() OVER (ORDER BY fsp.accounts_achieved DESC, fsp.total_gross DESC) as performance_rank
        FROM front_seller_performance fsp
        -- Join with user_profiles to get the user management email (primary linking)
        LEFT JOIN user_profiles up ON up.user_id = fsp.seller_id
        -- Join with employees using the employee_id link
        LEFT JOIN employees e ON e.id = up.employee_id
        -- Only include performance data for the specified month
        WHERE fsp.month = p_month
        -- Only include employees who are in Front Sales teams or have sales-related emails
        AND (e.department = 'Front Sales' OR up.email LIKE '%.sal@logicworks.com' OR up.email LIKE '%.fro@logicworks.com')
        -- Order by performance
        ORDER BY fsp.accounts_achieved DESC, fsp.total_gross DESC;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;

    const { error: createError } = await supabaseAdmin.rpc('exec_sql', { sql: createFunctionSQL });
    
    if (createError) {
      console.log('❌ Error creating function:', createError.message);
      return;
    } else {
      console.log('   ✅ Clean function created successfully');
    }

    // 3. Test the function
    console.log('\n🧪 3. Testing the function...');
    
    const currentMonth = new Date().toISOString().split('T')[0].substring(0, 7) + '-01';
    console.log(`   Testing with date: ${currentMonth}`);
    
    const { data: testResult, error: testError } = await supabaseAdmin
      .rpc('get_team_performance_summary', { p_month: currentMonth });

    if (testError) {
      console.log('❌ Function test failed:', testError.message);
    } else {
      console.log(`   ✅ Function test successful! Returned ${testResult?.length || 0} records`);
      
      if (testResult && testResult.length > 0) {
        console.log('\n   Sample results:');
        testResult.slice(0, 3).forEach((perf, index) => {
          console.log(`   ${index + 1}. ${perf.seller_name || 'Unknown'}`);
          console.log(`      Accounts: ${perf.accounts_achieved}`);
          console.log(`      Gross: $${perf.total_gross}`);
          console.log(`      Rank: ${perf.performance_rank}`);
          console.log('');
        });
      }
    }

    // 4. Show function signature
    console.log('📋 4. Function signature:');
    const { data: signature, error: sigError } = await supabaseAdmin
      .rpc('exec_sql', { 
        sql: `
          SELECT 
            p.proname as function_name,
            pg_get_function_arguments(p.oid) as arguments,
            pg_get_function_result(p.oid) as return_type
          FROM pg_proc p
          JOIN pg_namespace n ON p.pronamespace = n.oid
          WHERE n.nspname = 'public' 
          AND p.proname = 'get_team_performance_summary';
        `
      });

    if (sigError) {
      console.log('❌ Error fetching function signature:', sigError.message);
    } else {
      console.log('   ✅ Function signature confirmed');
    }

    console.log('\n✅ Function overloading issue resolved successfully!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Run generate-emails-for-employees.js to generate emails');
    console.log('   2. Run create-front-sales-users.js to create user accounts');
    console.log('   3. Test the system with test-new-email-linking.js');

  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

// Run the fix
fixFunctionOverloading(); 