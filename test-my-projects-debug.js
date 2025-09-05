const { createClient } = require('@supabase/supabase-js');

// Replace with your actual Supabase URL and anon key
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugMyProjects() {
  try {
    console.log('🔍 Starting MyProjects debug...');
    
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
    
    // 2. Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("employee_id, is_active")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();
    
    if (profileError) {
      console.error('❌ Error getting user profile:', profileError);
      return;
    }
    
    if (!userProfile || !userProfile.employee_id) {
      console.log('❌ No active user profile or employee ID found for user:', user.id);
      return;
    }
    
    console.log('✅ User profile found:', userProfile);
    
    // 3. Get employee details
    const { data: employeeProfile, error: employeeError } = await supabase
      .from("employees")
      .select("id, full_name, department, job_title")
      .eq("id", userProfile.employee_id)
      .single();
    
    if (employeeError) {
      console.error('❌ Error getting employee profile:', employeeError);
      return;
    }
    
    if (!employeeProfile) {
      console.log('❌ No employee profile found for employee ID:', userProfile.employee_id);
      return;
    }
    
    console.log('✅ Employee profile:', employeeProfile);
    
    // 4. Check projects count for this employee
    const { count: projectCount, error: countError } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("assigned_pm_id", employeeProfile.id);
    
    console.log('📊 Total projects count for employee ID', employeeProfile.id, ':', projectCount);
    if (countError) {
      console.error('❌ Count query error:', countError);
    }
    
    // 5. Get projects assigned to this user
    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select(`
        *,
        sales_disposition:sales_dispositions(*),
        assigned_pm:employees!assigned_pm_id(*)
      `)
      .or(`assigned_pm_id.eq.${employeeProfile.id},assigned_to_id.eq.${employeeProfile.id},user_id.eq.${user.id}`)
      .order("created_at", { ascending: false });
    
    if (projectsError) {
      console.error('❌ Error loading projects:', projectsError);
      return;
    }
    
    console.log('📋 Projects found:', projects?.length || 0);
    
    if (projects && projects.length > 0) {
      console.log('📋 Sample project:', projects[0]);
      console.log('📋 Assignment fields in found projects:');
      projects.forEach((project, index) => {
        console.log(`  Project ${index + 1}:`, {
          name: project.name,
          assigned_pm_id: project.assigned_pm_id,
          assigned_to_id: project.assigned_to_id,
          user_id: project.user_id,
          status: project.status
        });
      });
    } else {
      console.log('❌ No projects found for employee ID:', employeeProfile.id);
      console.log('❌ User ID:', user.id);
      
      // Debug: Check if there are any projects at all
      const { data: allProjects } = await supabase
        .from("projects")
        .select("id, name, assigned_pm_id, assigned_to_id, user_id, status")
        .limit(5);
      
      console.log('🔍 Sample of all projects in system:', allProjects);
      
      // Debug: Check specifically for projects assigned to this employee
      const { data: assignedProjects } = await supabase
        .from("projects")
        .select("id, name, status, assigned_pm_id")
        .eq("assigned_pm_id", employeeProfile.id);
      
      console.log('🔍 Projects with assigned_pm_id =', employeeProfile.id, ':', assignedProjects);
      
      // Debug: Check for projects created by this user
      const { data: userCreatedProjects } = await supabase
        .from("projects")
        .select("id, name, status, user_id")
        .eq("user_id", user.id);
      
      console.log('🔍 Projects with user_id =', user.id, ':', userCreatedProjects);
    }
    
  } catch (error) {
    console.error("❌ Error in debug:", error);
  }
}

// Run the debug function
debugMyProjects();
