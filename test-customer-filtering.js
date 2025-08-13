import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const testCustomerFiltering = async () => {
  try {
    console.log('🔍 Testing Customer Filtering for Front Sales Users...\n');

    // 1. Check sales_dispositions table structure
    console.log('📋 1. Checking sales_dispositions table structure...');
    const { data: sampleSales, error: sampleError } = await supabase
      .from('sales_dispositions')
      .select('*')
      .limit(3);

    if (sampleError) {
      console.error('❌ Error fetching sample data:', sampleError);
      return;
    }

    console.log(`📊 Found ${sampleSales.length} sample records`);
    
    if (sampleSales.length > 0) {
      console.log('\n📊 Sales Dispositions Table Columns:');
      const columns = Object.keys(sampleSales[0]);
      columns.forEach(col => {
        console.log(`  - ${col}`);
      });

      // 2. Check if user_id field exists and has data
      const hasUserId = columns.includes('user_id');
      console.log(`\n📋 2. User ID field exists: ${hasUserId ? '✅ YES' : '❌ NO'}`);

      if (hasUserId) {
        // Check how many records have user_id
        const { data: userCount, error: countError } = await supabase
          .from('sales_dispositions')
          .select('user_id')
          .not('user_id', 'is', null);

        if (countError) {
          console.error('❌ Error checking user_id data:', countError);
          return;
        }

        console.log(`📊 Records with user_id: ${userCount.length}`);

        // 3. Check unique user_ids
        const uniqueUserIds = [...new Set(userCount.map(record => record.user_id))];
        console.log(`📊 Unique user_ids: ${uniqueUserIds.length}`);
        console.log('📊 User IDs:', uniqueUserIds);

        // 4. Test filtering for a specific user
        if (uniqueUserIds.length > 0) {
          const testUserId = uniqueUserIds[0];
          console.log(`\n📋 4. Testing filtering for user_id: ${testUserId}`);
          
          const { data: filteredSales, error: filterError } = await supabase
            .from('sales_dispositions')
            .select('*')
            .eq('user_id', testUserId);

          if (filterError) {
            console.error('❌ Error filtering by user_id:', filterError);
            return;
          }

          console.log(`📊 Sales dispositions for user ${testUserId}: ${filteredSales.length}`);
          
          if (filteredSales.length > 0) {
            console.log('📊 Sample filtered records:');
            filteredSales.slice(0, 2).forEach((sale, index) => {
              console.log(`  ${index + 1}. ${sale.customer_name} - ${sale.email} - $${sale.gross_value}`);
            });
          }
        }
      }
    }

    // 5. Check user_profiles table for front_sales users
    console.log('\n📋 5. Checking front_sales users in user_profiles...');
    const { data: frontSalesUsers, error: usersError } = await supabase
      .from('user_profiles')
      .select(`
        *,
        employees:employees(*)
      `)
      .eq('employees.department', 'Front Sales');

    if (usersError) {
      console.error('❌ Error fetching front_sales users:', usersError);
      return;
    }

    console.log(`📊 Found ${frontSalesUsers.length} front_sales users:`);
    frontSalesUsers.forEach(user => {
      console.log(`  - ${user.employees?.full_name} (${user.email}) - User ID: ${user.user_id}`);
    });

    // 6. Test filtering for each front_sales user
    if (frontSalesUsers.length > 0) {
      console.log('\n📋 6. Testing customer filtering for each front_sales user...');
      
      for (const user of frontSalesUsers) {
        console.log(`\n📊 Testing for user: ${user.employees?.full_name} (${user.user_id})`);
        
        const { data: userSales, error: userSalesError } = await supabase
          .from('sales_dispositions')
          .select('*')
          .eq('user_id', user.user_id);

        if (userSalesError) {
          console.error(`❌ Error fetching sales for user ${user.user_id}:`, userSalesError);
          continue;
        }

        console.log(`  📊 Sales dispositions: ${userSales.length}`);
        
        if (userSales.length > 0) {
          console.log('  📊 Customers:');
          userSales.forEach(sale => {
            console.log(`    - ${sale.customer_name} (${sale.email}) - $${sale.gross_value}`);
          });
        } else {
          console.log('  📊 No customers found for this user');
        }
      }
    }

    console.log('\n🎯 Customer Filtering Test Complete!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
};

testCustomerFiltering(); 