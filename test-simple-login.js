import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://yipyteszzyycbqgzpfrf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpcHl0ZXN6enl5Y2JxZ3pwZnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NzY5MjEsImV4cCI6MjA2MDQ1MjkyMX0._LhWMyPMXDdht_5y3iQnYX9AzDAh-qMv2xDjBRyan7s';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSimpleLogin() {
  try {
    console.log('Testing simple login system...');
    
    // Test login with admin credentials
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@logicworks.com',
      password: 'admin123456'
    });

    if (error) {
      console.error('Login failed:', error.message);
      return;
    }

    if (data.user) {
      console.log('✅ Login successful!');
      console.log('User ID:', data.user.id);
      console.log('User Email:', data.user.email);
      
      // Test accessing user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .single();

      if (profileError) {
        console.log('⚠️ Profile fetch error:', profileError.message);
      } else if (profile) {
        console.log('✅ Profile found:', {
          id: profile.id,
          email: profile.email,
          display_name: profile.display_name,
          is_admin: profile.is_admin
        });
      }

      // Test accessing other tables
      console.log('\nTesting table access...');
      
      const tables = ['employees', 'leads', 'customers', 'projects'];
      
      for (const table of tables) {
        try {
          const { data: tableData, error: tableError } = await supabase
            .from(table)
            .select('*')
            .limit(1);
          
          if (tableError) {
            console.log(`❌ ${table}:`, tableError.message);
          } else {
            console.log(`✅ ${table}: Accessible (${tableData?.length || 0} records)`);
          }
        } catch (err) {
          console.log(`❌ ${table}: Error -`, err.message);
        }
      }
      
    } else {
      console.log('❌ No user data received');
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testSimpleLogin(); 