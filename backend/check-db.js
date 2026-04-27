import prisma from './src/lib/prisma.js';

async function main() {
  try {
    const userCount = await prisma.user.count();
    console.log(`User count: ${userCount}`);
    const users = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        username: true
      },
      take: 5
    });
    console.log('Sample users:', JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error connecting to database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
