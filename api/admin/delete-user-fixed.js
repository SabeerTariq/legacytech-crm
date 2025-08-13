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

    // Get the user ID first
    let userIdToDelete = userId;
    if (!userIdToDelete) {
      try {
        const { data: authUser } = await supabaseAdmin.auth.admin.listUsers();
        const userToDelete = authUser.users.find(u => u.email === emailToDelete);
        if (userToDelete) {
          userIdToDelete = userToDelete.id;
        }
      } catch (error) {
        console.error('Error getting user ID:', error);
      }
    }

    // Clean up all foreign key references first
    if (userIdToDelete) {
      console.log('Cleaning up foreign key references for user:', userIdToDelete);
      
      // Delete from user_permissions
      try {
        const { error: permError } = await supabaseAdmin
          .from('user_permissions')
          .delete()
          .eq('user_id', userIdToDelete);
        
        if (permError) {
          console.warn('Error deleting user_permissions:', permError);
        } else {
          console.log('Successfully deleted user_permissions');
        }
      } catch (error) {
        console.warn('Error deleting user_permissions:', error);
      }

      // Delete from user_roles
      try {
        const { error: roleError } = await supabaseAdmin
          .from('user_roles')
          .delete()
          .eq('user_id', userIdToDelete);
        
        if (roleError) {
          console.warn('Error deleting user_roles:', roleError);
        } else {
          console.log('Successfully deleted user_roles');
        }
      } catch (error) {
        console.warn('Error deleting user_roles:', error);
      }

      // Delete from user_profiles
      try {
        const { error: profileError } = await supabaseAdmin
          .from('user_profiles')
          .delete()
          .eq('user_id', userIdToDelete);
        
        if (profileError) {
          console.warn('Error deleting user_profiles:', profileError);
        } else {
          console.log('Successfully deleted user_profiles');
        }
      } catch (error) {
        console.warn('Error deleting user_profiles:', error);
      }
    }

    // Now try to delete or mark the user as inactive in auth.users
    try {
      console.log('Attempting to delete user from auth.users...');
      
      if (userIdToDelete) {
        // Try to delete using Supabase Auth admin API
        const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userIdToDelete);
        
        if (deleteAuthError) {
          console.log('Auth deletion failed, marking user as inactive:', deleteAuthError.message);
          
          // Mark user as inactive instead
          const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userIdToDelete, {
            email: `deleted_${Date.now()}@deleted.com`,
            user_metadata: { 
              deleted: true, 
              deleted_at: new Date().toISOString(),
              reason: 'manual_deletion'
            }
          });
          
          if (updateError) {
            console.warn('Error marking user as inactive:', updateError);
          } else {
            console.log('Successfully marked user as inactive');
          }
        } else {
          console.log('Successfully deleted user from auth.users');
        }
      }
    } catch (error) {
      console.warn('Error in auth user deletion:', error);
    }

    // Verify deletion
    try {
      const { data: remainingUser } = await supabaseAdmin
        .from('user_profiles')
        .select('email')
        .eq('email', emailToDelete)
        .single();

      if (remainingUser) {
        console.warn('User still exists in user_profiles after deletion');
      } else {
        console.log('User successfully deleted from user_profiles');
      }
    } catch (verifyError) {
      console.log('User successfully deleted from user_profiles (not found)');
    }

    res.status(200).json({ 
      message: 'User deletion attempted successfully',
      email: emailToDelete
    });

  } catch (error) {
    console.error('Error in delete-user API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 