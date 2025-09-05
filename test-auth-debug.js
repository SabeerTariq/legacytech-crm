const { createClient } = require('@supabase/supabase-js');

// Replace with your actual Supabase URL and anon key
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuthAndProjects() {
  try {
    console.log('🔍 Testing authentication and project access...');
    
    // 1. Get current authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error('❌ Error getting user:', userError);
      return;
    }
    
    if (!user) {
      console.log('❌ No authenticated user found');
      return;
    }
    
    console.log('✅ Current user:', {
      id: user.id,
      email: user.email
    });
    
    // 2. Test if we can access the projects table at all
    console.log('🔍 Testing basic projects table access...');
    const { data: allProjects, error: allProjectsError } = await supabase
      .from('projects')
      .select('id, name, assigned_pm_id, status')
      .limit(5);
    
    if (allProjectsError) {
      console.error('❌ Error accessing projects table:', allProjectsError);
      return;
    }
    
    console.log('✅ Projects table accessible. Found projects:', allProjects?.length || 0);
    if (allProjects && allProjects.length > 0) {
      console.log('Sample project:', allProjects[0]);
    }
    
    // 3. Test the specific project query that should work
    console.log('🔍 Testing specific project query for Muhammad Ali Sheikh...');
    const { data: specificProjects, error: specificError } = await supabase
      .from('projects')
      .select('id, name, assigned_pm_id, status')
      .eq('assigned_pm_id', 'c68193f0-bb0e-47d3-bdd7-a717acd775f6');
    
    if (specificError) {
      console.error('❌ Error with specific project query:', specificError);
      return;
    }
    
    console.log('✅ Specific project query successful. Found projects:', specificProjects?.length || 0);
    if (specificProjects && specificProjects.length > 0) {
      console.log('Specific projects:', specificProjects);
    }
    
    // 4. Test the RLS policy logic
    console.log('🔍 Testing RLS policy logic...');
    const { data: policyProjects, error: policyError } = await supabase
      .from('projects')
      .select('id, name, assigned_pm_id, status')
      .or(`assigned_pm_id.eq.c68193f0-bb0e-47d3-bdd7-a717acd775f6,user_id.eq.${user.id}`);
    
    if (policyError) {
      console.error('❌ Error with RLS policy query:', policyError);
      return;
    }
    
    console.log('✅ RLS policy query successful. Found projects:', policyProjects?.length || 0);
    if (policyProjects && policyProjects.length > 0) {
      console.log('Policy projects:', policyProjects);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testAuthAndProjects(); 