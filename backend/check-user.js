import prisma from './src/lib/prisma.js';

async function main() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'fuadkedir3182@gmail.com' }
    });
    console.log('User:', {
      email: user.email,
      hasPassword: !!user.password,
      passwordValue: user.password ? 'HIDDEN' : 'NULL'
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
