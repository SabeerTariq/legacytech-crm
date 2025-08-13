import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = "https://yipyteszzyycbqgzpfrf.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create admin client with service role key
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupAuthPasswords() {
  try {
    console.log('Setting up authentication passwords for existing users...');

    // Get all user profiles
    const { data: userProfiles, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('user_id, email, display_name');

    if (profileError) {
      console.error('Error fetching user profiles:', profileError);
      return;
    }

    console.log(`Found ${userProfiles.length} user profiles`);

    for (const profile of userProfiles) {
      try {
        console.log(`Setting up password for: ${profile.email}`);
        
        // Check if user exists in auth.users
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(profile.user_id);
        
        if (authError) {
          console.log(`User ${profile.email} not found in auth.users, creating...`);
          
          // Create user in auth.users
          const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: profile.email,
            password: 'defaultpassword123', // Default password for all users
            email_confirm: true,
            user_metadata: {
              display_name: profile.display_name,
              user_id: profile.user_id
            }
          });

          if (createError) {
            console.error(`Error creating user ${profile.email}:`, createError);
          } else {
            console.log(`✅ Created user: ${profile.email}`);
          }
        } else {
          console.log(`✅ User ${profile.email} already exists in auth.users`);
          
          // Update password to ensure consistency
          const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(profile.user_id, {
            password: 'defaultpassword123'
          });

          if (updateError) {
            console.error(`Error updating password for ${profile.email}:`, updateError);
          } else {
            console.log(`✅ Updated password for: ${profile.email}`);
          }
        }
      } catch (error) {
        console.error(`Error processing user ${profile.email}:`, error);
      }
    }

    console.log('✅ Authentication setup complete!');
    console.log('📝 All users now have password: defaultpassword123');
    console.log('🔐 Users can now authenticate with Supabase Auth');

  } catch (error) {
    console.error('Error setting up authentication:', error);
  }
}

setupAuthPasswords(); 