import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config({ path: 'e:/compute/backend/.env' });

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function test() {
  try {
    console.log('Testing connection...');
    const res = await pool.query('SELECT NOW()');
    console.log('Success:', res.rows[0]);
    
    console.log('Testing groupBy simulation...');
    // Try a more complex query similar to what's in reportService
    const res2 = await pool.query('SELECT type, date, SUM(amount) FROM "Transaction" GROUP BY type, date LIMIT 10');
    console.log('Success groupBy:', res2.rowCount);
  } catch (err) {
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
  } finally {
    await pool.end();
  }
}

test();
