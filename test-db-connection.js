// Simple database connection test
import { Pool } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const testDatabaseConnection = async () => {
  console.log('🔍 Testing database connection...');
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in environment variables');
    return;
  }

  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    console.log('🔌 Attempting to connect to database...');
    const client = await pool.connect();
    
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    console.log('🧪 Testing simple query...');
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ Query successful! Current time:', result.rows[0].current_time);
    
    // List available tables
    console.log('📋 Checking available tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    if (tablesResult.rows.length > 0) {
      console.log('📊 Available tables:');
      tablesResult.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
    } else {
      console.log('⚠️  No tables found in database');
    }
    
    client.release();
    console.log('🎉 Database test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
  }
};

testDatabaseConnection();