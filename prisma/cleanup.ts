// prisma/cleanup.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const students = await prisma.student.findMany();
  let deletedCount = 0;

  for (const student of students) {
    // Identifies corrupted data: mobile has letters, name is just numbers, or name is 1 letter
    const isCorrupted = /[a-zA-Z]/.test(student.mobile) || /^\d+$/.test(student.name) || student.name.length <= 1;
    
    if (isCorrupted) {
      await prisma.student.delete({ where: { id: student.id } });
      deletedCount++;
    }
  }

  console.log(`🧹 Successfully deleted ${deletedCount} corrupted records!`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });