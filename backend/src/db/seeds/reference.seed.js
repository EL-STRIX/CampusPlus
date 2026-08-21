const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Replace the data below with the institution's actual department,
 * stream, building, and room data before deploying to production.
 */
const INSTITUTION_DEPARTMENTS = [
  {
    name: 'Computer Science & Engineering',
    streams: ['CSE Core', 'Artificial Intelligence & Machine Learning', 'Data Science', 'Cyber Security'],
  },
  {
    name: 'Information Technology',
    streams: ['IT Core', 'Cloud Technologies & Networking'],
  },
  {
    name: 'Electronics & Communication Engineering',
    streams: ['ECE Core', 'VLSI Design', 'Embedded Systems'],
  },
  {
    name: 'Electrical & Electronics Engineering',
    streams: ['EEE Core', 'Power Systems & EV Technology'],
  },
  {
    name: 'Mechanical Engineering',
    streams: ['Mechanical Core', 'Mechatronics & Automation'],
  },
];

const INSTITUTION_BUILDINGS = [
  {
    name: 'Academic Block A (Engineering & CS)',
    rooms: ['Lab A-101 (Systems Lab)', 'Lab A-102 (AI Lab)', 'Lab A-201 (Database Lab)', 'Lab A-202 (Hardware Lab)'],
  },
  {
    name: 'Academic Block B (Electronics & Circuits)',
    rooms: ['Lab B-101 (DSP Lab)', 'Lab B-102 (Microcontroller Lab)', 'Lab B-201 (Communication Lab)'],
  },
  {
    name: 'Central Research & Innovation Hub',
    rooms: ['Room C-301 (Robotics Lab)', 'Room C-302 (IoT & Sensor Lab)', 'Room C-401 (Project Studio)'],
  },
];

async function main() {
  console.info('🌱 Seeding institutional reference data...');

  for (const deptData of INSTITUTION_DEPARTMENTS) {
    let dept = await prisma.department.findFirst({
      where: { name: deptData.name },
    });

    if (!dept) {
      dept = await prisma.department.create({
        data: { name: deptData.name },
      });
      console.info(`Created department: ${dept.name}`);
    }

    for (const streamName of deptData.streams) {
      const existingStream = await prisma.stream.findFirst({
        where: { name: streamName, departmentId: dept.id },
      });

      if (!existingStream) {
        await prisma.stream.create({
          data: {
            name: streamName,
            departmentId: dept.id,
          },
        });
      }
    }
  }

  for (const bldgData of INSTITUTION_BUILDINGS) {
    let bldg = await prisma.building.findFirst({
      where: { name: bldgData.name },
    });

    if (!bldg) {
      bldg = await prisma.building.create({
        data: { name: bldgData.name },
      });
      console.info(`Created building: ${bldg.name}`);
    }

    for (const roomName of bldgData.rooms) {
      const existingRoom = await prisma.room.findFirst({
        where: { name: roomName, buildingId: bldg.id },
      });

      if (!existingRoom) {
        await prisma.room.create({
          data: {
            name: roomName,
            buildingId: bldg.id,
          },
        });
      }
    }
  }

  console.info('✅ Institutional reference data seeded successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Reference seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
