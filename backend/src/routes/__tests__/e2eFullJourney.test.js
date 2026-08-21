const request = require('supertest');
const path = require('path');
const fs = require('fs');
const app = require('../../app');
const prisma = require('../../config/db');

describe('Full End-to-End System Journey (Phase 12 Verification)', () => {
  const testImagePath = path.join(__dirname, 'e2e-temp.jpg');
  let testDept;
  let testStream;
  let testBldg;
  let testRoom;
  let report1Id;
  let report3Id;
  let adminToken;

  beforeAll(async () => {
    fs.writeFileSync(testImagePath, Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]));

    let dept = await prisma.department.findFirst({ include: { streams: true } });
    if (!dept || dept.streams.length === 0) {
      dept = await prisma.department.create({
        data: {
          name: 'E2E Computer Science',
          streams: { create: [{ name: 'E2E Core' }] },
        },
        include: { streams: true },
      });
    }
    testDept = dept;
    testStream = dept.streams[0];

    let bldg = await prisma.building.findFirst({ include: { rooms: true } });
    if (!bldg || bldg.rooms.length === 0) {
      bldg = await prisma.building.create({
        data: {
          name: 'E2E Block Alpha',
          rooms: { create: [{ name: 'Lab 501' }] },
        },
        include: { rooms: true },
      });
    }
    testBldg = bldg;
    testRoom = bldg.rooms[0];
  });

  afterAll(async () => {
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
    if (report1Id || report3Id) {
      await prisma.reportStatusHistory.deleteMany({
        where: { reportId: { in: [report1Id, report3Id].filter(Boolean) } },
      });
      await prisma.reportReporter.deleteMany({
        where: { reportId: { in: [report1Id, report3Id].filter(Boolean) } },
      });
      await prisma.report.deleteMany({
        where: { id: { in: [report1Id, report3Id].filter(Boolean) } },
      });
    }
    await prisma.$disconnect();
  });

  test('Step 1: Public reference data fetch succeeds', async () => {
    const [deptRes, bldgRes] = await Promise.all([
      request(app).get('/api/v1/departments'),
      request(app).get('/api/v1/buildings'),
    ]);
    expect(deptRes.status).toBe(200);
    expect(bldgRes.status).toBe(200);
  });

  test('Step 2: Student submits initial fault report -> creates new ticket with count 1', async () => {
    const res = await request(app)
      .post('/api/v1/reports')
      .field('studentCode', '22CSE888')
      .field('department', testDept.name)
      .field('stream', testStream.name)
      .field('buildingId', testBldg.id)
      .field('roomId', testRoom.id)
      .field('deviceType', 'projector')
      .field('deviceNumber', 'PRJ-E2E-99')
      .field('deviceNumberVisible', 'true')
      .field('additionalNotes', 'Bulb flickering repeatedly')
      .attach('photo', testImagePath);

    expect(res.status).toBe(201);
    expect(res.body.data.isNewReport).toBe(true);
    expect(res.body.data.reportCount).toBe(1);
    report1Id = res.body.data.reportId;
  });

  test('Step 3: Duplicate submission for same device -> increments existing reportCount to 2', async () => {
    const res = await request(app)
      .post('/api/v1/reports')
      .field('studentCode', '22CSE889')
      .field('department', testDept.name)
      .field('stream', testStream.name)
      .field('buildingId', testBldg.id)
      .field('roomId', testRoom.id)
      .field('deviceType', 'projector')
      .field('deviceNumber', 'PRJ-E2E-99')
      .field('deviceNumberVisible', 'true')
      .field('additionalNotes', 'Second report on flickering projector')
      .attach('photo', testImagePath);

    expect(res.status).toBe(201);
    expect(res.body.data.isNewReport).toBe(false);
    expect(res.body.data.reportId).toBe(report1Id);
    expect(res.body.data.reportCount).toBe(2);
  });

  test('Step 4: Untagged fault report -> flagged for review with possibleDuplicate: true', async () => {
    const res = await request(app)
      .post('/api/v1/reports')
      .field('studentCode', '22CSE890')
      .field('department', testDept.name)
      .field('stream', testStream.name)
      .field('buildingId', testBldg.id)
      .field('roomId', testRoom.id)
      .field('deviceType', 'projector')
      .field('deviceNumberVisible', 'false')
      .field('additionalNotes', 'Projector not working, tag missing')
      .attach('photo', testImagePath);

    expect(res.status).toBe(201);
    expect(res.body.data.isPossibleDuplicate).toBe(true);
    report3Id = res.body.data.reportId;
  });

  test('Step 5: Admin authenticates and manages tickets', async () => {
    // 1. Login
    const loginRes = await request(app)
      .post('/api/v1/admin/login')
      .send({ username: 'admin', password: 'admin123' });
    expect(loginRes.status).toBe(200);
    adminToken = loginRes.body.data.token;

    // 2. Summary
    const summaryRes = await request(app)
      .get('/api/v1/admin/dashboard-summary')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(summaryRes.status).toBe(200);
    expect(summaryRes.body.data.open).toBeGreaterThanOrEqual(1);

    // 3. Merge flagged report into master report
    const mergeRes = await request(app)
      .post(`/api/v1/admin/reports/${report3Id}/merge`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ targetReportId: report1Id });
    expect(mergeRes.status).toBe(200);
    expect(mergeRes.body.data.newReportCount).toBe(3);

    // 4. Update status workflow: Open -> In Progress -> Resolved
    const inProgRes = await request(app)
      .patch(`/api/v1/admin/reports/${report1Id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'in_progress' });
    expect(inProgRes.status).toBe(200);
    expect(inProgRes.body.data.status).toBe('in_progress');

    const resolvedRes = await request(app)
      .patch(`/api/v1/admin/reports/${report1Id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'resolved' });
    expect(resolvedRes.status).toBe(200);
    expect(resolvedRes.body.data.status).toBe('resolved');

    // 5. Verify final audit trail
    const detailRes = await request(app)
      .get(`/api/v1/admin/reports/${report1Id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(detailRes.status).toBe(200);
    expect(detailRes.body.data.reporters.length).toBe(3);
    expect(detailRes.body.data.statusHistory.length).toBe(2);
  });
});
