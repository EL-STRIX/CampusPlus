const request = require('supertest');
const app = require('../../app');
const prisma = require('../../config/db');

describe('Admin API Endpoints', () => {
  let authToken;
  let adminId;
  let testBuildingId;
  let testRoomId;
  let testReportId;
  let testReportId2;
  const adminUsername = 'admin';
  const adminPassword = 'admin123';

  beforeAll(async () => {
    // 1. Authenticate as seeded dev admin
    const loginRes = await request(app)
      .post('/api/v1/admin/login')
      .send({ username: adminUsername, password: adminPassword });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.data.token).toBeDefined();
    authToken = loginRes.body.data.token;
    adminId = loginRes.body.data.admin.id;

    // 2. Fetch or create test building and room
    let bldg = await prisma.building.findFirst({ include: { rooms: true } });
    if (!bldg || bldg.rooms.length === 0) {
      bldg = await prisma.building.create({
        data: {
          name: 'Admin Test Block',
          rooms: { create: [{ name: 'Admin Room 1' }] },
        },
        include: { rooms: true },
      });
    }
    testBuildingId = bldg.id;
    testRoomId = bldg.rooms[0].id;

    // 3. Create test report 1 (open)
    const report1 = await prisma.report.create({
      data: {
        deviceType: 'keyboard',
        deviceNumber: 'KB-ADM-01',
        deviceNumberVisible: true,
        buildingId: testBuildingId,
        roomId: testRoomId,
        photoUrl: '/uploads/test_kb.jpg',
        reportCount: 1,
        status: 'open',
        reporters: {
          create: [
            {
              studentCode: '22CSE001',
              department: 'Computer Science',
              stream: 'CSE Core',
              notes: 'Key cap broken',
            },
          ],
        },
      },
    });
    testReportId = report1.id;

    // 4. Create test report 2 (flagged for review)
    const report2 = await prisma.report.create({
      data: {
        deviceType: 'keyboard',
        deviceNumber: null,
        deviceNumberVisible: false,
        buildingId: testBuildingId,
        roomId: testRoomId,
        photoUrl: '/uploads/test_kb2.jpg',
        reportCount: 1,
        possibleDuplicate: true,
        suggestedMatchIds: [report1.id],
        status: 'open',
        reporters: {
          create: [
            {
              studentCode: '22CSE002',
              department: 'Computer Science',
              stream: 'CSE Core',
              notes: 'Another broken keyboard',
            },
          ],
        },
      },
    });
    testReportId2 = report2.id;
  });

  afterAll(async () => {
    if (testReportId || testReportId2) {
      await prisma.reportStatusHistory.deleteMany({
        where: { reportId: { in: [testReportId, testReportId2] } },
      });
      await prisma.reportReporter.deleteMany({
        where: { reportId: { in: [testReportId, testReportId2] } },
      });
      await prisma.report.deleteMany({
        where: { id: { in: [testReportId, testReportId2] } },
      });
    }
    await prisma.$disconnect();
  });

  test('POST /api/v1/admin/login returns JWT token', async () => {
    const res = await request(app)
      .post('/api/v1/admin/login')
      .send({ username: adminUsername, password: adminPassword });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.admin.username).toBe(adminUsername);
  });

  test('Protected routes reject requests without token with 401', async () => {
    const res = await request(app).get('/api/v1/admin/reports');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  test('GET /api/v1/admin/dashboard-summary returns summary counts', async () => {
    const res = await request(app)
      .get('/api/v1/admin/dashboard-summary')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.open).toBeGreaterThanOrEqual(1);
    expect(res.body.data.needsReview).toBeGreaterThanOrEqual(1);
    expect(typeof res.body.data.resolved).toBe('number');
  });

  test('GET /api/v1/admin/reports lists reports with pagination and filtering', async () => {
    const res = await request(app)
      .get('/api/v1/admin/reports?status=open&page=1&limit=10')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.reports)).toBe(true);
    expect(res.body.data.pagination).toBeDefined();
    expect(res.body.data.pagination.page).toBe(1);
  });

  test('GET /api/v1/admin/reports/:id returns single report detail with reporters and history', async () => {
    const res = await request(app)
      .get(`/api/v1/admin/reports/${testReportId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(testReportId);
    expect(res.body.data.reporters.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.buildingName).toBeDefined();
    expect(res.body.data.roomName).toBeDefined();
  });

  test('PATCH /api/v1/admin/reports/:id/status updates status and records history', async () => {
    // 1. Update to in_progress
    const res = await request(app)
      .patch(`/api/v1/admin/reports/${testReportId}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'in_progress' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('in_progress');

    // Verify status history recorded
    const history = await prisma.reportStatusHistory.findMany({
      where: { reportId: testReportId },
    });
    expect(history.length).toBeGreaterThanOrEqual(1);
    expect(history[0].status).toBe('in_progress');
    expect(history[0].changedBy).toBe(adminId);
  });

  test('PATCH /api/v1/admin/reports/:id/status rejecting without reason returns 400', async () => {
    const res = await request(app)
      .patch(`/api/v1/admin/reports/${testReportId}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'rejected' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.message).toContain('rejectionReason is required');
  });

  test('PATCH /api/v1/admin/reports/:id/status rejecting with reason succeeds', async () => {
    const res = await request(app)
      .patch(`/api/v1/admin/reports/${testReportId}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'rejected', rejectionReason: 'Device replaced with new unit' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('rejected');
    expect(res.body.data.rejectionReason).toBe('Device replaced with new unit');
  });

  test('GET /api/v1/admin/reports/needs-review returns flagged reports with suggested matches', async () => {
    const res = await request(app)
      .get('/api/v1/admin/reports/needs-review')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    const item = res.body.data.find((r) => r.id === testReportId2);
    expect(item).toBeDefined();
    expect(item.suggestedMatches).toBeDefined();
  });

  test('POST /api/v1/admin/reports/:id/merge moves reporters and updates count', async () => {
    const res = await request(app)
      .post(`/api/v1/admin/reports/${testReportId2}/merge`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ targetReportId: testReportId });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.mergedInto).toBe(testReportId);

    // Verify in database: target report now has 2 reporters
    const target = await prisma.report.findUnique({
      where: { id: testReportId },
      include: { reporters: true },
    });
    expect(target.reporters.length).toBe(2);

    // Verify source report marked merged
    const source = await prisma.report.findUnique({ where: { id: testReportId2 } });
    expect(source.mergedInto).toBe(testReportId);
  });
});
