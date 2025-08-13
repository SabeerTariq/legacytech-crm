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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all user profiles
    const { data: userProfiles, error } = await supabaseAdmin
      .from('user_profiles')
      .select('user_id, display_name, email');

    if (error) {
      console.error('Error fetching user profiles:', error);
      return res.status(500).json({ error: 'Failed to fetch user profiles' });
    }

    // Transform the data to a more usable format
    const usersMap = {};
    userProfiles.forEach(userProfile => {
      usersMap[userProfile.user_id] = {
        display_name: userProfile.display_name,
        email: userProfile.email
      };
    });

    res.status(200).json(usersMap);

  } catch (error) {
    console.error('Error in get-user-roles API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 