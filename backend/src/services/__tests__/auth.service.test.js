const prisma = require('../../config/db');
const {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  login,
  changePassword,
} = require('../auth.service');

describe('auth.service', () => {
  let testAdminId;
  const testUsername = `testadmin_${Date.now()}`;
  const testPassword = 'Password123!';

  beforeAll(async () => {
    const passwordHash = await hashPassword(testPassword);
    const admin = await prisma.admin.create({
      data: {
        username: testUsername,
        passwordHash,
      },
    });
    testAdminId = admin.id;
  });

  afterAll(async () => {
    if (testAdminId) {
      await prisma.admin.delete({ where: { id: testAdminId } });
    }
    await prisma.$disconnect();
  });

  test('Password hashing and comparison with bcrypt cost factor 12', async () => {
    const hash = await hashPassword('SecurePass123');
    expect(hash).toMatch(/^\$2[aby]\$12\$/); // Verify bcrypt cost 12 prefix
    const isValid = await comparePassword('SecurePass123', hash);
    const isInvalid = await comparePassword('WrongPass', hash);
    expect(isValid).toBe(true);
    expect(isInvalid).toBe(false);
  });

  test('Valid credentials login -> returns signed JWT and admin payload', async () => {
    const result = await login(testUsername, testPassword, prisma);
    expect(result.token).toBeDefined();
    expect(result.expiresIn).toBe('8h');
    expect(result.admin.username).toBe(testUsername);
    expect(result.admin.id).toBe(testAdminId);

    // Verify token validity
    const decoded = verifyToken(result.token);
    expect(decoded.username).toBe(testUsername);
    expect(decoded.id).toBe(testAdminId);
  });

  test('Invalid password -> throws 401 with generic INVALID_CREDENTIALS error', async () => {
    await expect(login(testUsername, 'WrongPassword', prisma)).rejects.toMatchObject({
      statusCode: 401,
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid username or password',
    });
  });

  test('Non-existent username -> throws identical 401 generic error (no user enumeration)', async () => {
    await expect(login('non_existent_admin_user', 'AnyPassword', prisma)).rejects.toMatchObject({
      statusCode: 401,
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid username or password',
    });
  });

  test('Expired token -> verifyToken throws 401 with TOKEN_EXPIRED code', async () => {
    const expiredToken = generateToken({ id: testAdminId, username: testUsername }, '-1s');
    expect(() => verifyToken(expiredToken)).toThrow(
      expect.objectContaining({
        statusCode: 401,
        code: 'TOKEN_EXPIRED',
      })
    );
  });

  test('Invalid token signature -> throws 401 with INVALID_TOKEN code', () => {
    expect(() => verifyToken('invalid.token.string')).toThrow(
      expect.objectContaining({
        statusCode: 401,
        code: 'INVALID_TOKEN',
      })
    );
  });

  test('changePassword updates password correctly and rejects incorrect current password', async () => {
    // Incorrect current password
    await expect(
      changePassword(testAdminId, 'WrongCurrent', 'NewPass1234', prisma)
    ).rejects.toMatchObject({
      statusCode: 400,
      code: 'INVALID_CREDENTIALS',
    });

    // Valid change
    const updateResult = await changePassword(testAdminId, testPassword, 'NewPass1234', prisma);
    expect(updateResult.message).toBe('Password updated successfully');

    // Verify new password works and old password no longer works
    const newLogin = await login(testUsername, 'NewPass1234', prisma);
    expect(newLogin.token).toBeDefined();

    await expect(login(testUsername, testPassword, prisma)).rejects.toMatchObject({
      statusCode: 401,
    });
  });
});
