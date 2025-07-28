const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function runDatabaseOptimization() {
  console.log('🚀 Starting Database Optimization for LogicWorks CRM...\n');

  try {
    // Read the optimization SQL file
    const sqlPath = path.join(__dirname, 'database-optimization.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Split the SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📋 Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments and empty statements
      if (statement.startsWith('--') || statement.length === 0) {
        continue;
      }

      try {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // Try direct execution for statements that can't be run via RPC
          const { error: directError } = await supabase
            .from('_exec_sql')
            .select('*')
            .eq('sql', statement)
            .single();
            
          if (directError) {
            console.log(`❌ Error in statement ${i + 1}: ${error.message}`);
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
        console.log(`❌ Error in statement ${i + 1}: ${err.message}`);
        errorCount++;
      }
    }

    console.log('\n📊 Optimization Summary:');
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📈 Total: ${statements.length}`);

    if (errorCount === 0) {
      console.log('\n🎉 Database optimization completed successfully!');
      console.log('✨ Your CRM system is now optimized for better performance.');
    } else {
      console.log('\n⚠️  Some optimizations failed. Check the errors above.');
    }

  } catch (error) {
    console.error('💥 Fatal error during optimization:', error.message);
    process.exit(1);
  }
}

// Alternative approach using direct SQL execution
async function runOptimizationDirect() {
  console.log('🚀 Running Database Optimization (Direct Method)...\n');

  try {
    // Read the optimization SQL file
    const sqlPath = path.join(__dirname, 'database-optimization.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Execute the entire SQL file
    const { error } = await supabase.rpc('exec_sql', { sql: sqlContent });

    if (error) {
      console.error('❌ Error executing optimization:', error.message);
      console.log('\n💡 Try running the SQL manually in your Supabase dashboard:');
      console.log('1. Go to your Supabase project dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Copy and paste the contents of database-optimization.sql');
      console.log('4. Execute the script');
    } else {
      console.log('✅ Database optimization completed successfully!');
      console.log('✨ Your CRM system is now optimized for better performance.');
    }

  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    console.log('\n💡 Manual execution required:');
    console.log('1. Go to your Supabase project dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of database-optimization.sql');
    console.log('4. Execute the script');
  }
}

// Check if we should run the optimization
if (require.main === module) {
  console.log('🔧 LogicWorks CRM Database Optimization Tool\n');
  
  // Check environment variables
  if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
    console.error('❌ Missing environment variables:');
    console.error('   - VITE_SUPABASE_URL');
    console.error('   - VITE_SUPABASE_ANON_KEY');
    console.log('\n💡 Please check your .env file and try again.');
    process.exit(1);
  }

  // Run the optimization
  runOptimizationDirect();
}

module.exports = { runDatabaseOptimization, runOptimizationDirect }; 