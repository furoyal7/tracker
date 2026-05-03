import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkEncoding() {
  try {
    const serverEncoding = await prisma.$queryRaw`SHOW SERVER_ENCODING`;
    console.log('SERVER ENCODING:', serverEncoding);

    const clientEncoding = await prisma.$queryRaw`SHOW CLIENT_ENCODING`;
    console.log('CLIENT ENCODING:', clientEncoding);

    const amharicText = 'ሰላም እንዴት ነህ?';
    console.log('Testing Amharic string:', amharicText);
    
    // We can use the Product model or any model to test if we want, 
    // but just checking the raw query is usually enough to see if Prisma/DB handles it.
    const result = await prisma.$queryRaw`SELECT ${amharicText} as text`;
    console.log('Raw query result:', result);

    if (result[0].text === amharicText) {
      console.log('SUCCESS: Prisma/DB correctly handled Amharic text in query.');
    } else {
      console.log('FAILURE: Prisma/DB corrupted the Amharic text.');
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkEncoding();
