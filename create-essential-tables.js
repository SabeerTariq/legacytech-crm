import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = "https://yipyteszzyycbqgzpfrf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpcHl0ZXN6enl5Y2JxZ3pwZnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NzY5MjEsImV4cCI6MjA2MDQ1MjkyMX0._LhWMyPMXDdht_5y3iQnYX9AzDAh-qMv2xDjBRyan7s";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function createEssentialTables() {
  console.log('🔧 Creating essential tables for login functionality...\n');

  try {
    // Create user_profiles table
    console.log('1. Creating user_profiles table...');
    const createUserProfilesSQL = `
      CREATE TABLE IF NOT EXISTS user_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        display_name TEXT,
        attributes JSONB DEFAULT '{}',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql: createUserProfilesSQL
      });

      if (error) {
        console.log(`   ⚠️  user_profiles table: ${error.message}`);
      } else {
        console.log('   ✅ user_profiles table created successfully');
      }
    } catch (error) {
      console.log(`   ❌ user_profiles table error: ${error.message}`);
    }

    // Create roles table
    console.log('\n2. Creating roles table...');
    const createRolesSQL = `
      CREATE TABLE IF NOT EXISTS roles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT UNIQUE NOT NULL,
        display_name TEXT NOT NULL,
        description TEXT,
        permissions JSONB NOT NULL DEFAULT '{}',
        hierarchy_level INTEGER NOT NULL DEFAULT 0,
        is_system_role BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql: createRolesSQL
      });

      if (error) {
        console.log(`   ⚠️  roles table: ${error.message}`);
      } else {
        console.log('   ✅ roles table created successfully');
      }
    } catch (error) {
      console.log(`   ❌ roles table error: ${error.message}`);
    }

    // Create user_roles table
    console.log('\n3. Creating user_roles table...');
    const createUserRolesSQL = `
      CREATE TABLE IF NOT EXISTS user_roles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        role_id UUID NOT NULL,
        granted_by UUID,
        granted_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP NULL,
        context JSONB DEFAULT '{}',
        UNIQUE(user_id, role_id)
      );
    `;

    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql: createUserRolesSQL
      });

      if (error) {
        console.log(`   ⚠️  user_roles table: ${error.message}`);
      } else {
        console.log('   ✅ user_roles table created successfully');
      }
    } catch (error) {
      console.log(`   ❌ user_roles table error: ${error.message}`);
    }

    // Insert default roles
    console.log('\n4. Inserting default roles...');
    const insertRolesSQL = `
      INSERT INTO roles (name, display_name, description, permissions, hierarchy_level, is_system_role) VALUES
      ('super_admin', 'Super Administrator', 'Full system access with all permissions', '[{"resource": "*", "action": "*"}]'::jsonb, 100, true),
      ('admin', 'Administrator', 'Administrative access to most features', '[{"resource": "leads", "action": "*"}, {"resource": "projects", "action": "*"}, {"resource": "employees", "action": "*"}, {"resource": "customers", "action": "*"}, {"resource": "dashboard", "action": "view"}, {"resource": "reports", "action": "view"}]'::jsonb, 75, true),
      ('manager', 'Manager', 'Management level access', '[{"resource": "leads", "action": "read"}, {"resource": "leads", "action": "update"}, {"resource": "leads", "action": "create"}, {"resource": "projects", "action": "read"}, {"resource": "projects", "action": "update"}, {"resource": "employees", "action": "read"}, {"resource": "customers", "action": "read"}, {"resource": "dashboard", "action": "view"}, {"resource": "reports", "action": "view"}]'::jsonb, 50, true),
      ('front_sales', 'Front Sales', 'Front sales team access', '[{"resource": "leads", "action": "read"}, {"resource": "leads", "action": "create"}, {"resource": "leads", "action": "update"}, {"resource": "customers", "action": "read"}, {"resource": "customers", "action": "create"}, {"resource": "dashboard", "action": "view"}]'::jsonb, 25, true),
      ('employee', 'Employee', 'Standard employee access', '[{"resource": "dashboard", "action": "view"}, {"resource": "projects", "action": "read"}]'::jsonb, 10, true)
      ON CONFLICT (name) DO NOTHING;
    `;

    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql: insertRolesSQL
      });

      if (error) {
        console.log(`   ⚠️  Default roles: ${error.message}`);
      } else {
        console.log('   ✅ Default roles inserted successfully');
      }
    } catch (error) {
      console.log(`   ❌ Default roles error: ${error.message}`);
    }

    // Create function to sync user profiles
    console.log('\n5. Creating sync function...');
    const createSyncFunctionSQL = `
      CREATE OR REPLACE FUNCTION sync_user_profile()
      RETURNS TRIGGER AS $$
      BEGIN
          INSERT INTO user_profiles (user_id, email, display_name)
          VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email))
          ON CONFLICT (user_id) DO UPDATE SET
              email = NEW.email,
              updated_at = NOW();
          
          -- Assign default employee role
          INSERT INTO user_roles (user_id, role_id)
          SELECT NEW.id, r.id
          FROM roles r
          WHERE r.name = 'employee'
          ON CONFLICT (user_id, role_id) DO NOTHING;
          
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;

    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql: createSyncFunctionSQL
      });

      if (error) {
        console.log(`   ⚠️  Sync function: ${error.message}`);
      } else {
        console.log('   ✅ Sync function created successfully');
      }
    } catch (error) {
      console.log(`   ❌ Sync function error: ${error.message}`);
    }

    // Create trigger
    console.log('\n6. Creating trigger...');
    const createTriggerSQL = `
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION sync_user_profile();
    `;

    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql: createTriggerSQL
      });

      if (error) {
        console.log(`   ⚠️  Trigger: ${error.message}`);
      } else {
        console.log('   ✅ Trigger created successfully');
      }
    } catch (error) {
      console.log(`   ❌ Trigger error: ${error.message}`);
    }

    console.log('\n🏁 Essential tables creation completed!');

    // Verify tables were created
    console.log('\n🔍 Verifying tables...');
    const requiredTables = ['user_profiles', 'roles', 'user_roles'];

    for (const tableName of requiredTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (error) {
          if (error.code === '42P01') {
            console.log(`   ❌ ${tableName} - STILL MISSING`);
          } else {
            console.log(`   ⚠️  ${tableName} - EXISTS BUT ACCESS ERROR: ${error.message}`);
          }
        } else {
          console.log(`   ✅ ${tableName} - WORKING`);
        }
      } catch (error) {
        console.log(`   ❌ ${tableName} - ERROR: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
  }
}

createEssentialTables(); 