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
    // Query all tables in all schemas except system schemas
    const res = await client.query(`
      SELECT table_schema, table_name
      FROM information_schema.tables
      WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
      ORDER BY table_schema, table_name;
    `);
    console.log('Tables:');
    for (const row of res.rows) {
      console.log(`${row.table_schema}.${row.table_name}`);
    }
  } catch (error) {
    console.error('Error querying tables:', error);
  } finally {
    await client.end();
    process.exit();
  }
}

main(); 