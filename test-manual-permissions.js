import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = "https://yipyteszzyycbqgzpfrf.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testManualPermissions() {
  console.log('🧪 Testing Manual Permission Assignment\n');

  try {
    // 1. Get the most recent user profile
    console.log('1. Getting recent user profile...');
    const { data: userProfiles, error: profilesError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (profilesError) {
      console.log('❌ Error fetching profiles:', profilesError.message);
      return;
    }

    if (!userProfiles || userProfiles.length === 0) {
      console.log('❌ No user profiles found');
      return;
    }

    const userProfile = userProfiles[0];
    console.log('✅ Found user profile:', userProfile.email);

    // 2. Create permissions object
    const permissionsObject = {
      dashboard: {
        can_create: true,
        can_read: true,
        can_update: true,
        can_delete: true,
        screen_visible: true
      },
      leads: {
        can_create: true,
        can_read: true,
        can_update: true,
        can_delete: true,
        screen_visible: true
      },
      customers: {
        can_create: true,
        can_read: true,
        can_update: true,
        can_delete: true,
        screen_visible: true
      },
      messages: {
        can_create: true,
        can_read: true,
        can_update: true,
        can_delete: true,
        screen_visible: true
      },
      my_dashboard: {
        can_create: true,
        can_read: true,
        can_update: true,
        can_delete: true,
        screen_visible: true
      }
    };

    console.log('2. Updating user profile with permissions...');
    console.log('Permissions object:', JSON.stringify(permissionsObject, null, 2));

    // 3. Update the user profile with permissions
    const { data: updateData, error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .update({
        attributes: {
          ...userProfile.attributes,
          permissions: permissionsObject
        }
      })
      .eq('user_id', userProfile.user_id)
      .select();

    if (updateError) {
      console.log('❌ Error updating profile:', updateError.message);
    } else {
      console.log('✅ Profile updated successfully');
      console.log('Updated attributes:', JSON.stringify(updateData[0]?.attributes, null, 2));
    }

    // 4. Verify the update
    console.log('3. Verifying the update...');
    const { data: verifyData, error: verifyError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('user_id', userProfile.user_id)
      .single();

    if (verifyError) {
      console.log('❌ Error verifying update:', verifyError.message);
    } else {
      console.log('✅ Verification successful');
      console.log('Final attributes:', JSON.stringify(verifyData.attributes, null, 2));
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testManualPermissions(); 