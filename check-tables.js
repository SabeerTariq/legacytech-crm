import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTables() {
  try {
    console.log('🔍 Checking existing tables...\n');

    // Check if roles table exists
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('*')
      .limit(1);

    if (rolesError) {
      console.log('❌ Roles table does not exist:', rolesError.message);
    } else {
      console.log('✅ Roles table exists');
      console.log('Roles found:', roles?.length || 0);
    }

    // Check if modules table exists
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('*')
      .limit(5);

    if (modulesError) {
      console.log('❌ Modules table does not exist:', modulesError.message);
    } else {
      console.log('✅ Modules table exists');
      console.log('Modules found:', modules?.length || 0);
      if (modules && modules.length > 0) {
        console.log('Sample modules:', modules.map(m => ({ name: m.name, display_name: m.display_name })));
      }
    }

    // Check if user_profiles table exists
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);

    if (profilesError) {
      console.log('❌ User profiles table does not exist:', profilesError.message);
    } else {
      console.log('✅ User profiles table exists');
      console.log('Profiles found:', profiles?.length || 0);
    }

    // Check if employees table exists
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('*')
      .limit(1);

    if (employeesError) {
      console.log('❌ Employees table does not exist:', employeesError.message);
    } else {
      console.log('✅ Employees table exists');
      console.log('Employees found:', employees?.length || 0);
    }

  } catch (error) {
    console.error('❌ Error checking tables:', error);
  }
}

checkTables(); 