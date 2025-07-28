import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables. Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function confirmAdminEmail() {
  try {
    console.log('Confirming admin email...');
    
    // Confirm the admin user's email
    const { data, error } = await supabase.auth.admin.updateUserById(
      'b58515cb-6880-482e-a78e-7872bb53e3a8', // admin user ID
      {
        email_confirm: true
      }
    );

    if (error) {
      console.error('Error confirming email:', error);
      return;
    }

    console.log('✅ Admin email confirmed successfully!');
    console.log('📧 Email: admin@logicworks.com');
    console.log('🔑 Password: Admin@123456');
    console.log('\n✅ You can now log in with these credentials.');

  } catch (error) {
    console.error('Error:', error);
  }
}

confirmAdminEmail(); 