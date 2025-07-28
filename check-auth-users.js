import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkAuthUsers() {
  try {
    await client.connect();
    console.log('🔍 Checking auth.users table...');
    
    // Check auth.users table
    const res = await client.query(`
      SELECT id, email, created_at, last_sign_in_at, raw_user_meta_data
      FROM auth.users
      ORDER BY created_at DESC
      LIMIT 10;
    `);
    
    console.log('\n📋 Existing Auth Users:');
    if (res.rows && res.rows.length > 0) {
      res.rows.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Created: ${user.created_at}`);
        console.log(`   Last Sign In: ${user.last_sign_in_at || 'Never'}`);
        console.log(`   Meta Data: ${JSON.stringify(user.raw_user_meta_data)}`);
        console.log('---');
      });
      
      console.log('\n🎯 You can login with any of these accounts:');
      res.rows.forEach(user => {
        if (user.email) {
          console.log(`📧 Email: ${user.email}`);
          console.log(`🔑 Password: (use the password you set for this account)`);
          console.log(`🆔 User ID: ${user.id}`);
          console.log('---');
        }
      });
    } else {
      console.log('❌ No users found in auth.users table');
    }

    // Check if the new RBAC tables exist
    console.log('\n🔍 Checking for RBAC schema tables...');
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('user_profiles', 'roles', 'user_roles', 'permissions')
      ORDER BY table_name;
    `);
    
    if (tablesRes.rows.length > 0) {
      console.log('✅ RBAC tables found:');
      tablesRes.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    } else {
      console.log('❌ RBAC tables not found. Need to apply migration.');
    }

  } catch (error) {
    console.error('❌ Error checking users:', error.message);
  } finally {
    await client.end();
  }
}

checkAuthUsers(); 