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
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, userEmail } = req.body;

    if (!userId && !userEmail) {
      return res.status(400).json({ error: 'User ID or email is required' });
    }

    let emailToDelete = userEmail;

    // If we only have userId, get the email first
    if (!emailToDelete && userId) {
      try {
        // Try to get email from user_profiles first
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('user_profiles')
          .select('email')
          .eq('user_id', userId)
          .single();

        if (!profileError && profile) {
          emailToDelete = profile.email;
        } else {
          // Try to get from auth.users directly
          const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);
          if (authError) {
            return res.status(404).json({ error: 'User not found' });
          }
          emailToDelete = authUser.user.email;
        }
      } catch (error) {
        console.error('Error getting user email:', error);
        return res.status(500).json({ error: 'Failed to get user email' });
      }
    }

    if (!emailToDelete) {
      return res.status(400).json({ error: 'Could not determine user email' });
    }

    console.log('Deleting user with email:', emailToDelete);

    // Use the safe delete function
    const { data: deleteResult, error: deleteError } = await supabaseAdmin.rpc('safe_delete_user', {
      user_email: emailToDelete
    });

    if (deleteError) {
      console.error('Safe delete error:', deleteError);
      return res.status(400).json({ error: `Safe delete failed: ${deleteError.message}` });
    }

    console.log('Delete result:', deleteResult);

    // Also try to delete from Supabase Auth as backup
    try {
      const { data: authUser } = await supabaseAdmin.auth.admin.listUsers();
      const userToDelete = authUser.users.find(u => u.email === emailToDelete);
      
      if (userToDelete) {
        const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userToDelete.id);
        if (authDeleteError) {
          console.warn('Auth deletion warning:', authDeleteError);
        }
      }
    } catch (authError) {
      console.warn('Auth deletion warning:', authError);
    }

    res.status(200).json({ 
      message: 'User deleted successfully',
      result: deleteResult 
    });

  } catch (error) {
    console.error('Error in delete-user API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 