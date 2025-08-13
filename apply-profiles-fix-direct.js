import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyProfilesFix() {
  try {
    console.log('Applying profiles table reference fixes...');
    
    // Read the SQL fix file
    const sqlFix = fs.readFileSync('fix-profiles-references.sql', 'utf8');
    
    // Split the SQL into individual statements
    const statements = sqlFix
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        console.log(`Statement: ${statement.substring(0, 100)}...`);
        
        try {
          const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
          
          if (error) {
            console.error(`Error executing statement ${i + 1}:`, error);
            // Continue with other statements even if one fails
          } else {
            console.log(`Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.error(`Exception executing statement ${i + 1}:`, err.message);
        }
      }
    }
    
    console.log('Profiles fix application completed!');
    
  } catch (error) {
    console.error('Error applying profiles fix:', error);
    process.exit(1);
  }
}

applyProfilesFix(); 