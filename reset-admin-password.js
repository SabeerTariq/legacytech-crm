import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables. Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetAdminPassword() {
  try {
    console.log('🔧 Resetting admin password...');
    
    // First, let's list all users to find the admin
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      return;
    }

    console.log(`Found ${users.users.length} users:`);
    users.users.forEach(user => {
      console.log(`- ${user.email} (${user.id})`);
    });

    // Find admin user
    const adminUser = users.users.find(user => user.email === 'admin@logicworks.com');
    
    if (!adminUser) {
      console.log('❌ Admin user not found. Creating one...');
      
      // Create admin user
      const { data: createData, error: createError } = await supabase.auth.admin.createUser({
        email: 'admin@logicworks.com',
        password: 'admin123456',
        email_confirm: true,
        user_metadata: {
          full_name: 'Admin User'
        }
      });

      if (createError) {
        console.error('Error creating admin user:', createError);
        return;
      }

      console.log('✅ Admin user created successfully!');
      console.log('📧 Email: admin@logicworks.com');
      console.log('🔑 Password: admin123456');
      console.log('🆔 User ID:', createData.user.id);
    } else {
      console.log('✅ Admin user found, resetting password...');
      
      // Reset password
      const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
        adminUser.id,
        {
          password: 'admin123456',
          email_confirm: true
        }
      );

      if (updateError) {
        console.error('Error updating admin user:', updateError);
        return;
      }

      console.log('✅ Admin password reset successfully!');
      console.log('📧 Email: admin@logicworks.com');
      console.log('🔑 Password: admin123456');
      console.log('🆔 User ID:', adminUser.id);
    }

    console.log('\n🎉 Admin user ready!');
    console.log('You can now login to the CRM with:');
    console.log('Email: admin@logicworks.com');
    console.log('Password: admin123456');

  } catch (error) {
    console.error('Error:', error);
  }
}

resetAdminPassword(); 