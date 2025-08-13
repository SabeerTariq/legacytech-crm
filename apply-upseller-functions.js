import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

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

async function applyUpsellerFunctions() {
  console.log('🔧 Applying Upseller Performance Functions Migration...\n');

  try {
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '009_add_upseller_performance_functions.sql');
    
    if (!fs.existsSync(migrationPath)) {
      console.error('❌ Migration file not found:', migrationPath);
      return;
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('✅ Migration file loaded successfully');

    // Split the SQL into individual statements and filter out comments
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => {
        const trimmed = stmt.trim();
        return trimmed.length > 0 && 
               !trimmed.startsWith('--') && 
               !trimmed.startsWith('/*') &&
               !trimmed.endsWith('*/');
      });

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // Execute each statement using direct SQL execution
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`\n🔧 Executing statement ${i + 1}/${statements.length}...`);
        console.log(`SQL: ${statement.substring(0, 100)}...`);
        
        try {
          // Use the postgres function to execute SQL directly
          const { data, error } = await supabaseAdmin.rpc('exec_sql', {
            sql: statement + ';'
          });

          if (error) {
            console.error(`❌ Error in statement ${i + 1}:`, error.message);
            // Continue with other statements
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (error) {
          console.error(`❌ Error executing statement ${i + 1}:`, error.message);
        }
      }
    }

    console.log('\n🏁 Migration completed!');

    // Test the function
    console.log('\n🧪 Testing the new function...');
    try {
      const { data, error } = await supabaseAdmin.rpc('get_upseller_performance_summary', {
        p_month: '2024-01'
      });

      if (error) {
        console.log(`   ❌ Function test failed: ${error.message}`);
      } else {
        console.log(`   ✅ Function test successful: ${data?.length || 0} records returned`);
      }
    } catch (error) {
      console.log(`   ❌ Function test error: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Error applying migration:', error.message);
  }
}

applyUpsellerFunctions();
