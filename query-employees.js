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
    const res = await client.query('SELECT * FROM public.employees');
    console.log(res.rows);
  } catch (error) {
    console.error('Error querying employees:', error);
  } finally {
    await client.end();
    process.exit();
  }
}

main(); 