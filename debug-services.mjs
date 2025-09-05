import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY
);

async function checkServices() {
  console.log('🔍 Checking services in database...');
  
  try {
    const { data: services, error } = await supabase
      .from('services')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('❌ Error fetching services:', error);
      return;
    }
    
    console.log(`✅ Found ${services?.length || 0} services:`);
    if (services && services.length > 0) {
      services.forEach((service, index) => {
        console.log(`${index + 1}. ID: ${service.id}, Name: ${service.name}`);
      });
    } else {
      console.log('❌ No services found in database');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkServices();
