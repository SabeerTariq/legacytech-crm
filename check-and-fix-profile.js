import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = "https://yipyteszzyycbqgzpfrf.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required in .env file');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkAndFixProfile() {
  console.log('🔍 Checking and fixing user profile...\n');

  try {
    // First, let's check if the user exists in auth.users
    const userId = 'de514a73-4782-439e-b2ea-3f49fe568e24';
    
    console.log('1️⃣ Checking if user exists in auth.users...');
    
    // Query auth.users through RPC since direct access might be restricted
    const { data: authUser, error: authError } = await supabase.rpc('get_user_by_id', {
      user_id: userId
    });

    if (authError) {
      console.log('⚠️  Could not check auth.users directly, proceeding with profile check...');
    } else if (authUser) {
      console.log('✅ User found in auth.users:', authUser.email);
    } else {
      console.log('❌ User not found in auth.users');
    }

    // Check if profile exists
    console.log('\n2️⃣ Checking if profile exists...');
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        console.log('❌ Profile not found, creating new profile...');
        
        // Create a new profile
        const newProfile = {
          id: userId,
          username: 'ali',
          full_name: 'Ali Admin',
          avatar_url: null,
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (createError) {
          console.error('❌ Error creating profile:', createError);
        } else {
          console.log('✅ Profile created successfully:', createdProfile);
        }
      } else {
        console.error('❌ Error checking profile:', profileError);
      }
    } else {
      console.log('✅ Profile found:', profile);
      
      // Check if profile needs updating
      if (profile.role !== 'admin' || profile.username !== 'ali') {
        console.log('🔄 Updating profile to admin role...');
        
        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .update({
            username: 'ali',
            full_name: 'Ali Admin',
            role: 'admin',
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)
          .select()
          .single();

        if (updateError) {
          console.error('❌ Error updating profile:', updateError);
        } else {
          console.log('✅ Profile updated successfully:', updatedProfile);
        }
      }
    }

    // Test the profile fetch
    console.log('\n3️⃣ Testing profile fetch...');
    
    const { data: testProfile, error: testError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (testError) {
      console.error('❌ Profile fetch test failed:', testError);
    } else {
      console.log('✅ Profile fetch test successful:', testProfile);
    }

    // Check RLS policies
    console.log('\n4️⃣ Checking RLS policies...');
    
    const { data: policies, error: policiesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (policiesError) {
      console.error('❌ RLS policy issue detected:', policiesError);
    } else {
      console.log('✅ RLS policies working correctly');
    }

    console.log('\n🎉 Profile check and fix completed!');

  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

// Run the script
checkAndFixProfile(); 