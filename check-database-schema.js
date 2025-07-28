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

async function checkDatabaseSchema() {
  try {
    console.log('🔍 Checking Database Schema for Auth Issues...');
    
    // Check if there are any triggers on user_profiles that might be causing issues
    console.log('\n1️⃣ Checking user_profiles table structure...');
    const { data: profileStructure, error: profileError } = await supabaseAdmin
      .rpc('get_table_structure', { table_name: 'user_profiles' });

    if (profileError) {
      console.log('ℹ️ Could not get user_profiles structure:', profileError.message);
    } else {
      console.log('📋 user_profiles structure:', profileStructure);
    }

    // Check if there are any triggers on user_profiles
    console.log('\n2️⃣ Checking for triggers on user_profiles...');
    const { data: triggers, error: triggersError } = await supabaseAdmin
      .rpc('get_table_triggers', { table_name: 'user_profiles' });

    if (triggersError) {
      console.log('ℹ️ Could not check triggers:', triggersError.message);
    } else {
      console.log('📋 Triggers on user_profiles:', triggers);
    }

    // Check if there are any functions that might be called during user creation
    console.log('\n3️⃣ Checking for functions that might interfere...');
    const { data: functions, error: functionsError } = await supabaseAdmin
      .rpc('get_custom_functions');

    if (functionsError) {
      console.log('ℹ️ Could not check functions:', functionsError.message);
    } else {
      console.log('📋 Custom functions:', functions);
    }

    // Check if there are any RLS policies that might be causing issues
    console.log('\n4️⃣ Checking RLS policies on user_profiles...');
    const { data: policies, error: policiesError } = await supabaseAdmin
      .rpc('get_table_policies', { table_name: 'user_profiles' });

    if (policiesError) {
      console.log('ℹ️ Could not check policies:', policiesError.message);
    } else {
      console.log('📋 RLS policies on user_profiles:', policies);
    }

    // Check if there are any foreign key constraints that might be causing issues
    console.log('\n5️⃣ Checking foreign key constraints...');
    const { data: constraints, error: constraintsError } = await supabaseAdmin
      .rpc('get_foreign_keys', { table_name: 'user_profiles' });

    if (constraintsError) {
      console.log('ℹ️ Could not check foreign keys:', constraintsError.message);
    } else {
      console.log('📋 Foreign keys on user_profiles:', constraints);
    }

    // Check if there are any check constraints
    console.log('\n6️⃣ Checking check constraints...');
    const { data: checks, error: checksError } = await supabaseAdmin
      .rpc('get_check_constraints', { table_name: 'user_profiles' });

    if (checksError) {
      console.log('ℹ️ Could not check check constraints:', checksError.message);
    } else {
      console.log('📋 Check constraints on user_profiles:', checks);
    }

    // Check if there are any unique constraints
    console.log('\n7️⃣ Checking unique constraints...');
    const { data: uniques, error: uniquesError } = await supabaseAdmin
      .rpc('get_unique_constraints', { table_name: 'user_profiles' });

    if (uniquesError) {
      console.log('ℹ️ Could not check unique constraints:', uniquesError.message);
    } else {
      console.log('📋 Unique constraints on user_profiles:', uniques);
    }

    // Check if there are any indexes that might be causing issues
    console.log('\n8️⃣ Checking indexes...');
    const { data: indexes, error: indexesError } = await supabaseAdmin
      .rpc('get_table_indexes', { table_name: 'user_profiles' });

    if (indexesError) {
      console.log('ℹ️ Could not check indexes:', indexesError.message);
    } else {
      console.log('📋 Indexes on user_profiles:', indexes);
    }

    console.log('\n🎉 Database schema check completed!');

  } catch (error) {
    console.error('❌ Error checking database schema:', error);
  }
}

checkDatabaseSchema(); 