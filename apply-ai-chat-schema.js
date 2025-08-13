const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyAiChatSchema() {
  console.log('🚀 Applying AI Chat Schema...');
  
  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, 'ai-chat-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📋 Schema file loaded successfully');
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      try {
        console.log(`\n🔧 Executing statement ${i + 1}/${statements.length}...`);
        console.log(`SQL: ${statement.substring(0, 100)}${statement.length > 100 ? '...' : ''}`);
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.error(`❌ Error in statement ${i + 1}:`, error);
          errorCount++;
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
          successCount++;
        }
      } catch (err) {
        console.error(`❌ Exception in statement ${i + 1}:`, err.message);
        errorCount++;
      }
    }
    
    console.log('\n📊 Schema Application Summary:');
    console.log(`✅ Successful statements: ${successCount}`);
    console.log(`❌ Failed statements: ${errorCount}`);
    console.log(`📈 Success rate: ${((successCount / statements.length) * 100).toFixed(1)}%`);
    
    if (errorCount === 0) {
      console.log('\n🎉 AI Chat Schema applied successfully!');
      console.log('\n📋 What was created:');
      console.log('- ai_chat_conversations table');
      console.log('- ai_chat_messages table');
      console.log('- Indexes for performance');
      console.log('- Row Level Security (RLS) policies');
      console.log('- Cleanup functions for 30-day retention');
      console.log('- Triggers for automatic timestamps');
      
      console.log('\n🔧 Next steps:');
      console.log('1. Deploy the cleanup-ai-chats edge function');
      console.log('2. Test the Better Ask Saul functionality');
      console.log('3. Verify chat persistence and cleanup');
    } else {
      console.log('\n⚠️  Some statements failed. Please check the errors above.');
    }
    
  } catch (error) {
    console.error('❌ Failed to apply schema:', error);
    process.exit(1);
  }
}

// Alternative approach using direct SQL execution
async function applySchemaDirect() {
  console.log('🚀 Applying AI Chat Schema (Direct Method)...');
  
  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, 'ai-chat-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📋 Schema file loaded successfully');
    
    // Execute the entire schema as one statement
    console.log('🔧 Executing schema...');
    
    const { error } = await supabase.rpc('exec_sql', { sql: schema });
    
    if (error) {
      console.error('❌ Error applying schema:', error);
      process.exit(1);
    }
    
    console.log('✅ Schema applied successfully!');
    
    // Verify tables were created
    console.log('\n🔍 Verifying tables...');
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['ai_chat_conversations', 'ai_chat_messages']);
    
    if (tablesError) {
      console.error('❌ Error checking tables:', tablesError);
    } else {
      console.log('📋 Found tables:', tables?.map(t => t.table_name));
    }
    
  } catch (error) {
    console.error('❌ Failed to apply schema:', error);
    process.exit(1);
  }
}

// Check if we have the exec_sql function
async function checkExecSqlFunction() {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: 'SELECT 1' });
    
    if (error && error.message.includes('function "exec_sql" does not exist')) {
      console.log('⚠️  exec_sql function not available, using alternative method...');
      return false;
    }
    
    return true;
  } catch (error) {
    console.log('⚠️  exec_sql function not available, using alternative method...');
    return false;
  }
}

async function main() {
  console.log('🔧 AI Chat Schema Application Tool');
  console.log('=====================================\n');
  
  const hasExecSql = await checkExecSqlFunction();
  
  if (hasExecSql) {
    await applyAiChatSchema();
  } else {
    console.log('📝 Please apply the schema manually using the Supabase dashboard:');
    console.log('1. Go to your Supabase project dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of ai-chat-schema.sql');
    console.log('4. Execute the SQL');
    console.log('\n📋 Schema file location: ai-chat-schema.sql');
  }
}

main().catch(console.error); 