import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
dotenv.config();
import { getRoleForJobTitle } from './jobTitleToRole.js';
import { v4 as uuidv4 } from 'uuid';

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    await client.connect();
    // Example employee data
    const employeeId = uuidv4();
    const jobTitle = 'HR Head';
    const role = getRoleForJobTitle(jobTitle);
    const employee = {
      id: employeeId,
      name: 'Jane Doe',
      role: role,
      department: 'HR',
      email: 'jane.doe@email.com',
      join_date: '2024-01-01',
      performance: {
        sales_target: 100000,
        sales_achieved: 90000,
        tasks_completed: 30,
        projects_completed: 5,
        customer_satisfaction: 90,
        avg_task_completion_time: 3.0
      },
      created_at: new Date(),
      updated_at: new Date()
    };
    // Insert employee
    await client.query(
      `INSERT INTO employees (id, name, role, department, email, join_date, performance, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        employee.id,
        employee.name,
        employee.role,
        employee.department,
        employee.email,
        employee.join_date,
        employee.performance,
        employee.created_at,
        employee.updated_at
      ]
    );

    console.log('Employee inserted successfully!');
  } catch (error) {
    console.error('Error inserting employee:', error);
  } finally {
    await client.end();
    process.exit();
  }
}

main(); 