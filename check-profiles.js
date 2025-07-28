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

async function checkProfiles() {
  try {
    console.log('=== CHECKING PROFILES ===');
    
    // Get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
    
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return;
    }
    
    console.log(`Found ${profiles.length} total profiles`);
    
    // Group by role
    const roleGroups = {};
    profiles.forEach(profile => {
      const role = profile.role || 'no_role';
      if (!roleGroups[role]) {
        roleGroups[role] = [];
      }
      roleGroups[role].push(profile);
    });
    
    console.log('\n=== PROFILES BY ROLE ===');
    Object.entries(roleGroups).forEach(([role, profiles]) => {
      console.log(`\n${role.toUpperCase()} (${profiles.length} profiles):`);
      profiles.forEach(profile => {
        console.log(`  - ${profile.full_name || profile.username} (${profile.id})`);
      });
    });
    
    // Check for front sales employees specifically
    console.log('\n=== FRONT SALES EMPLOYEES ===');
    const frontSalesEmployees = [
      'mohammedsajidb@gmail.com',
      'iftikharkhnn@gmail.com', 
      'adnanshafaqat9@gmail.com',
      'jahanrasoli55@gmail.com',
      'xaineexo@gmail.com',
      'musawirrasouli@gmail.com',
      'hassaan.ansari52@gmail.com',
      'vwelfred@gmail.com',
      'shahbazyouknow@gmail.com',
      'technologist.asad@gmail.com',
      'fahadmuhsib@gmail.com'
    ];
    
    const frontSalesProfiles = profiles.filter(profile => 
      frontSalesEmployees.some(email => 
        profile.username === email.split('@')[0] || 
        profile.full_name?.toLowerCase().includes(email.split('@')[0])
      )
    );
    
    console.log(`Found ${frontSalesProfiles.length} front sales profiles:`);
    frontSalesProfiles.forEach(profile => {
      console.log(`  - ${profile.full_name} (${profile.username}) - Role: ${profile.role}`);
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkProfiles().then(() => {
  console.log('\n=== CHECK COMPLETE ===');
  process.exit(0);
}).catch((error) => {
  console.error('Check failed:', error);
  process.exit(1);
}); 