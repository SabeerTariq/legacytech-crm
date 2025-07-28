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

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, userData } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Update user in Supabase Auth
    const updateData = {};
    if (userData.email) updateData.email = userData.email;
    if (userData.password) updateData.password = userData.password;

    if (Object.keys(updateData).length > 0) {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        updateData
      );

      if (authError) {
        console.error('Auth update error:', authError);
        return res.status(400).json({ error: `Auth update failed: ${authError.message}` });
      }
    }

    // Update user profile
    const profileUpdateData = {};
    if (userData.email) profileUpdateData.email = userData.email;

    if (Object.keys(profileUpdateData).length > 0) {
      const { error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .update(profileUpdateData)
        .eq('user_id', userId);

      if (profileError) {
        console.error('Profile update error:', profileError);
        // Don't fail here as the auth update was successful
      }
    }

    res.status(200).json({ message: 'User updated successfully' });

  } catch (error) {
    console.error('Error in update-user API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 