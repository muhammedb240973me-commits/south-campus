// prisma/import-profsummit.ts
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const filePath = path.join(process.cwd(), 'profsummit.csv');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  
  // Split into rows and remove empty lines
  const rows = fileContent.split('\n').filter(row => row.trim() !== '');
  const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
  
  console.log(`Found ${rows.length - 1} records to process...`);

  for (let i = 1; i < rows.length; i++) {
    // Handle commas inside quotes for safe parsing
    const columns = rows[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)?.map(c => c.replace(/^"|"$/g, '').trim()) || [];
    
    if (columns.length < 4) continue;

    const data: any = {};
    headers.forEach((header, index) => {
      if (columns[index]) data[header] = columns[index];
    });

    if (!data.mobile) continue;

    try {
      await prisma.student.upsert({
        where: { mobile: data.mobile },
        update: {
          isRegistered: true, // Marks existing student as registered
        },
        create: {
          name: data.name,
          mobile: data.mobile,
          campus: data.campus,
          division: data.division,
          type: data.type === 'MEMBER' ? 'MEMBER' : 'FRIEND',
          isRegistered: true, // Creates new student as registered
        }
      });
      console.log(`✅ Processed: ${data.name}`);
    } catch (error) {
      console.error(`❌ Failed to process ${data.name}:`, error);
    }
  }
  console.log("Upload complete!");
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });