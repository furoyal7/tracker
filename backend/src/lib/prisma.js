import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 20, // Increased for concurrent queries
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false }
    : { rejectUnauthorized: false } // Always false for Neon if not providing CA
});

// 🔍 POOL ERROR HANDLING
pool.on('error', (err) => {
  console.error('[DB Pool Error] Unexpected error on idle client:', err.message);
});

// 🔍 DATABASE ENCODING VERIFICATION
/*
pool.query('SHOW SERVER_ENCODING', (err, res) => {
  if (err) {
    console.error('[DB] Failed to verify encoding:', err);
  } else {
    console.log(`[DB] Server Encoding: ${res.rows[0].server_encoding}`);
    if (res.rows[0].server_encoding !== 'UTF8') {
      console.warn('[DB] WARNING: Server encoding is not UTF8. Amharic text might be corrupted.');
    }
  }
});
*/

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ['error', 'warn'],
});

export default prisma;
