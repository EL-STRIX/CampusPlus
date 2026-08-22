const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial campus lab equipment reports...');

  const admin = await prisma.admin.findFirst();
  if (!admin) {
    throw new Error('Admin user not found. Please ensure database has admin user.');
  }

  // Clear existing reports so fresh canonical records are seeded
  await prisma.report.deleteMany();

  // Sample photo URLs from uploads
  const photo1 = '/uploads/computer_lab.jpg';
  const photo2 = '/uploads/09de6330-3c02-460d-85a6-24481a89e90c.jpeg';
  const photo3 = '/uploads/science_lab.jpg';

  // 1. High Priority Computer Lab Issue (Open - 3 reports)
  const rep1 = await prisma.report.create({
    data: {
      deviceType: 'CPU / Computer Workstation',
      deviceNumber: 'BWU/CPU/1852',
      deviceNumberVisible: true,
      labType: 'Computer / Software Systems Lab',
      buildingName: 'Academic Block 1',
      roomName: 'Lab 408',
      photoUrl: photo1,
      reportCount: 3,
      possibleDuplicate: false,
      status: 'open',
      createdAt: new Date(Date.now() - 3600000 * 2), // 2 hours ago
      reporters: {
        create: [
          {
            studentCode: 'BWU/BCA/24/330',
            department: 'Computer Applications (BCA / MCA / B.Sc IT)',
            stream: 'Bachelor of Computer Applications (BCA)',
            labType: 'Computer / Software Systems Lab',
            yearSemester: '1st Year / Sem 1',
            notes: 'System power supply SMPS sparking when turning on.',
            reportedAt: new Date(Date.now() - 3600000 * 5),
          },
          {
            studentCode: 'BWU/BCA/24/345',
            department: 'Computer Applications (BCA / MCA / B.Sc IT)',
            stream: 'Bachelor of Computer Applications (BCA)',
            labType: 'Computer / Software Systems Lab',
            yearSemester: '1st Year / Sem 1',
            notes: 'Blue screen error and smoke smell from CPU tower.',
            reportedAt: new Date(Date.now() - 3600000 * 3),
          },
          {
            studentCode: 'BWU/MCA/23/012',
            department: 'Computer Applications (BCA / MCA / B.Sc IT)',
            stream: 'Master of Computer Applications (MCA)',
            labType: 'Computer / Software Systems Lab',
            yearSemester: '2nd Year / Sem 3',
            notes: 'PC 1852 is dead and does not boot up.',
            reportedAt: new Date(Date.now() - 3600000 * 2),
          },
        ],
      },
      statusHistory: {
        create: [
          { status: 'open', changedAt: new Date(Date.now() - 3600000 * 5), changedBy: admin.id },
        ],
      },
    },
  });

  // 2. Pharma Lab UV Spectrophotometer (In Progress - 2 reports)
  const rep2 = await prisma.report.create({
    data: {
      deviceType: 'UV-Visible Spectrophotometer',
      deviceNumber: 'BWU/PHARM/UV-09',
      deviceNumberVisible: true,
      labType: 'Pharmaceutical Sciences & Formulation Lab',
      buildingName: 'Pharmacy Block C',
      roomName: 'Formulation Lab 201',
      photoUrl: photo2,
      reportCount: 2,
      possibleDuplicate: false,
      status: 'in_progress',
      createdAt: new Date(Date.now() - 3600000 * 12),
      reporters: {
        create: [
          {
            studentCode: 'BWU/BPHARM/22/045',
            department: 'Pharmacy & Pharmaceutical Sciences',
            stream: 'Bachelor of Pharmacy (B.Pharm)',
            labType: 'Pharmaceutical Sciences & Formulation Lab',
            yearSemester: '3rd Year / Sem 5',
            notes: 'Deuterium lamp calibration error #42 during absorbance measurement.',
            reportedAt: new Date(Date.now() - 3600000 * 14),
          },
          {
            studentCode: 'BWU/MPHARM/24/008',
            department: 'Pharmacy & Pharmaceutical Sciences',
            stream: 'M.Pharm in Pharmaceutics',
            labType: 'Pharmaceutical Sciences & Formulation Lab',
            yearSemester: '1st Year / Sem 1',
            notes: 'UV Spectrophotometer wavelength drift exceeding 5nm.',
            reportedAt: new Date(Date.now() - 3600000 * 12),
          },
        ],
      },
      statusHistory: {
        create: [
          { status: 'open', changedAt: new Date(Date.now() - 3600000 * 14), changedBy: admin.id },
          { status: 'in_progress', changedAt: new Date(Date.now() - 3600000 * 4), changedBy: admin.id },
        ],
      },
    },
  });

  // 3. VLSI Lab DSO Oscilloscope (Open - 1 report)
  const rep3 = await prisma.report.create({
    data: {
      deviceType: 'Digital Storage Oscilloscope (DSO)',
      deviceNumber: 'BWU/ECE/DSO-22',
      deviceNumberVisible: true,
      labType: 'Electronics, Circuits & VLSI Lab',
      buildingName: 'Tech Park Block B',
      roomName: 'VLSI Design Lab 304',
      photoUrl: photo3,
      reportCount: 1,
      possibleDuplicate: false,
      status: 'open',
      createdAt: new Date(Date.now() - 3600000 * 1), // 1 hour ago
      reporters: {
        create: [
          {
            studentCode: 'BWU/ECE/23/112',
            department: 'Electronics & Communication Engineering (ECE)',
            stream: 'B.Tech in Electronics & Communication Engineering',
            labType: 'Electronics, Circuits & VLSI Lab',
            yearSemester: '2nd Year / Sem 4',
            notes: 'Channel 2 BNC input jack loose and signal clipping on 100MHz waveform.',
            reportedAt: new Date(Date.now() - 3600000 * 1),
          },
        ],
      },
      statusHistory: {
        create: [
          { status: 'open', changedAt: new Date(Date.now() - 3600000 * 1), changedBy: admin.id },
        ],
      },
    },
  });

  // 4. Robotics Lab 3D Printer (Open - 1 report)
  const rep4 = await prisma.report.create({
    data: {
      deviceType: '3D Printer / Rapid Prototyping Machine',
      deviceNumber: 'BWU/ROBO/3DP-03',
      deviceNumberVisible: true,
      labType: 'Robotics, Automation & Mechatronics Lab',
      buildingName: 'Innovation Hub',
      roomName: 'Mechatronics Lab 102',
      photoUrl: photo1,
      reportCount: 1,
      possibleDuplicate: false,
      status: 'open',
      createdAt: new Date(Date.now() - 3600000 * 4),
      reporters: {
        create: [
          {
            studentCode: 'BWU/ME/23/078',
            department: 'Mechanical Engineering (ME)',
            stream: 'B.Tech in Robotics & Mechatronics',
            labType: 'Robotics, Automation & Mechatronics Lab',
            yearSemester: '2nd Year / Sem 3',
            notes: 'Extruder nozzle clogged and heated bed sensor throwing thermal runaway error.',
            reportedAt: new Date(Date.now() - 3600000 * 4),
          },
        ],
      },
      statusHistory: {
        create: [
          { status: 'open', changedAt: new Date(Date.now() - 3600000 * 4), changedBy: admin.id },
        ],
      },
    },
  });

  // 5. Biomedical Lab ECG Monitor (Open - 2 reports)
  const rep5 = await prisma.report.create({
    data: {
      deviceType: 'ECG / EKG Patient Simulator & Monitor',
      deviceNumber: 'BWU/BME/ECG-07',
      deviceNumberVisible: true,
      labType: 'Biomedical Engineering & Medical Diagnostics Lab',
      buildingName: 'Bio-Medical Research Wing',
      roomName: 'Diagnostics Lab 202',
      photoUrl: photo2,
      reportCount: 2,
      possibleDuplicate: false,
      status: 'open',
      createdAt: new Date(Date.now() - 3600000 * 8),
      reporters: {
        create: [
          {
            studentCode: 'BWU/BME/23/014',
            department: 'Biomedical & Medical Electronics Engineering',
            stream: 'B.Tech in Biomedical Engineering',
            labType: 'Biomedical Engineering & Medical Diagnostics Lab',
            yearSemester: '2nd Year / Sem 3',
            notes: 'Lead II waveform showing 50Hz AC power line interference noise.',
            reportedAt: new Date(Date.now() - 3600000 * 10),
          },
          {
            studentCode: 'BWU/BME/23/022',
            department: 'Biomedical & Medical Electronics Engineering',
            stream: 'B.Tech in Biomedical Engineering',
            labType: 'Biomedical Engineering & Medical Diagnostics Lab',
            yearSemester: '2nd Year / Sem 3',
            notes: 'Patient cable electrode 4 pin connector bent.',
            reportedAt: new Date(Date.now() - 3600000 * 8),
          },
        ],
      },
      statusHistory: {
        create: [
          { status: 'open', changedAt: new Date(Date.now() - 3600000 * 10), changedBy: admin.id },
        ],
      },
    },
  });

  // 6. Civil Concrete Lab UTM (In Progress - 1 report)
  const rep6 = await prisma.report.create({
    data: {
      deviceType: 'Universal Testing Machine (UTM) Digital Console',
      deviceNumber: 'BWU/CIVIL/UTM-01',
      deviceNumberVisible: true,
      labType: 'Civil, Geotechnical & Concrete Testing Lab',
      buildingName: 'Civil Engineering Block',
      roomName: 'Structures Lab 012',
      photoUrl: photo3,
      reportCount: 1,
      possibleDuplicate: false,
      status: 'in_progress',
      createdAt: new Date(Date.now() - 3600000 * 18),
      reporters: {
        create: [
          {
            studentCode: 'BWU/CIVIL/22/089',
            department: 'Civil Engineering (CE)',
            stream: 'B.Tech in Structural Engineering',
            labType: 'Civil, Geotechnical & Concrete Testing Lab',
            yearSemester: '3rd Year / Sem 6',
            notes: 'Digital load sensor readout fluctuating +-15kN during tensile test.',
            reportedAt: new Date(Date.now() - 3600000 * 18),
          },
        ],
      },
      statusHistory: {
        create: [
          { status: 'open', changedAt: new Date(Date.now() - 3600000 * 18), changedBy: admin.id },
          { status: 'in_progress', changedAt: new Date(Date.now() - 3600000 * 6), changedBy: admin.id },
        ],
      },
    },
  });

  // 7. Electrical Machines Lab Variac (Resolved - 1 report)
  const rep7 = await prisma.report.create({
    data: {
      deviceType: '1-Phase / 3-Phase Auto-Transformer (Variac)',
      deviceNumber: 'BWU/EE/VAR-11',
      deviceNumberVisible: true,
      labType: 'Electrical Machines & Power Electronics Lab',
      buildingName: 'Power Systems Wing',
      roomName: 'Machines Workshop 005',
      photoUrl: photo1,
      reportCount: 1,
      possibleDuplicate: false,
      status: 'resolved',
      createdAt: new Date(Date.now() - 3600000 * 48),
      resolvedAt: new Date(Date.now() - 3600000 * 6),
      reporters: {
        create: [
          {
            studentCode: 'BWU/EE/22/019',
            department: 'Electrical & Electronics Engineering (EEE)',
            stream: 'B.Tech in Electrical Engineering',
            labType: 'Electrical Machines & Power Electronics Lab',
            yearSemester: '3rd Year / Sem 5',
            notes: 'Variac knob slipping and carbon brush worn out.',
            reportedAt: new Date(Date.now() - 3600000 * 48),
          },
        ],
      },
      statusHistory: {
        create: [
          { status: 'open', changedAt: new Date(Date.now() - 3600000 * 48), changedBy: admin.id },
          { status: 'in_progress', changedAt: new Date(Date.now() - 3600000 * 24), changedBy: admin.id },
          { status: 'resolved', changedAt: new Date(Date.now() - 3600000 * 6), changedBy: admin.id },
        ],
      },
    },
  });

  // 8. Central Innovation Lab Soldering Station (Rejected - 1 report)
  const rep8 = await prisma.report.create({
    data: {
      deviceType: 'Smart Soldering & Desoldering Workstation',
      deviceNumber: 'BWU/PROT/SOL-01',
      deviceNumberVisible: true,
      labType: 'Central Innovation & Project Prototyping Lab',
      buildingName: 'Main Campus',
      roomName: 'Prototyping Lab 101',
      photoUrl: photo3,
      reportCount: 1,
      possibleDuplicate: false,
      status: 'rejected',
      rejectionReason: 'Tested by lab technician. Temperature lock mode was active; hardware is fully functional.',
      createdAt: new Date(Date.now() - 3600000 * 30),
      reporters: {
        create: [
          {
            studentCode: 'BWU/CSE/24/501',
            department: 'Computer Science & Engineering (CSE)',
            stream: 'B.Tech in Computer Science & Engineering',
            labType: 'Central Innovation & Project Prototyping Lab',
            yearSemester: '1st Year / Sem 1',
            notes: 'Soldering iron not heating up above 200C.',
            reportedAt: new Date(Date.now() - 3600000 * 30),
          },
        ],
      },
      statusHistory: {
        create: [
          { status: 'open', changedAt: new Date(Date.now() - 3600000 * 30), changedBy: admin.id },
          { status: 'rejected', changedAt: new Date(Date.now() - 3600000 * 10), changedBy: admin.id },
        ],
      },
    },
  });

  // 9. Flagged Needs Review: Untagged Computer in Lab 408 (matches rep1)
  const rep9 = await prisma.report.create({
    data: {
      deviceType: 'CPU / Computer Workstation',
      deviceNumber: null,
      deviceNumberVisible: false,
      labType: 'Computer / Software Systems Lab',
      buildingName: 'Academic Block 1',
      roomName: 'Lab 408',
      photoUrl: photo1,
      reportCount: 1,
      possibleDuplicate: true,
      suggestedMatchIds: [rep1.id],
      status: 'open',
      createdAt: new Date(Date.now() - 3600000 * 1), // 1 hour ago
      reporters: {
        create: [
          {
            studentCode: 'BWU/BCA/24/389',
            department: 'Computer Applications (BCA / MCA / B.Sc IT)',
            stream: 'Bachelor of Computer Applications (BCA)',
            labType: 'Computer / Software Systems Lab',
            yearSemester: '1st Year / Sem 1',
            notes: 'Computer near window row 3 not turning on and smells like burnt plastic. Asset tag sticker was peeled off.',
            reportedAt: new Date(Date.now() - 3600000 * 1),
          },
        ],
      },
      statusHistory: {
        create: [
          { status: 'open', changedAt: new Date(Date.now() - 3600000 * 1), changedBy: admin.id },
        ],
      },
    },
  });

  // 10. Flagged Needs Review: Untagged Oscilloscope in Circuits Lab 101 (matches rep3)
  const rep10 = await prisma.report.create({
    data: {
      deviceType: 'Digital Storage Oscilloscope (DSO)',
      deviceNumber: null,
      deviceNumberVisible: false,
      labType: 'Electronics, VLSI & Embedded Systems Lab',
      buildingName: 'Science Block',
      roomName: 'Circuits Lab 101',
      photoUrl: photo3,
      reportCount: 1,
      possibleDuplicate: true,
      suggestedMatchIds: [rep3.id],
      status: 'open',
      createdAt: new Date(Date.now() - 3600000 * 3), // 3 hours ago
      reporters: {
        create: [
          {
            studentCode: 'BWU/ECE/23/044',
            department: 'Electronics & Communication Engineering (ECE)',
            stream: 'B.Tech in Electronics & Communication Engineering',
            labType: 'Electronics, VLSI & Embedded Systems Lab',
            yearSemester: '2nd Year / Sem 3',
            notes: 'DSO on Workbench 2 has faulty Channel 1 probe BNC connector. Asset barcode is scratched and illegible.',
            reportedAt: new Date(Date.now() - 3600000 * 3),
          },
        ],
      },
      statusHistory: {
        create: [
          { status: 'open', changedAt: new Date(Date.now() - 3600000 * 3), changedBy: admin.id },
        ],
      },
    },
  });

  console.log(`Successfully seeded ${[rep1, rep2, rep3, rep4, rep5, rep6, rep7, rep8, rep9, rep10].length} campus reports (including 2 Needs Review tickets)!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
