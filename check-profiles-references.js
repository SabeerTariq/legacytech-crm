import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const checkProfilesReferences = async () => {
  try {
    console.log('🔍 Checking for references to "profiles" table in database...\n');

    // 1. Check for functions that reference profiles
    console.log('📋 1. Checking functions that reference "profiles"...');
    const { data: functions, error: functionsError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT 
            routine_name, 
            routine_definition 
          FROM information_schema.routines 
          WHERE routine_type = 'FUNCTION' 
          AND routine_definition LIKE '%profiles%'
        `
      });

    if (functionsError) {
      console.error('❌ Error checking functions:', functionsError);
    } else {
      console.log(`📊 Found ${functions?.length || 0} functions referencing "profiles"`);
      if (functions && functions.length > 0) {
        functions.forEach((func, index) => {
          console.log(`  ${index + 1}. ${func.routine_name}`);
        });
      }
    }

    // 2. Check for triggers that might reference profiles
    console.log('\n📋 2. Checking triggers...');
    const { data: triggers, error: triggersError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT 
            trigger_name,
            event_manipulation,
            event_object_table,
            action_statement
          FROM information_schema.triggers 
          WHERE action_statement LIKE '%profiles%'
        `
      });

    if (triggersError) {
      console.error('❌ Error checking triggers:', triggersError);
    } else {
      console.log(`📊 Found ${triggers?.length || 0} triggers referencing "profiles"`);
      if (triggers && triggers.length > 0) {
        triggers.forEach((trigger, index) => {
          console.log(`  ${index + 1}. ${trigger.trigger_name} on ${trigger.event_object_table}`);
        });
      }
    }

    // 3. Check for views that reference profiles
    console.log('\n📋 3. Checking views that reference "profiles"...');
    const { data: views, error: viewsError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT 
            table_name,
            view_definition
          FROM information_schema.views 
          WHERE view_definition LIKE '%profiles%'
        `
      });

    if (viewsError) {
      console.error('❌ Error checking views:', viewsError);
    } else {
      console.log(`📊 Found ${views?.length || 0} views referencing "profiles"`);
      if (views && views.length > 0) {
        views.forEach((view, index) => {
          console.log(`  ${index + 1}. ${view.table_name}`);
        });
      }
    }

    // 4. Check for materialized views
    console.log('\n📋 4. Checking materialized views...');
    const { data: matViews, error: matViewsError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT 
            matviewname,
            definition
          FROM pg_matviews 
          WHERE definition LIKE '%profiles%'
        `
      });

    if (matViewsError) {
      console.error('❌ Error checking materialized views:', matViewsError);
    } else {
      console.log(`📊 Found ${matViews?.length || 0} materialized views referencing "profiles"`);
      if (matViews && matViews.length > 0) {
        matViews.forEach((matView, index) => {
          console.log(`  ${index + 1}. ${matView.matviewname}`);
        });
      }
    }

    // 5. Check for foreign key constraints
    console.log('\n📋 5. Checking foreign key constraints...');
    const { data: fks, error: fksError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT 
            tc.table_name,
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
          FROM information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
          WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND ccu.table_name = 'profiles'
        `
      });

    if (fksError) {
      console.error('❌ Error checking foreign keys:', fksError);
    } else {
      console.log(`📊 Found ${fks?.length || 0} foreign key constraints referencing "profiles"`);
      if (fks && fks.length > 0) {
        fks.forEach((fk, index) => {
          console.log(`  ${index + 1}. ${fk.table_name}.${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}`);
        });
      }
    }

    console.log('\n🎯 Profiles References Check Complete!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
};

checkProfilesReferences(); 