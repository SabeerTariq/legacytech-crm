import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY
);

async function checkSalesDispositions() {
  console.log('🔍 Checking sales dispositions...\n');

  try {
    // Check recent sales dispositions
    console.log('📊 Recent Sales Dispositions:');
    const { data: salesDispositions, error: salesError } = await supabase
      .from('sales_dispositions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (salesError) {
      console.error('Error fetching sales dispositions:', salesError);
    } else {
      salesDispositions.forEach(sale => {
        console.log(`  - ID: ${sale.id}`);
        console.log(`    Customer: ${sale.customer_name}`);
        console.log(`    User ID: ${sale.user_id}`);
        console.log(`    Assigned By: ${sale.assigned_by}`);
        console.log(`    Gross: ${sale.gross_value}`);
        console.log(`    Created: ${sale.created_at}`);
        console.log('');
      });
    }

    // Check if there are any sales dispositions for specific users
    console.log('👤 Checking sales for specific users...');
    const testUserIds = [
      '52e63558-b2ae-4661-97c7-47ca56a1cf7b', // Has performance data
      'b33e01cd-ca72-4409-8904-648aa26c7804', // ali@logicworks.ai
      'c03345a8-e1dc-424e-b835-f4b1002ee8af'  // shahbazyouknow@gmail.com employee
    ];

    for (const userId of testUserIds) {
      const { data: userSales, error: userSalesError } = await supabase
        .from('sales_dispositions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (userSalesError) {
        console.log(`❌ Error fetching sales for user ${userId}:`, userSalesError);
      } else {
        console.log(`📈 Sales for user ${userId}: ${userSales.length} records`);
        if (userSales.length > 0) {
          userSales.forEach(sale => {
            console.log(`  - ${sale.customer_name}: $${sale.gross_value} (${sale.created_at})`);
          });
        }
      }
    }

  } catch (error) {
    console.error('Error in checkSalesDispositions:', error);
  }
}

checkSalesDispositions(); 