import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = "https://yipyteszzyycbqgzpfrf.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkAuthTriggers() {
  try {
    console.log('🔍 Checking Auth Database Triggers and Constraints...');
    
    // Check for triggers on auth.users table
    console.log('\n1️⃣ Checking auth.users triggers...');
    const { data: triggers, error: triggersError } = await supabaseAdmin
      .rpc('get_triggers_on_table', { table_name: 'auth.users' });

    if (triggersError) {
      console.log('ℹ️ Could not check triggers (normal for auth schema):', triggersError.message);
    } else {
      console.log('📋 Triggers on auth.users:', triggers);
    }

    // Check for any RLS policies that might interfere
    console.log('\n2️⃣ Checking RLS policies...');
    const { data: policies, error: policiesError } = await supabaseAdmin
      .rpc('get_rls_policies');

    if (policiesError) {
      console.log('ℹ️ Could not check RLS policies:', policiesError.message);
    } else {
      console.log('📋 RLS Policies:', policies);
    }

    // Check if there are any foreign key constraints that might be causing issues
    console.log('\n3️⃣ Checking foreign key constraints...');
    const { data: constraints, error: constraintsError } = await supabaseAdmin
      .rpc('get_foreign_key_constraints');

    if (constraintsError) {
      console.log('ℹ️ Could not check foreign key constraints:', constraintsError.message);
    } else {
      console.log('📋 Foreign Key Constraints:', constraints);
    }

    // Check if there are any check constraints on auth.users
    console.log('\n4️⃣ Checking check constraints...');
    const { data: checkConstraints, error: checkError } = await supabaseAdmin
      .rpc('get_check_constraints');

    if (checkError) {
      console.log('ℹ️ Could not check check constraints:', checkError.message);
    } else {
      console.log('📋 Check Constraints:', checkConstraints);
    }

    // Check if there are any unique constraints that might be causing issues
    console.log('\n5️⃣ Checking unique constraints...');
    const { data: uniqueConstraints, error: uniqueError } = await supabaseAdmin
      .rpc('get_unique_constraints');

    if (uniqueError) {
      console.log('ℹ️ Could not check unique constraints:', uniqueError.message);
    } else {
      console.log('📋 Unique Constraints:', uniqueConstraints);
    }

    // Check if there are any custom functions that might be triggered
    console.log('\n6️⃣ Checking custom functions...');
    const { data: functions, error: functionsError } = await supabaseAdmin
      .rpc('get_custom_functions');

    if (functionsError) {
      console.log('ℹ️ Could not check custom functions:', functionsError.message);
    } else {
      console.log('📋 Custom Functions:', functions);
    }

    // Try to get more specific error information by checking the database logs
    console.log('\n7️⃣ Checking recent database errors...');
    const { data: logs, error: logsError } = await supabaseAdmin
      .rpc('get_recent_errors');

    if (logsError) {
      console.log('ℹ️ Could not check recent errors:', logsError.message);
    } else {
      console.log('📋 Recent Errors:', logs);
    }

    console.log('\n🎉 Auth trigger check completed!');

  } catch (error) {
    console.error('❌ Error checking auth triggers:', error);
  }
}

checkAuthTriggers(); 