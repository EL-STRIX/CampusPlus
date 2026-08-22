const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const ALL_DEPARTMENTS = [
  {
    name: 'Computer Science & Engineering (CSE)',
    streams: [
      'CSE (Core)',
      'Artificial Intelligence & Machine Learning (AI & ML)',
      'Data Science & Big Data Analytics',
      'Cyber Security & Digital Forensics',
      'Cloud Computing & DevOps',
      'Internet of Things (IoT) & Smart Cities',
      'Software Engineering & Architecture',
      'Computer Vision & Augmented/Virtual Reality (AR/VR)',
      'Blockchain & Distributed Ledger Technology',
      'Full Stack Development & Web Technologies',
      'Quantum Computing',
    ],
  },
  {
    name: 'Computer Applications (BCA / MCA / B.Sc IT)',
    streams: [
      'BCA (Core)',
      'BCA (Cloud Technology & Information Security)',
      'BCA (Artificial Intelligence & Machine Learning)',
      'BCA (Data Science & Analytics)',
      'BCA (Mobile Application & Web Development)',
      'BCA (Banking & Financial Software Technologies)',
      'MCA (Core / Advanced Software Systems)',
      'MCA (Cloud Computing & DevOps)',
      'MCA (Cyber Security)',
      'MCA (AI & Data Science)',
      'B.Sc (Information Technology / Computer Science)',
      'M.Sc (Computer Science / IT)',
    ],
  },
  {
    name: 'Information Technology (IT)',
    streams: [
      'IT (Core)',
      'Network Engineering & Infrastructure Management',
      'Information Security & Cyber Defense',
      'Cloud Computing & Enterprise Systems',
      'Enterprise Application Development',
      'Distributed Systems & High Performance Computing',
    ],
  },
  {
    name: 'Electronics & Communication Engineering (ECE)',
    streams: [
      'ECE (Core)',
      'VLSI Design & Microelectronics',
      'Embedded Systems & IoT Engineering',
      'Telecommunication & Wireless Networks (5G/6G)',
      'Signal Processing & Machine Learning',
      'Microwave, RF & Antenna Engineering',
      'Robotics & Automation Systems',
      'Optical & Satellite Communication',
    ],
  },
  {
    name: 'Electrical & Electronics Engineering (EEE)',
    streams: [
      'EEE (Core)',
      'Electric Vehicle (EV) Technology & Battery Management',
      'Power Electronics, Drives & Industrial Automation',
      'Power Systems Engineering & High Voltage',
      'Renewable Energy & Solar Power Systems',
      'Smart Grid & Energy Storage Technologies',
      'Industrial Automation & PLC/SCADA',
    ],
  },
  {
    name: 'Electrical Engineering (EE)',
    streams: [
      'Electrical Engineering (Core)',
      'Control Systems & Industrial Automation',
      'Power System Operation, Protection & Control',
      'Energy Efficient Drives & Traction Systems',
      'High Voltage Engineering & Testing',
      'Electrical Machine Design & Diagnostics',
    ],
  },
  {
    name: 'Electronics & Instrumentation Engineering (EIE / ICE)',
    streams: [
      'Electronics & Instrumentation (Core)',
      'Instrumentation & Process Control',
      'Industrial Automation & DCS/SCADA',
      'Biomedical Instrumentation & Clinical Devices',
      'Sensor Technology & Industrial IoT',
      'Analytical Instrumentation & Precision Metrology',
    ],
  },
  {
    name: 'Mechanical Engineering (ME)',
    streams: [
      'Mechanical Engineering (Core)',
      'Mechatronics Engineering',
      'Robotics & Industrial Automation',
      'CAD / CAM & Computer Integrated Manufacturing',
      'Automobile & IC Engines Engineering',
      'Thermal Engineering & HVAC Systems',
      'Design Engineering & Finite Element Analysis (FEA)',
      'Industrial & Production Engineering',
    ],
  },
  {
    name: 'Robotics & Automation Engineering',
    streams: [
      'Robotics & Automation (Core)',
      'Industrial Robotics & Machine Vision',
      'Autonomous Systems, Mobile Robots & AGVs',
      'Drone, UAV & Unmanned Systems',
      'Human-Robot Interaction & AI in Robotics',
      'Cyber-Physical Systems & Industry 4.0',
    ],
  },
  {
    name: 'Civil Engineering (CE)',
    streams: [
      'Civil Engineering (Core)',
      'Structural Engineering & Mechanics',
      'Geotechnical & Foundation Engineering Lab',
      'Surveying, Photogrammetry & Remote Sensing (GIS)',
      'Environmental Engineering & Water Quality Lab',
      'Transportation & Highway Engineering',
      'Construction Technology & Building Information Modeling (BIM)',
    ],
  },
  {
    name: 'Aerospace & Aeronautical Engineering',
    streams: [
      'Aerospace Engineering (Core)',
      'Aeronautical Engineering (Core)',
      'Avionics, Flight Control & Radar Systems',
      'Aerodynamics & Wind Tunnel Testing',
      'Aircraft Propulsion & Gas Turbines Lab',
      'Spacecraft Technology & Satellite Systems',
    ],
  },
  {
    name: 'Biomedical & Medical Electronics Engineering',
    streams: [
      'Biomedical Engineering (Core)',
      'Medical Electronics & Signal Acquisition',
      'Diagnostic Imaging Systems (MRI, CT, Ultrasound)',
      'Biomechanics, Prosthetics & Rehabilitation',
      'Biosensors & Bio-MEMS',
      'Clinical Engineering & Hospital Equipment Management',
    ],
  },
  {
    name: 'Biotechnology & Biochemical Engineering',
    streams: [
      'Biotechnology (Core)',
      'Bioinformatics & Computational Biology',
      'Genetic Engineering & Recombinant DNA Tech',
      'Bioprocess & Fermentation Engineering',
      'Biomedical & Pharmaceutical Biotechnology',
      'Food Biotechnology & Quality Assurance Lab',
    ],
  },
  {
    name: 'Chemical Engineering',
    streams: [
      'Chemical Engineering (Core)',
      'Process Modeling, Simulation & Optimization',
      'Petroleum Refining & Petrochemical Tech',
      'Polymer Science & Chemical Synthesis Lab',
      'Environmental Chemical Engineering & Pollution Control',
      'Energy & Electrochemical Systems (Fuel Cells & Batteries)',
    ],
  },
  {
    name: 'Multimedia, Animation & Media Sciences',
    streams: [
      'Animation & Visual Effects (VFX Lab)',
      'Multimedia & Graphic Design Studio Lab',
      'Game Design & Interactive Media Development',
      '3D Modeling, Texturing & Digital Rendering',
      'Audio Engineering, Sound Recording & Post-Production Lab',
      'Digital Film Making & Broadcast Studio',
    ],
  },
  {
    name: 'Physics & Basic Sciences (Applied Laboratory)',
    streams: [
      'Applied Physics & Optics/Laser Lab',
      'Semiconductor Physics & Nanotechnology Lab',
      'Applied Chemistry & Instrumental Chemical Analysis',
      'Materials Science & Crystallography Lab',
      'Environmental Sciences & Analytical Testing',
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
  console.info(`✅ Seeded ${ALL_DEPARTMENTS.length} technical departments with ${ALL_DEPARTMENTS.reduce((acc, d) => acc + d.streams.length, 0)} associated specialized streams.`);

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
