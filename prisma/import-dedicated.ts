// prisma/import-dedicated.ts
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const filePath = path.join(process.cwd(), 'profsummit.csv');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  
  const rows = fileContent.split('\n').filter(row => row.trim() !== '');
  const headers = rows[0].split(',').map(h => h.replace(/^"|"$/g, '').trim().toLowerCase());
  
  let successCount = 0;

  for (let i = 1; i < rows.length; i++) {
    const columns = rows[i]
      .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
      .map(c => c.replace(/^"|"$/g, '').trim());
    
    const data: any = {};
    headers.forEach((header, index) => {
      if (columns[index] !== undefined) data[header] = columns[index];
    });

    // 1. Core existence check
    if (!data.mobile || !data.name || !data.campus || !data.division) continue;
    
    // 2. Strict Name Validation: Reject names shorter than 3 letters or numbers-only
    const cleanName = data.name.trim();
    if (cleanName.length < 3 || /^\d+$/.test(cleanName) || cleanName.toLowerCase() === 'pp') {
      console.log(`Skipped invalid name: ${cleanName}`);
      continue;
    }
    
    // 3. Strict Mobile Validation: Must extract at least 10 digits
    const phoneDigits = data.mobile.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      console.log(`Skipped invalid mobile: ${data.mobile}`);
      continue;
    }

    try {
      await prisma.profsummitStudent.upsert({
        where: { mobile: data.mobile },
        update: {
          name: cleanName,
          campus: data.campus,
          division: data.division,
          type: data.type || "FRIEND",
        },
        create: {
          name: cleanName,
          mobile: data.mobile,
          campus: data.campus,
          division: data.division,
          type: data.type || "FRIEND",
        }
      });
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to database insert: ${cleanName}`);
    }
  }
  console.log(`\n✅ Upload complete! Successfully saved ${successCount} valid registrations to the dedicated table.`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });