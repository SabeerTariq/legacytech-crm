import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    await client.connect();
    const res = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'employees' AND table_schema = 'public';
    `);
    console.log('Columns in public.employees:');
    for (const row of res.rows) {
      console.log(`${row.column_name} (${row.data_type})`);
    }
  } catch (error) {
    console.error('Error querying columns:', error);
  } finally {
    await client.end();
    process.exit();
  }
}

main(); 