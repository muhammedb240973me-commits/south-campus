import { PrismaClient, Role, StudentType } from '@prisma/client';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DIRECT_URL || process.env.DATABASE_URL,
        },
    },
});

// List your 10 actual division names here
const DIVISIONS = [
  'Kozhikode',
  'Feroke',
  'Kunnamangalam',
  'Mavoor',
  'Narikkuni',
  'Poonoor',
  'Mukkam',
  'Thamarassery',
  'Omassery',
  'Koduvally',
];

interface CSVStudentRow {
  Name: string;
  Mobile: string;
  Type: string;
  Campus: string;
  Division: string;
}

async function main() {
  console.log('--- Starting Database Seeding ---');

  // 1. Create District Admin User
  const adminPasswordHash = await bcrypt.hash('south313', 10);
  await prisma.user.upsert({
    where: { username: 'syndicate' },
    update: {},
    create: {
      username: 'admin',
      password: adminPasswordHash,
      role: Role.DISTRICT,
    },
  });
  console.log('✅ District Admin created (User: syndicate / Pass: south313)');

  // 2. Create Division Users
  for (const divName of DIVISIONS) {
    const username = divName.toLowerCase().replace(/\s+/g, '');
    const passwordHash = await bcrypt.hash(`${username}786`, 10);

    await prisma.user.upsert({
      where: { username },
      update: {},
      create: {
        username,
        password: passwordHash,
        role: Role.DIVISION,
        divisionName: divName,
      },
    });
  }
  console.log(`✅ ${DIVISIONS.length} Division user accounts created.`);

  // 3. Import Students from CSV
  const csvFilePath = path.join(process.cwd(), 'students.csv');

  if (!fs.existsSync(csvFilePath)) {
    console.error('❌ Error: students.csv not found in root directory!');
    return;
  }

  const studentsToInsert: any[] = [];

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (row: CSVStudentRow) => {
      // Normalize type to match Prisma Enum (FRIEND or MEMBER)
      const typeEnum =
        row.Type?.trim().toUpperCase() === 'MEMBER'
          ? StudentType.MEMBER
          : StudentType.FRIEND;

      studentsToInsert.push({
        name: row.Name?.trim(),
        mobile: row.Mobile?.trim(),
        type: typeEnum,
        campus: row.Campus?.trim(),
        division: row.Division?.trim(),
      });
    })
    .on('end', async () => {
      console.log(`⏳ Read ${studentsToInsert.length} rows from CSV. Inserting...`);
      
      // Bulk insert students using createMany
      await prisma.student.createMany({
        data: studentsToInsert,
        skipDuplicates: true,
      });

      console.log('🚀 All students successfully imported!');
      await prisma.$disconnect();
    });
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});