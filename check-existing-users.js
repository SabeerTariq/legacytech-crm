import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkExistingUsers() {
  try {
    console.log('🔍 Checking existing users...');
    
    // Check profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, username')
      .order('created_at', { ascending: false })
      .limit(10);

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError.message);
      return;
    }

    console.log('\n📋 Existing Profiles:');
    if (profiles && profiles.length > 0) {
      profiles.forEach((profile, index) => {
        console.log(`${index + 1}. ${profile.full_name || 'No name'} (${profile.email || 'No email'}) - Role: ${profile.role || 'No role'}`);
      });
      
      console.log('\n🎯 You can login with any of these accounts:');
      profiles.forEach(profile => {
        if (profile.email) {
          console.log(`📧 Email: ${profile.email}`);
          console.log(`🔑 Password: (use the password you set for this account)`);
          console.log(`👤 Role: ${profile.role || 'user'}`);
          console.log('---');
        }
      });
    } else {
      console.log('❌ No profiles found in the database');
    }

    // Check for admin users specifically
    const adminProfiles = profiles?.filter(p => p.role === 'admin') || [];
    if (adminProfiles.length > 0) {
      console.log('\n👑 Admin Users Found:');
      adminProfiles.forEach(admin => {
        console.log(`- ${admin.full_name || admin.email} (${admin.email})`);
      });
    } else {
      console.log('\n⚠️  No admin users found. You may need to create one.');
    }

  } catch (error) {
    console.error('❌ Error checking users:', error.message);
  }
}

checkExistingUsers(); 