const prisma = require('../../config/db');
const { processReportSubmission } = require('../duplicateMatching.service');

describe('duplicateMatching.service', () => {
  let testBuildingId;
  let testRoomId;

  beforeAll(async () => {
    // Create test building & room for test isolation
    const building = await prisma.building.create({
      data: {
        name: `Test Building ${Date.now()}`,
        rooms: {
          create: [{ name: `Test Room ${Date.now()}` }],
        },
      },
      include: { rooms: true },
    });
    testBuildingId = building.id;
    testRoomId = building.rooms[0].id;
  });

  afterAll(async () => {
    // Clean up test data
    if (testRoomId) {
      await prisma.reportReporter.deleteMany();
      await prisma.report.deleteMany({ where: { roomId: testRoomId } });
      await prisma.room.delete({ where: { id: testRoomId } });
    }
    if (testBuildingId) {
      await prisma.building.delete({ where: { id: testBuildingId } });
    }
    await prisma.$disconnect();
  });

  test('Case 1: No match -> creates new report with reportCount = 1 and possibleDuplicate = false', async () => {
    const payload = {
      studentCode: '22CSE101',
      department: 'Computer Science',
      stream: 'CSE Core',
      yearSemester: '3rd Year',
      buildingId: testBuildingId,
      roomId: testRoomId,
      deviceType: 'cpu',
      deviceNumber: 'CPU-TEST-001',
      deviceNumberVisible: true,
      photoUrl: 'https://example.com/photo1.jpg',
      additionalNotes: 'Power button stuck',
    };

    const result = await processReportSubmission(payload, prisma);

    expect(result.isNewReport).toBe(true);
    expect(result.isPossibleDuplicate).toBe(false);
    expect(result.reportCount).toBe(1);
    expect(result.reportId).toBeDefined();

    // Verify in database
    const savedReport = await prisma.report.findUnique({
      where: { id: result.reportId },
      include: { reporters: true },
    });
    expect(savedReport).not.toBeNull();
    expect(savedReport.deviceNumber).toBe('CPU-TEST-001');
    expect(savedReport.status).toBe('open');
    expect(savedReport.reporters).toHaveLength(1);
    expect(savedReport.reporters[0].studentCode).toBe('22CSE101');
    expect(savedReport.reporters[0].notes).toBe('Power button stuck');
  });

  test('Case 2: Exact match on room + deviceNumber -> increments reportCount and appends reporter', async () => {
    // Second submission by different student for same device in same room
    const payload2 = {
      studentCode: '22CSE102',
      department: 'Computer Science',
      stream: 'CSE Core',
      yearSemester: '3rd Year',
      buildingId: testBuildingId,
      roomId: testRoomId,
      deviceType: 'cpu',
      deviceNumber: 'CPU-TEST-001',
      deviceNumberVisible: true,
      photoUrl: 'https://example.com/photo2.jpg',
      additionalNotes: 'Won\'t boot at all',
    };

    const result = await processReportSubmission(payload2, prisma);

    expect(result.isNewReport).toBe(false);
    expect(result.isPossibleDuplicate).toBe(false);
    expect(result.reportCount).toBe(2);

    // Verify in database: reportCount = 2, 2 reporters attached
    const updatedReport = await prisma.report.findUnique({
      where: { id: result.reportId },
      include: { reporters: true },
    });
    expect(updatedReport.reportCount).toBe(2);
    expect(updatedReport.reporters).toHaveLength(2);
    expect(updatedReport.reporters.map((r) => r.studentCode)).toEqual(
      expect.arrayContaining(['22CSE101', '22CSE102'])
    );
  });

  test('Case 3: Device number NOT visible -> creates new report with possibleDuplicate = true and suggested matches', async () => {
    // A student reports another CPU in the same room, but number tag is missing
    const payloadInvisible = {
      studentCode: '22CSE103',
      department: 'Computer Science',
      stream: 'AI & Data Science',
      buildingId: testBuildingId,
      roomId: testRoomId,
      deviceType: 'cpu',
      deviceNumber: null,
      deviceNumberVisible: false,
      photoUrl: 'https://example.com/photo_tag_missing.jpg',
      additionalNotes: 'CPU near window not starting',
    };

    const result = await processReportSubmission(payloadInvisible, prisma);

    expect(result.isNewReport).toBe(true);
    expect(result.isPossibleDuplicate).toBe(true);
    expect(result.reportCount).toBe(1);
    expect(result.suggestedMatchIds).toBeDefined();
    expect(result.suggestedMatchIds.length).toBeGreaterThanOrEqual(1);

    // Verify in database: separate record created with possible_duplicate = true
    const saved = await prisma.report.findUnique({
      where: { id: result.reportId },
      include: { reporters: true },
    });
    expect(saved.possibleDuplicate).toBe(true);
    expect(saved.deviceNumberVisible).toBe(false);
    expect(saved.deviceNumber).toBeNull();
    expect(saved.reporters).toHaveLength(1);
  });

  test('Case 4: Match query excludes resolved and rejected reports (creates fresh record)', async () => {
    // 1. Create a resolved report on device "FAN-001"
    const resolvedReport = await prisma.report.create({
      data: {
        deviceType: 'fan',
        deviceNumber: 'FAN-001',
        deviceNumberVisible: true,
        buildingId: testBuildingId,
        roomId: testRoomId,
        photoUrl: 'https://example.com/fan_resolved.jpg',
        reportCount: 5,
        status: 'resolved',
      },
    });

    // 2. Submit a new report for "FAN-001"
    const newPayload = {
      studentCode: '22CSE104',
      department: 'Computer Science',
      stream: 'CSE Core',
      buildingId: testBuildingId,
      roomId: testRoomId,
      deviceType: 'fan',
      deviceNumber: 'FAN-001',
      deviceNumberVisible: true,
      photoUrl: 'https://example.com/fan_broken_again.jpg',
      additionalNotes: 'Making clicking noise again',
    };

    const result = await processReportSubmission(newPayload, prisma);

    // Must NOT increment resolved report; must create brand new report with count 1
    expect(result.isNewReport).toBe(true);
    expect(result.reportId).not.toBe(resolvedReport.id);
    expect(result.reportCount).toBe(1);

    // Verify resolved report is untouched
    const oldReport = await prisma.report.findUnique({ where: { id: resolvedReport.id } });
    expect(oldReport.reportCount).toBe(5);
    expect(oldReport.status).toBe('resolved');
  });

  test('Case 5: Service file contains zero Express dependencies', () => {
    const serviceModule = require('../duplicateMatching.service');
    expect(serviceModule.processReportSubmission).toBeDefined();
    // Verify no express imports in the file
    const fs = require('fs');
    const path = require('path');
    const fileContent = fs.readFileSync(
      path.join(__dirname, '../duplicateMatching.service.js'),
      'utf-8'
    );
    expect(fileContent).not.toContain("require('express')");
    expect(fileContent).not.toContain('require("express")');
    expect(fileContent).not.toContain('res.status');
    expect(fileContent).not.toContain('req.body');
  });
});
