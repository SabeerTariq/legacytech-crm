import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = "https://yipyteszzyycbqgzpfrf.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// The employees from your data who need accounts
const employeesNeedingAccounts = [
  {
    id: "14d4edad-a775-4708-99a5-ce3241faef66",
    name: "Adnan Shafaqat",
    email: "adnanshafaqat9@gmail.com"
  },
  {
    id: "d0620bb5-9478-4b96-aabc-16cb128feaca",
    name: "Asad Ullah Khan",
    email: "technologist.asad@gmail.com"
  },
  {
    id: "9494e0b3-9791-47ec-ab2d-072532574920",
    name: "Bilal Ahmed",
    email: "Bilalmamon12345@gmail.com"
  },
  {
    id: "8f254a92-237e-4633-9ef5-0b389318bcfc",
    name: "Hassaan Umer Ansari",
    email: "hassaan.ansari52@gmail.com"
  },
  {
    id: "e97532f0-cc1d-4807-9b0e-f2eb2116fabf",
    name: "Iftikhar",
    email: "iftikharkhnn@gmail.com"
  },
  {
    id: "31fd0ae4-d76e-468c-a85c-3595034b31aa",
    name: "Jahan Bakhsh Rasoli",
    email: "jahanrasoli55@gmail.com"
  },
  {
    id: "86f80dea-829a-4632-8560-0770c715c271",
    name: "Mohammed Sajid",
    email: "mohammedsajidb@gmail.com"
  },
  {
    id: "e3f783a9-b3ce-46b0-805b-5845584e447b",
    name: "Muhammad Fahad",
    email: "fahadmuhsib@gmail.com"
  },
  {
    id: "2ce598ee-e655-4715-a1e5-e6b78d3e3e47",
    name: "Musawir Rasoli",
    email: "musawirrasouli@gmail.com"
  },
  {
    id: "2ad7fe4f-92f6-435c-b186-7e4ede3d1d2b",
    name: "Vincent Welfred Khan",
    email: "vwelfred@gmail.com"
  },
  {
    id: "6befe951-bdab-45d0-9925-2281272f8ce2",
    name: "Ali",
    email: "ali@logicworks.ai"
  }
];

async function generateEmailsForEmployees() {
  console.log('📧 Generating User Management Emails for Front Sales Employees\n');

  try {
    console.log('📊 Processing employees...\n');

    for (const employee of employeesNeedingAccounts) {
      console.log(`🔧 Processing: ${employee.name}`);
      console.log(`   Original Email: ${employee.email}`);
      
      try {
        // Generate user management email
        const { data: generatedEmail, error: genError } = await supabaseAdmin.rpc(
          'generate_employee_user_email',
          {
            employee_full_name: employee.name,
            employee_department: 'Front Sales'
          }
        );

        if (genError) {
          console.log(`   ❌ Error generating email:`, genError.message);
          continue;
        }

        console.log(`   📧 Generated Email: ${generatedEmail}`);

        // Update employee record with the generated email
        const { error: updateError } = await supabaseAdmin
          .from('employees')
          .update({ 
            user_management_email: generatedEmail,
            personal_email: employee.email 
          })
          .eq('id', employee.id);

        if (updateError) {
          console.log(`   ❌ Error updating employee:`, updateError.message);
        } else {
          console.log(`   ✅ Email updated successfully`);
        }

        console.log('');

      } catch (error) {
        console.log(`   ❌ Error processing ${employee.name}:`, error.message);
        console.log('');
      }
    }

    // Show final results
    console.log('📊 Final Results:');
    const { data: updatedEmployees, error: fetchError } = await supabaseAdmin
      .from('employees')
      .select('id, full_name, email, personal_email, user_management_email, department')
      .in('id', employeesNeedingAccounts.map(emp => emp.id))
      .order('full_name');

    if (fetchError) {
      console.log('❌ Error fetching updated employees:', fetchError.message);
    } else {
      console.log('\n   Employee Email Status:');
      updatedEmployees?.forEach((emp, index) => {
        console.log(`   ${index + 1}. ${emp.full_name}`);
        console.log(`      Personal Email: ${emp.personal_email || emp.email}`);
        console.log(`      User Management Email: ${emp.user_management_email || 'Not set'}`);
        console.log('');
      });
    }

    console.log('✅ Email generation completed!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Run create-front-sales-users.js to create user accounts');
    console.log('   2. Users will be able to login with their user management emails');
    console.log('   3. Default password will be: TemporaryPassword123!');

  } catch (error) {
    console.error('❌ Process failed:', error);
  }
}

// Run the script
generateEmailsForEmployees(); 