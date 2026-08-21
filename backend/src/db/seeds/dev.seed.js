const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.info('🌱 Starting dev database seeding...');

  // Clean existing data in reverse order of foreign keys
  await prisma.reportStatusHistory.deleteMany();
  await prisma.reportReporter.deleteMany();
  await prisma.report.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.room.deleteMany();
  await prisma.building.deleteMany();
  await prisma.stream.deleteMany();
  await prisma.department.deleteMany();

  // 1. Seed Dev Admin
  const passwordHash = await bcrypt.hash('admin123', 12);
  const admin = await prisma.admin.create({
    data: {
      username: 'admin',
      passwordHash,
    },
  });
  console.info(`✅ Seeded Dev Admin: username = "admin", password = "admin123" (ID: ${admin.id})`);

  // 2. Seed Departments & Streams
  const cseDept = await prisma.department.create({
    data: {
      name: 'Computer Science & Engineering',
      streams: {
        create: [
          { name: 'CSE Core' },
          { name: 'AI & Data Science' },
          { name: 'Cyber Security' },
        ],
      },
    },
    include: { streams: true },
  });

  const itDept = await prisma.department.create({
    data: {
      name: 'Information Technology',
      streams: {
        create: [
          { name: 'IT Core' },
          { name: 'Cloud Computing & DevOps' },
        ],
      },
    },
    include: { streams: true },
  });

  const eceDept = await prisma.department.create({
    data: {
      name: 'Electronics & Communication Engineering',
      streams: {
        create: [
          { name: 'ECE Core' },
          { name: 'VLSI & Embedded Systems' },
        ],
      },
    },
    include: { streams: true },
  });

  console.info(`✅ Seeded ${[cseDept, itDept, eceDept].length} departments with associated streams.`);

  // 3. Seed Buildings & Rooms
  const blockA = await prisma.building.create({
    data: {
      name: 'Block A - Computing Center',
      rooms: {
        create: [
          { name: 'Lab 101 - Software Systems' },
          { name: 'Lab 102 - Advanced AI Lab' },
          { name: 'Room 201 - Seminar Hall' },
          { name: 'Room 202 - Network Lab' },
        ],
      },
    },
    include: { rooms: true },
  });

  const blockB = await prisma.building.create({
    data: {
      name: 'Block B - Electronics & Hardware',
      rooms: {
        create: [
          { name: 'Lab 301 - Microprocessors' },
          { name: 'Lab 302 - VLSI Design' },
          { name: 'Room 105 - IoT Workshop' },
        ],
      },
    },
    include: { rooms: true },
  });

  const blockC = await prisma.building.create({
    data: {
      name: 'Block C - Innovation Hub',
      rooms: {
        create: [
          { name: 'Room 401 - Project Lab' },
          { name: 'Room 402 - Robotics Lab' },
        ],
      },
    },
    include: { rooms: true },
  });

  console.info(`✅ Seeded ${[blockA, blockB, blockC].length} buildings with associated rooms.`);
  console.info('✨ Dev seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
