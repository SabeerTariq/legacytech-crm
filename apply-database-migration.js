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

async function applyDatabaseMigration() {
  console.log('🔧 Applying Database Migration for New Email Linking System\n');

  try {
    // 1. Add new columns to employees table
    console.log('📝 1. Adding new columns to employees table...');
    
    const addColumnsQueries = [
      `ALTER TABLE employees ADD COLUMN IF NOT EXISTS user_management_email TEXT;`,
      `ALTER TABLE employees ADD COLUMN IF NOT EXISTS personal_email TEXT;`
    ];

    for (const query of addColumnsQueries) {
      const { error } = await supabaseAdmin.rpc('exec_sql', { sql: query });
      if (error) {
        console.log(`   ⚠️  Warning: ${error.message}`);
      } else {
        console.log(`   ✅ Column added successfully`);
      }
    }

    // 2. Update employees table to move current email to personal_email
    console.log('\n📝 2. Moving existing emails to personal_email...');
    
    const updateEmailQuery = `
      UPDATE employees 
      SET personal_email = email, user_management_email = NULL 
      WHERE personal_email IS NULL;
    `;

    const { error: updateError } = await supabaseAdmin.rpc('exec_sql', { sql: updateEmailQuery });
    if (updateError) {
      console.log(`   ⚠️  Warning: ${updateError.message}`);
    } else {
      console.log(`   ✅ Emails moved successfully`);
    }

    // 3. Create the email generation function
    console.log('\n📝 3. Creating email generation function...');
    
    const createEmailFunctionSQL = `
      CREATE OR REPLACE FUNCTION generate_employee_user_email(employee_full_name TEXT, employee_department TEXT)
      RETURNS TEXT AS $$
      DECLARE
        clean_name TEXT;
        dept_prefix TEXT;
        base_email TEXT;
        final_email TEXT;
        counter INTEGER := 1;
      BEGIN
        -- Clean the employee name
        clean_name := LOWER(REGEXP_REPLACE(employee_full_name, '[^a-zA-Z0-9\\s]', '', 'g'));
        clean_name := REGEXP_REPLACE(TRIM(clean_name), '\\s+', '.', 'g');
        
        -- Get department prefix (first 3 letters)
        dept_prefix := LOWER(SUBSTRING(employee_department FROM 1 FOR 3));
        
        -- Create base email
        base_email := clean_name || '.' || dept_prefix || '@logicworks.com';
        
        -- Check for uniqueness and add number if needed
        final_email := base_email;
        
        WHILE EXISTS (
          SELECT 1 FROM employees 
          WHERE user_management_email = final_email
        ) LOOP
          final_email := clean_name || '.' || dept_prefix || counter || '@logicworks.com';
          counter := counter + 1;
        END LOOP;
        
        RETURN final_email;
      END;
      $$ LANGUAGE plpgsql;
    `;

    const { error: funcError } = await supabaseAdmin.rpc('exec_sql', { sql: createEmailFunctionSQL });
    if (funcError) {
      console.log(`   ❌ Error creating function: ${funcError.message}`);
    } else {
      console.log(`   ✅ Email generation function created successfully`);
    }

    // 4. Create the sync function
    console.log('\n📝 4. Creating sync function...');
    
    const createSyncFunctionSQL = `
      CREATE OR REPLACE FUNCTION sync_employee_user_emails()
      RETURNS VOID AS $$
      DECLARE
        emp_record RECORD;
      BEGIN
        FOR emp_record IN 
          SELECT id, full_name, department 
          FROM employees 
          WHERE user_management_email IS NULL
        LOOP
          UPDATE employees 
          SET user_management_email = generate_employee_user_email(emp_record.full_name, emp_record.department)
          WHERE id = emp_record.id;
        END LOOP;
      END;
      $$ LANGUAGE plpgsql;
    `;

    const { error: syncError } = await supabaseAdmin.rpc('exec_sql', { sql: createSyncFunctionSQL });
    if (syncError) {
      console.log(`   ❌ Error creating sync function: ${syncError.message}`);
    } else {
      console.log(`   ✅ Sync function created successfully`);
    }

    // 5. Create the linking status view
    console.log('\n📝 5. Creating linking status view...');
    
    const createViewSQL = `
      CREATE OR REPLACE VIEW employee_user_linking_status AS
      SELECT 
        e.id as employee_id,
        e.full_name as employee_name,
        e.email as original_email,
        e.personal_email,
        e.user_management_email as system_email,
        e.department,
        up.user_id as profile_user_id,
        up.email as profile_email,
        CASE 
          WHEN up.user_id IS NOT NULL THEN 'LINKED'
          WHEN e.user_management_email IS NOT NULL THEN 'NEEDS_ACCOUNT_CREATION'
          ELSE 'NEEDS_EMAIL_GENERATION'
        END as linking_status
      FROM employees e
      LEFT JOIN user_profiles up ON up.employee_id = e.id
      ORDER BY e.full_name;
    `;

    const { error: viewError } = await supabaseAdmin.rpc('exec_sql', { sql: createViewSQL });
    if (viewError) {
      console.log(`   ❌ Error creating view: ${viewError.message}`);
    } else {
      console.log(`   ✅ Linking status view created successfully`);
    }

    // 6. Fix the team performance function
    console.log('\n📝 6. Fixing team performance function...');
    
    const fixFunctionSQL = `
      DROP FUNCTION IF EXISTS get_team_performance_summary(p_month DATE) CASCADE;
      DROP FUNCTION IF EXISTS get_team_performance_summary(p_month TEXT) CASCADE;
      DROP FUNCTION IF EXISTS get_team_performance_summary(p_month TIMESTAMP) CASCADE;
      
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
        LEFT JOIN user_profiles up ON up.user_id = fsp.seller_id
        LEFT JOIN employees e ON e.id = up.employee_id
        WHERE fsp.month = p_month
        AND (e.department = 'Front Sales' OR up.email LIKE '%.sal@logicworks.com' OR up.email LIKE '%.fro@logicworks.com')
        ORDER BY fsp.accounts_achieved DESC, fsp.total_gross DESC;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;

    const { error: fixError } = await supabaseAdmin.rpc('exec_sql', { sql: fixFunctionSQL });
    if (fixError) {
      console.log(`   ❌ Error fixing function: ${fixError.message}`);
    } else {
      console.log(`   ✅ Team performance function fixed successfully`);
    }

    // 7. Test the migration
    console.log('\n🧪 7. Testing the migration...');
    
    // Test email generation
    const { data: testEmail, error: emailTestError } = await supabaseAdmin.rpc(
      'generate_employee_user_email',
      {
        employee_full_name: 'Test Employee',
        employee_department: 'Front Sales'
      }
    );

    if (emailTestError) {
      console.log('❌ Email generation test failed:', emailTestError.message);
    } else {
      console.log(`   ✅ Email generation test successful: ${testEmail}`);
    }

    // Test the view
    const { data: viewTest, error: viewTestError } = await supabaseAdmin
      .from('employee_user_linking_status')
      .select('*')
      .limit(3);

    if (viewTestError) {
      console.log('❌ View test failed:', viewTestError.message);
    } else {
      console.log(`   ✅ View test successful: ${viewTest?.length || 0} records`);
    }

    console.log('\n✅ Database migration completed successfully!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Run generate-emails-for-employees.js to generate emails');
    console.log('   2. Run create-front-sales-users.js to create user accounts');
    console.log('   3. Test the system with test-new-email-linking.js');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Run the migration
applyDatabaseMigration(); 