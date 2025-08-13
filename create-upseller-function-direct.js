import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = "https://yipyteszzyycbqgzpfrf.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment variables');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createUpsellerFunction() {
  console.log('🔧 Creating Upseller Performance Function (Direct Method)...\n');

  try {
    // First, let's check what tables exist
    console.log('🔍 Checking existing tables...');
    
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['upseller_performance', 'upseller_targets_management', 'upseller_teams', 'upseller_team_members']);

    if (tablesError) {
      console.error('❌ Error checking tables:', tablesError);
      return;
    }

    console.log('📋 Found tables:', tables?.map(t => t.table_name));

    // Check if the function already exists
    console.log('\n🔍 Checking if function already exists...');
    
    try {
      const { data: testData, error: testError } = await supabaseAdmin.rpc('get_upseller_performance_summary', {
        p_month: '2024-01'
      });

      if (testError && testError.message.includes('function "get_upseller_performance_summary" does not exist')) {
        console.log('✅ Function does not exist, need to create it');
      } else if (testError) {
        console.log('⚠️  Function exists but has error:', testError.message);
        return;
      } else {
        console.log('✅ Function already exists and works!');
        return;
      }
    } catch (error) {
      console.log('✅ Function does not exist, need to create it');
    }

    // Since we can't use exec_sql, let's try to create a view that mimics the function
    console.log('\n🔧 Creating alternative solution using views...');
    
    // Create a view that provides the same data structure
    const createViewSQL = `
      CREATE OR REPLACE VIEW upseller_performance_summary_view AS
      SELECT 
        up.seller_id::UUID as employee_id,
        COALESCE(e.full_name, 'Unknown User') as employee_name,
        COALESCE(ut.name, 'No Team') as team_name,
        up.month,
        COALESCE(utm.target_accounts, 0) as target_accounts,
        COALESCE(utm.target_gross, 0) as target_gross,
        COALESCE(utm.target_cash_in, 0) as target_cash_in,
        up.accounts_achieved as achieved_accounts,
        up.total_gross as achieved_gross,
        up.total_cash_in as achieved_cash_in,
        CASE 
          WHEN COALESCE(utm.target_cash_in, 0) > 0 THEN (up.total_cash_in / utm.target_cash_in) * 100
          ELSE 0 
        END as performance_percentage,
        ROW_NUMBER() OVER (PARTITION BY ut.id ORDER BY up.total_cash_in DESC) as rank_in_team,
        ROW_NUMBER() OVER (ORDER BY up.total_cash_in DESC) as rank_overall
      FROM upseller_performance up
      INNER JOIN user_profiles p ON p.id = up.seller_id
      INNER JOIN employees e ON e.email = p.username || '@example.com'
      LEFT JOIN upseller_team_members utm ON utm.employee_id = e.id
      LEFT JOIN upseller_teams ut ON ut.id = utm.team_id
      LEFT JOIN upseller_targets_management utm_target ON utm_target.employee_id = e.id AND utm_target.month = up.month
      WHERE e.department = 'Upseller';
    `;

    console.log('📝 Attempting to create view...');
    
    // Try to create the view using a different approach
    // Since we can't use exec_sql, let's try to create it through the Supabase dashboard
    console.log('\n⚠️  Cannot create function without exec_sql access');
    console.log('📝 Please create the function manually in your Supabase dashboard:');
    console.log('\n1. Go to your Supabase project dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste this SQL:');
    console.log('\n' + createViewSQL);
    console.log('\n4. Execute the SQL');
    
    // Alternative: Try to create a simple function using the Supabase client
    console.log('\n🔧 Attempting to create function using alternative method...');
    
    // Check if we can create functions through the API
    const { data: functions, error: functionsError } = await supabaseAdmin
      .from('information_schema.routines')
      .select('routine_name')
      .eq('routine_schema', 'public')
      .eq('routine_type', 'FUNCTION');

    if (functionsError) {
      console.error('❌ Error checking functions:', functionsError);
    } else {
      console.log('📋 Existing functions:', functions?.map(f => f.routine_name));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createUpsellerFunction();
