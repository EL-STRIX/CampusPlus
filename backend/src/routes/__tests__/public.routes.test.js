const request = require('supertest');
const path = require('path');
const fs = require('fs');
const app = require('../../app');
const prisma = require('../../config/db');

describe('Public API Endpoints', () => {
  let testBuildingId;
  let testRoomId;
  let testDeptName;
  let testStreamName;
  const tempTestImagePath = path.join(__dirname, 'test-image.jpg');

  beforeAll(async () => {
    // Create dummy image buffer for multipart test
    fs.writeFileSync(tempTestImagePath, Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]));

    // Fetch or create test building & department
    let bldg = await prisma.building.findFirst({ include: { rooms: true } });
    if (!bldg || bldg.rooms.length === 0) {
      bldg = await prisma.building.create({
        data: {
          name: 'Test Block X',
          rooms: { create: [{ name: 'Lab X-101' }] },
        },
        include: { rooms: true },
      });
    }
    testBuildingId = bldg.id;
    testRoomId = bldg.rooms[0].id;

    let dept = await prisma.department.findFirst({ include: { streams: true } });
    if (!dept || dept.streams.length === 0) {
      dept = await prisma.department.create({
        data: {
          name: 'Test Department CS',
          streams: { create: [{ name: 'Test Stream Core' }] },
        },
        include: { streams: true },
      });
    }
    testDeptName = dept.name;
    testStreamName = dept.streams[0].name;
  });

  afterAll(async () => {
    if (fs.existsSync(tempTestImagePath)) {
      fs.unlinkSync(tempTestImagePath);
    }
    await prisma.$disconnect();
  });

  test('GET /api/v1/departments returns 200 with nested streams', async () => {
    const res = await request(app).get('/api/v1/departments');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].streams).toBeDefined();
    expect(Array.isArray(res.body.data[0].streams)).toBe(true);
  });

  test('GET /api/v1/buildings returns 200 with nested rooms', async () => {
    const res = await request(app).get('/api/v1/buildings');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].rooms).toBeDefined();
    expect(Array.isArray(res.body.data[0].rooms)).toBe(true);
  });

  test('POST /api/v1/reports with valid multipart data returns 201 and creates report', async () => {
    const res = await request(app)
      .post('/api/v1/reports')
      .field('studentCode', '22CSE999')
      .field('department', testDeptName)
      .field('stream', testStreamName)
      .field('yearSemester', '3rd Year')
      .field('buildingId', testBuildingId)
      .field('roomId', testRoomId)
      .field('deviceType', 'monitor')
      .field('deviceNumber', 'MON-TEST-99')
      .field('deviceNumberVisible', 'true')
      .field('additionalNotes', 'No display signal')
      .attach('photo', tempTestImagePath);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.reportId).toBeDefined();
    expect(res.body.data.isNewReport).toBe(true);
    expect(res.body.data.reportCount).toBe(1);

    // Clean up created test report
    await prisma.reportReporter.deleteMany({ where: { reportId: res.body.data.reportId } });
    await prisma.report.delete({ where: { id: res.body.data.reportId } });
  });

  test('POST /api/v1/reports with missing photo returns 400 validation error', async () => {
    const res = await request(app)
      .post('/api/v1/reports')
      .field('studentCode', '22CSE999')
      .field('department', testDeptName)
      .field('stream', testStreamName)
      .field('buildingId', testBuildingId)
      .field('roomId', testRoomId)
      .field('deviceType', 'monitor')
      .field('deviceNumber', 'MON-TEST-99')
      .field('deviceNumberVisible', 'true');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('POST /api/v1/reports with missing deviceNumber when visible=true returns 400', async () => {
    const res = await request(app)
      .post('/api/v1/reports')
      .field('studentCode', '22CSE999')
      .field('department', testDeptName)
      .field('stream', testStreamName)
      .field('buildingId', testBuildingId)
      .field('roomId', testRoomId)
      .field('deviceType', 'monitor')
      .field('deviceNumberVisible', 'true')
      .attach('photo', tempTestImagePath);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.message).toContain('Device number is required');
  });

  test('POST /api/v1/reports with visible=false succeeds without deviceNumber', async () => {
    const res = await request(app)
      .post('/api/v1/reports')
      .field('studentCode', '22CSE999')
      .field('department', testDeptName)
      .field('stream', testStreamName)
      .field('buildingId', testBuildingId)
      .field('roomId', testRoomId)
      .field('deviceType', 'fan')
      .field('deviceNumberVisible', 'false')
      .attach('photo', tempTestImagePath);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isPossibleDuplicate).toBe(true);

    // Clean up
    await prisma.reportReporter.deleteMany({ where: { reportId: res.body.data.reportId } });
    await prisma.report.delete({ where: { id: res.body.data.reportId } });
  });
});
