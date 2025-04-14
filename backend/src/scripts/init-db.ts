import mysql from 'mysql2/promise';
import { config } from '../config/env.config';

/**
 * Script to initialize the database
 * This will create the database if it doesn't exist
 */
async function initializeDatabase() {
  try {
    // Create a connection without specifying a database
    const connection = await mysql.createConnection({
      host: config.database.host,
      user: config.database.user,
      password: config.database.password,
      port: config.database.port
    });

    console.log('Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${config.database.name}`);
    console.log(`Database '${config.database.name}' created or already exists`);

    // Close the connection
    await connection.end();
    console.log('Database initialization completed');
    
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeDatabase();
