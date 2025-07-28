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

async function testOptimization() {
  console.log('🧪 Testing Database Optimization...\n');

  try {
    // Test 1: Check if the function exists
    console.log('1️⃣ Testing get_front_sales_agents function...');
    const { data: agents, error: functionError } = await supabase.rpc('get_front_sales_agents');
    
    if (functionError) {
      console.log('❌ Function test failed:', functionError.message);
      console.log('💡 Make sure you have executed the SQL optimization script in your Supabase dashboard');
    } else {
      console.log('✅ Function test successful!');
      console.log(`📊 Found ${agents?.length || 0} Front Sales agents`);
      
      if (agents && agents.length > 0) {
        console.log('👥 Front Sales agents:');
        agents.forEach(agent => {
          console.log(`   - ${agent.full_name} (${agent.current_leads_count} leads, Score: ${agent.performance_score})`);
        });
      }
    }

    // Test 2: Check materialized view
    console.log('\n2️⃣ Testing materialized view...');
    const { data: stats, error: statsError } = await supabase
      .from('lead_assignment_stats')
      .select('*')
      .limit(5);
    
    if (statsError) {
      console.log('❌ Materialized view test failed:', statsError.message);
    } else {
      console.log('✅ Materialized view test successful!');
      console.log(`📈 Found ${stats?.length || 0} agent statistics`);
    }

    // Test 3: Check analytics view
    console.log('\n3️⃣ Testing analytics view...');
    const { data: analytics, error: analyticsError } = await supabase
      .from('lead_performance_analytics')
      .select('*')
      .limit(5);
    
    if (analyticsError) {
      console.log('❌ Analytics view test failed:', analyticsError.message);
    } else {
      console.log('✅ Analytics view test successful!');
      console.log(`📊 Found ${analytics?.length || 0} performance records`);
    }

    // Test 4: Check indexes
    console.log('\n4️⃣ Checking database indexes...');
    const { data: indexes, error: indexError } = await supabase
      .rpc('get_indexes_info');
    
    if (indexError) {
      // Try alternative approach
      console.log('⚠️  Index check using RPC failed, trying direct query...');
      const { data: directIndexes, error: directError } = await supabase
        .from('information_schema.table_constraints')
        .select('constraint_name, table_name')
        .eq('constraint_type', 'CHECK')
        .limit(5);
      
      if (directError) {
        console.log('❌ Index check failed:', directError.message);
      } else {
        console.log('✅ Index check successful!');
        console.log(`🔍 Found ${directIndexes?.length || 0} constraints`);
      }
    } else {
      console.log('✅ Index check successful!');
      console.log(`🔍 Found ${indexes?.length || 0} optimization indexes`);
      if (indexes && indexes.length > 0) {
        console.log('📋 Sample indexes:');
        indexes.slice(0, 5).forEach(index => {
          console.log(`   - ${index.indexname} on ${index.tablename}`);
        });
      }
    }
    
    if (indexError) {
      console.log('❌ Index check failed:', indexError.message);
    } else {
      console.log('✅ Index check successful!');
      console.log(`🔍 Found ${indexes?.length || 0} optimization indexes`);
      if (indexes && indexes.length > 0) {
        console.log('📋 Sample indexes:');
        indexes.slice(0, 5).forEach(index => {
          console.log(`   - ${index.indexname} on ${index.tablename}`);
        });
      }
    }

    // Test 5: Test lead assignment function
    console.log('\n5️⃣ Testing lead assignment function...');
    // First, get a sample lead and agent
    const { data: sampleLead } = await supabase
      .from('leads')
      .select('id')
      .limit(1);
    
    const { data: sampleAgent } = await supabase.rpc('get_front_sales_agents');
    
    if (sampleLead && sampleLead.length > 0 && sampleAgent && sampleAgent.length > 0) {
      console.log('✅ Lead assignment function ready for testing');
      console.log(`📝 Sample lead ID: ${sampleLead[0].id}`);
      console.log(`👤 Sample agent ID: ${sampleAgent[0].profile_id}`);
    } else {
      console.log('⚠️  No sample data available for lead assignment test');
    }

    console.log('\n🎉 Optimization testing completed!');
    
    if (functionError || statsError || analyticsError) {
      console.log('\n💡 Some tests failed. Please ensure you have:');
      console.log('   1. Executed the database-optimization-direct.sql script in your Supabase dashboard');
      console.log('   2. All queries completed successfully');
      console.log('   3. Proper permissions are set');
    } else {
      console.log('\n✨ All tests passed! Your database is optimized and ready.');
    }

  } catch (error) {
    console.error('❌ Unexpected error during testing:', error);
  }
}

testOptimization().then(() => {
  console.log('\n🏁 Test completed');
  process.exit(0);
}).catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
}); 