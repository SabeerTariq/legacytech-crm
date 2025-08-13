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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, roleName } = req.body;

    if (!userId || !roleName) {
      return res.status(400).json({ error: 'userId and roleName are required' });
    }

    // Check if user has the specified role using service role key
    const { data: userRole, error } = await supabaseAdmin
      .from('user_roles')
      .select(`
        user_id,
        role_id,
        roles!inner(
          name,
          display_name
        )
      `)
      .eq('user_id', userId)
      .eq('roles.name', roleName)
      .maybeSingle();

    if (error) {
      console.error('Error checking user role:', error);
      return res.status(500).json({ error: 'Failed to check user role' });
    }

    const hasRole = !!userRole;

    res.status(200).json({ 
      hasRole,
      role: userRole?.roles || null
    });

  } catch (error) {
    console.error('Error in check-user-role API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 