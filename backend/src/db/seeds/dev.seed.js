const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const ALL_DEPARTMENTS = [
  {
    name: 'Computer Science & Engineering (CSE)',
    streams: [
      'CSE (Core)',
      'AI & Machine Learning (AI & ML)',
      'Data Science & Analytics',
      'Cyber Security & Digital Forensics',
      'Cloud Computing & DevOps',
      'Internet of Things (IoT)',
    ],
  },
  {
    name: 'Computer Applications (BCA / MCA)',
    streams: [
      'BCA (Core)',
      'BCA (Cloud Computing)',
      'BCA (Cyber Security & Ethical Hacking)',
      'BCA (Data Science)',
      'MCA (Computer Applications)',
    ],
  },
  {
    name: 'Information Technology (IT)',
    streams: [
      'IT (Core)',
      'Network Engineering & System Administration',
      'Information Security',
    ],
  },
  {
    name: 'Electronics & Communication Engineering (ECE)',
    streams: [
      'ECE (Core)',
      'VLSI Design & Microelectronics',
      'Embedded Systems & IoT',
      'Telecommunication & Microwave Engineering',
      'Signal & Image Processing',
    ],
  },
  {
    name: 'Electrical & Electronics Engineering (EEE)',
    streams: [
      'EEE (Core)',
      'Electric Vehicle (EV) & Battery Tech',
      'Power Electronics & Industrial Drives',
      'Power Systems Engineering',
      'Renewable & Solar Energy Systems',
    ],
  },
  {
    name: 'Electrical Engineering (EE)',
    streams: [
      'Electrical Engineering (Core)',
      'Control & Automation Systems',
      'Smart Grid & Energy Management',
    ],
  },
  {
    name: 'Electronics & Instrumentation Engineering (EIE / ICE)',
    streams: [
      'Instrumentation & Control (Core)',
      'Industrial Automation & PLC/SCADA',
      'Biomedical Instrumentation',
      'Sensor Technology & Measurement',
    ],
  },
  {
    name: 'Mechanical Engineering (ME)',
    streams: [
      'Mechanical Engineering (Core)',
      'Mechatronics & Industrial Automation',
      'CAD / CAM & Robotics',
      'Thermal & Fluid Power Engineering',
      'Automobile & IC Engines',
    ],
  },
  {
    name: 'Robotics & Automation Engineering',
    streams: [
      'Robotics & Automation (Core)',
      'Industrial Robotics & Machine Vision',
      'Autonomous Systems & Drone/UAV Tech',
    ],
  },
  {
    name: 'Civil Engineering (CE)',
    streams: [
      'Civil Engineering (Core)',
      'Geotechnical & Material Testing Lab',
      'Surveying & Remote Sensing / GIS Lab',
      'Structural & Concrete Technology',
    ],
  },
  {
    name: 'Aerospace & Aeronautical Engineering',
    streams: [
      'Aerospace Engineering (Core)',
      'Avionics, Radar & Navigation Systems',
      'Aerodynamics & Propulsion Lab',
    ],
  },
  {
    name: 'Biomedical & Medical Electronics Engineering',
    streams: [
      'Biomedical Engineering (Core)',
      'Medical Imaging & Diagnostic Equipment',
      'Biomaterials & Rehabilitation Lab',
    ],
  },
  {
    name: 'Biotechnology & Biochemical Engineering',
    streams: [
      'Biotechnology (Core)',
      'Bioinformatics & Computational Biology',
      'Bioprocess & Analytical Instrumentation',
    ],
  },
  {
    name: 'Chemical Engineering',
    streams: [
      'Chemical Engineering (Core)',
      'Process Control & Instrumentation',
      'Petrochemical & Energy Lab',
    ],
  },
  {
    name: 'Multimedia, Animation & Media Sciences',
    streams: [
      'Animation & Visual Effects (VFX Lab)',
      'Multimedia & Graphic Design Studio',
      'Sound Recording & Media Tech Lab',
    ],
  },
  {
    name: 'Physics & Basic Sciences (Applied Laboratory)',
    streams: [
      'Engineering Physics & Optics Lab',
      'Semiconductor & Materials Lab',
      'Applied Chemistry & Instrumentation Lab',
    ],
  },
];

const ALL_BUILDINGS = [
  {
    name: 'Academic Block A (Computer Science & Applications)',
    rooms: [
      'Lab A-101 (Programming & Systems Lab)',
      'Lab A-102 (AI, ML & Data Science Lab)',
      'Lab A-201 (Cloud Computing & Networks Lab)',
      'Lab A-202 (Cyber Security & Forensics Lab)',
      'Lab A-301 (BCA/MCA Software Lab)',
      'Lab A-302 (Web & Mobile App Dev Lab)',
    ],
  },
  {
    name: 'Academic Block B (Electronics & Electrical Engineering)',
    rooms: [
      'Lab B-101 (Basic Electrical & Circuits Lab)',
      'Lab B-102 (Power Electronics & Drives Lab)',
      'Lab B-201 (Analog & Digital Communication Lab)',
      'Lab B-202 (VLSI Design & Microelectronics Lab)',
      'Lab B-301 (Microprocessor & Embedded Systems Lab)',
      'Lab B-302 (Electric Vehicle & Power Systems Lab)',
    ],
  },
  {
    name: 'Academic Block C (Mechanical, Robotics & Mechatronics)',
    rooms: [
      'Lab C-101 (Robotics & Automation Studio)',
      'Lab C-102 (Mechatronics & PLC/SCADA Lab)',
      'Lab C-201 (CAD / CAM & Simulation Lab)',
      'Lab C-202 (Instrumentation & Sensor Testing Lab)',
      'Lab C-301 (Thermal & Fluid Machinery Lab)',
    ],
  },
  {
    name: 'Central Research & Innovation Hub',
    rooms: [
      'Room R-401 (Central High-Performance Computing Lab)',
      'Room R-402 (IoT & Smart Sensors Incubation Lab)',
      'Room R-403 (Avionics & Aerospace Simulation Lab)',
      'Room R-404 (Biomedical & Medical Electronics Lab)',
      'Room R-501 (Multimedia, VR & VFX Production Studio)',
      'Room R-502 (Optics & Laser Physics Research Lab)',
    ],
  },
];

async function main() {
  console.info('🌱 Starting complete dev database seeding...');

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

  // 2. Seed All Technical Departments & Streams
  for (const deptData of ALL_DEPARTMENTS) {
    await prisma.department.create({
      data: {
        name: deptData.name,
        streams: {
          create: deptData.streams.map((s) => ({ name: s })),
        },
      },
    });
  }
  console.info(`✅ Seeded ${ALL_DEPARTMENTS.length} technical departments with associated streams.`);

  // 3. Seed All Campus Buildings & Laboratory Rooms
  for (const bldgData of ALL_BUILDINGS) {
    await prisma.building.create({
      data: {
        name: bldgData.name,
        rooms: {
          create: bldgData.rooms.map((r) => ({ name: r })),
        },
      },
    });
  }
  console.info(`✅ Seeded ${ALL_BUILDINGS.length} campus buildings with associated laboratory rooms.`);
  console.info('✨ Full Indian campus infrastructure seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
