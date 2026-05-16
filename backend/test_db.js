import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function test() {
  try {
    console.log('Testing connection...');
    const res = await pool.query('SELECT COUNT(*) FROM "Transaction"');
    console.log('Total transactions:', res.rows[0].count);
    
    console.log('Testing actual groupBy query...');
    // Simulate reportService.js:23
    const userId = (await pool.query('SELECT id FROM "User" LIMIT 1')).rows[0].id;
    const now = new Date();
    const yesterdayStart = new Date(now); yesterdayStart.setHours(0,0,0,0); yesterdayStart.setDate(now.getDate() - 1);
    const todayEnd = new Date(now); todayEnd.setHours(23,59,59,999);
    
    const res2 = await pool.query(
      'SELECT type, date, SUM(amount) FROM "Transaction" WHERE "userId" = $1 AND "date" >= $2 AND "date" <= $3 GROUP BY type, date',
      [userId, yesterdayStart, todayEnd]
    );
    console.log('Success actual groupBy:', res2.rowCount);
  } catch (err) {
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
  } finally {
    await pool.end();
  }
}

test();
