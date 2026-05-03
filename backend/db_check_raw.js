import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runTest() {
  try {
    const client = await pool.connect();
    
    const serverEnc = await client.query('SHOW SERVER_ENCODING');
    console.log('SERVER ENCODING:', serverEnc.rows[0].server_encoding);
    
    const clientEnc = await client.query('SHOW CLIENT_ENCODING');
    console.log('CLIENT ENCODING:', clientEnc.rows[0].client_encoding);
    
    await client.query('CREATE TABLE IF NOT EXISTS test_amharic (id SERIAL PRIMARY KEY, text TEXT)');
    await client.query('INSERT INTO test_amharic(text) VALUES ($1)', ['ሰላም እንዴት ነህ?']);
    
    const res = await client.query('SELECT text FROM test_amharic ORDER BY id DESC LIMIT 1');
    console.log('Retrieved:', res.rows[0].text);
    
    client.release();
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
runTest();
