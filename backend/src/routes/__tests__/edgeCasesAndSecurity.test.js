const request = require('supertest');
const path = require('path');
const fs = require('fs');
const app = require('../../app');
const prisma = require('../../config/db');

describe('Edge Cases & Security Hardening (PRD §9 & Architecture §9)', () => {
  let authToken;
  let testBuildingId;
  let testRoomId;
  let otherBuildingId;
  let otherRoomId;

  const validImagePath = path.join(__dirname, 'valid-temp.jpg');
  const fakeMaliciousPath = path.join(__dirname, 'fake-script.jpg');
  const oversizedImagePath = path.join(__dirname, 'oversized-temp.jpg');

  beforeAll(async () => {
    // 1. Auth admin
    const loginRes = await request(app)
      .post('/api/v1/admin/login')
      .send({ username: 'admin', password: 'admin123' });
    authToken = loginRes.body.data.token;

    // 2. Create Building A and Building B with distinct rooms
    const bldgA = await prisma.building.create({
      data: {
        name: `SecBlock A ${Date.now()}`,
        rooms: { create: [{ name: 'Room A-101' }] },
      },
      include: { rooms: true },
    });
    testBuildingId = bldgA.id;
    testRoomId = bldgA.rooms[0].id;

    const bldgB = await prisma.building.create({
      data: {
        name: `SecBlock B ${Date.now()}`,
        rooms: { create: [{ name: 'Room B-201' }] },
      },
      include: { rooms: true },
    });
    otherBuildingId = bldgB.id;
    otherRoomId = bldgB.rooms[0].id;

    // 3. Create test files
    fs.writeFileSync(validImagePath, Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]));
    fs.writeFileSync(fakeMaliciousPath, Buffer.from('alert("malicious script");'));
    // 6MB buffer for oversized test (>5MB)
    const largeBuffer = Buffer.alloc(6 * 1024 * 1024);
    fs.writeFileSync(oversizedImagePath, largeBuffer);
  });

  afterAll(async () => {
    if (fs.existsSync(validImagePath)) fs.unlinkSync(validImagePath);
    if (fs.existsSync(fakeMaliciousPath)) fs.unlinkSync(fakeMaliciousPath);
    if (fs.existsSync(oversizedImagePath)) fs.unlinkSync(oversizedImagePath);

    if (testRoomId || otherRoomId) {
      const roomIds = [testRoomId, otherRoomId].filter(Boolean);
      const reportsToDelete = await prisma.report.findMany({
        where: { roomId: { in: roomIds } },
        select: { id: true },
      });
      const reportIds = reportsToDelete.map((r) => r.id);
      if (reportIds.length > 0) {
        await prisma.reportReporter.deleteMany({ where: { reportId: { in: reportIds } } });
        await prisma.reportStatusHistory.deleteMany({ where: { reportId: { in: reportIds } } });
        await prisma.report.deleteMany({ where: { id: { in: reportIds } } });
      }
      await prisma.room.deleteMany({ where: { id: { in: roomIds } } });
      await prisma.building.deleteMany({ where: { id: { in: [testBuildingId, otherBuildingId].filter(Boolean) } } });
    }
    await prisma.$disconnect();
  });

  test('Edge Case 1: Room ID does not belong to Building ID -> rejected with 400', async () => {
    // Pass Building A but Room from Building B
    const res = await request(app)
      .post('/api/v1/reports')
      .field('studentCode', '22CSE001')
      .field('department', 'Computer Science & Engineering')
      .field('stream', 'CSE Core')
      .field('buildingId', testBuildingId)
      .field('roomId', otherRoomId) // Mismatch!
      .field('deviceType', 'monitor')
      .field('deviceNumber', 'MON-SEC-01')
      .field('deviceNumberVisible', 'true')
      .attach('photo', validImagePath);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.message).toContain('Selected room does not exist in the selected building');
  });

  test('Edge Case 2: Malicious file disguised as image (MIME type mismatch) -> rejected with 400', async () => {
    const res = await request(app)
      .post('/api/v1/reports')
      .field('studentCode', '22CSE001')
      .field('department', 'Computer Science & Engineering')
      .field('stream', 'CSE Core')
      .field('buildingId', testBuildingId)
      .field('roomId', testRoomId)
      .field('deviceType', 'monitor')
      .field('deviceNumber', 'MON-SEC-02')
      .field('deviceNumberVisible', 'true')
      .attach('photo', fakeMaliciousPath, { contentType: 'application/javascript' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_FILE_TYPE');
  });

  test('Edge Case 3: Oversized photo (>5MB limit) -> rejected with 400 error', async () => {
    const res = await request(app)
      .post('/api/v1/reports')
      .field('studentCode', '22CSE001')
      .field('department', 'Computer Science & Engineering')
      .field('stream', 'CSE Core')
      .field('buildingId', testBuildingId)
      .field('roomId', testRoomId)
      .field('deviceType', 'monitor')
      .field('deviceNumber', 'MON-SEC-03')
      .field('deviceNumberVisible', 'true')
      .attach('photo', oversizedImagePath, { contentType: 'image/jpeg' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(['FILE_UPLOAD_ERROR', 'FILE_TOO_LARGE', 'VALIDATION_ERROR']).toContain(res.body.error.code);
  });

  test('Security 1: Helmet security headers are present on API responses', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(res.headers['strict-transport-security']).toBeDefined();
    expect(res.headers['content-security-policy']).toBeDefined();
  });

  test('Security 2: SQL Injection attempts in query parameters and fields are sanitized', async () => {
    const sqlInjectionSearch = "'; DROP TABLE reports; --";
    const res = await request(app)
      .get(`/api/v1/admin/reports?search=${encodeURIComponent(sqlInjectionSearch)}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify table still exists
    const count = await prisma.report.count();
    expect(typeof count).toBe('number');
  });

  test('Security 3: XSS payload in form fields is safely stored as text without injection', async () => {
    const xssNotes = '<script>alert("xss")</script>';
    const res = await request(app)
      .post('/api/v1/reports')
      .field('studentCode', '22CSE001')
      .field('department', 'Computer Science & Engineering')
      .field('stream', 'CSE Core')
      .field('buildingId', testBuildingId)
      .field('roomId', testRoomId)
      .field('deviceType', 'mouse')
      .field('deviceNumber', 'MOU-SEC-01')
      .field('deviceNumberVisible', 'true')
      .field('additionalNotes', xssNotes)
      .attach('photo', validImagePath);

    expect(res.status).toBe(201);
    expect(res.body.data.reportId).toBeDefined();

    // Verify stored safely as text
    const saved = await prisma.report.findUnique({
      where: { id: res.body.data.reportId },
      include: { reporters: true },
    });
    expect(saved.reporters[0].notes).toBe(xssNotes);

    // Cleanup
    await prisma.reportReporter.deleteMany({ where: { reportId: res.body.data.reportId } });
    await prisma.report.delete({ where: { id: res.body.data.reportId } });
  });

  test('Security 4: Tampered JWT token is rejected with 401 UNAUTHORIZED', async () => {
    const tamperedToken = authToken + 'tampered';
    const res = await request(app)
      .get('/api/v1/admin/reports')
      .set('Authorization', `Bearer ${tamperedToken}`);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_TOKEN');
  });
});
