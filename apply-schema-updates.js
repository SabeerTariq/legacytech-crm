import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const SUPABASE_URL = "https://yipyteszzyycbqgzpfrf.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required in .env file');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function applySchemaUpdates() {
  console.log('🔧 Applying Database Schema Updates...\n');

  try {
    // Read the schema file
    const schemaSQL = fs.readFileSync('optimized-conversion-schema.sql', 'utf8');
    
    // Split the SQL into individual statements
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments and empty statements
      if (statement.startsWith('--') || statement.length === 0) {
        continue;
      }

      try {
        console.log(`🔄 Executing statement ${i + 1}/${statements.length}...`);
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // Try direct execution for some statements
          const { error: directError } = await supabase.rpc('exec_sql', { 
            sql: statement + ';' 
          });
          
          if (directError) {
            console.log(`❌ Statement ${i + 1} failed:`, directError.message);
            errorCount++;
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
            successCount++;
          }
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
          successCount++;
        }
      } catch (err) {
        console.log(`❌ Statement ${i + 1} failed:`, err.message);
        errorCount++;
      }
    }

    console.log('\n🎉 Schema Update Summary:');
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log(`📊 Total: ${statements.length}`);

    if (errorCount === 0) {
      console.log('\n🎉 All schema updates applied successfully!');
      console.log('🚀 You can now run: npm run test-conversion-flow');
    } else {
      console.log('\n⚠️  Some updates failed. Please check the errors above.');
      console.log('💡 You may need to run some statements manually in Supabase SQL Editor.');
    }

  } catch (error) {
    console.error('❌ Failed to apply schema updates:', error);
  }
}

// Alternative approach: Manual execution guide
async function showManualInstructions() {
  console.log('📋 MANUAL SCHEMA UPDATE INSTRUCTIONS\n');
  console.log('Since automatic execution may not work, please follow these steps:\n');
  
  console.log('1️⃣ Open your Supabase Dashboard');
  console.log('2️⃣ Go to SQL Editor');
  console.log('3️⃣ Copy and paste the contents of optimized-conversion-schema.sql');
  console.log('4️⃣ Click "Run" to execute all statements');
  console.log('5️⃣ Verify the updates with: npm run test-conversion-flow\n');
  
  console.log('📁 File to copy: optimized-conversion-schema.sql');
  console.log('🔗 Supabase URL: https://supabase.com/dashboard/project/yipyteszzyycbqgzpfrf/sql');
}

// Check if we can execute SQL directly
async function checkExecutionCapability() {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: 'SELECT 1 as test;' 
    });
    
    if (error) {
      console.log('❌ Direct SQL execution not available');
      showManualInstructions();
      return false;
    } else {
      console.log('✅ Direct SQL execution available');
      return true;
    }
  } catch (err) {
    console.log('❌ Direct SQL execution not available');
    showManualInstructions();
    return false;
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting Schema Update Process...\n');
  
  const canExecute = await checkExecutionCapability();
  
  if (canExecute) {
    await applySchemaUpdates();
  }
}

main().then(() => {
  console.log('\n🏁 Process completed');
  process.exit(0);
}).catch((error) => {
  console.error('Process failed:', error);
  process.exit(1);
}); 