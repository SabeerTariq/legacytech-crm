import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://yipyteszzyycbqgzpfrf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpcHl0ZXN6enl5Y2JxZ3pwZnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NzY5MjEsImV4cCI6MjA2MDQ1MjkyMX0._LhWMyPMXDdht_5y3iQnYX9AzDAh-qMv2xDjBRyan7s';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'admin@logicworks.com',
      password: 'admin123456',
      options: {
        data: {
          full_name: 'Admin User',
          is_admin: true
        }
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('Admin user already exists, checking profile...');
        
        // Try to sign in to get the user
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: 'admin@logicworks.com',
          password: 'admin123456'
        });

        if (signInError) {
          console.error('Sign in error:', signInError.message);
          return;
        }

        if (signInData.user) {
          console.log('Admin user found:', signInData.user.email);
          
          // Check if profile exists
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', signInData.user.id)
            .single();

          if (profileError) {
            console.log('Profile not found, creating one...');
            
            // Create profile manually
            const { data: newProfile, error: createError } = await supabase
              .from('user_profiles')
              .insert({
                user_id: signInData.user.id,
                email: signInData.user.email,
                display_name: 'Admin User',
                is_admin: true
              })
              .select()
              .single();

            if (createError) {
              console.error('Error creating profile:', createError.message);
            } else {
              console.log('Profile created successfully:', newProfile);
            }
          } else {
            console.log('Profile already exists:', profile);
          }
        }
      } else {
        console.error('Auth error:', authError.message);
      }
      return;
    }

    if (authData.user) {
      console.log('Admin user created successfully:', authData.user.email);
      
      // The trigger should automatically create the profile
      console.log('User profile should be created automatically by trigger');
    }

  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdminUser(); 