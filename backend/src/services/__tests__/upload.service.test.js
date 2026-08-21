const fs = require('fs');
const path = require('path');
const {
  validateFile,
  generateFilename,
  saveFile,
  deleteFile,
  getFileUrl,
  getUploadDir,
} = require('../upload.service');

describe('upload.service', () => {
  let createdFiles = [];

  afterEach(async () => {
    for (const filename of createdFiles) {
      await deleteFile(filename);
    }
    createdFiles = [];
  });

  test('generateFilename produces unique UUID names with valid extension', () => {
    const name1 = generateFilename('broken_pc.PNG');
    const name2 = generateFilename('broken_pc.PNG');
    expect(name1).not.toBe(name2);
    expect(name1).toMatch(/^[0-9a-f-]{36}\.png$/);
  });

  test('validateFile accepts valid images (JPEG, PNG, WebP) within 5MB', () => {
    const validFile = {
      mimetype: 'image/jpeg',
      size: 2 * 1024 * 1024,
      originalname: 'fault.jpg',
    };
    expect(() => validateFile(validFile)).not.toThrow();
  });

  test('validateFile rejects invalid MIME types', () => {
    const pdfFile = {
      mimetype: 'application/pdf',
      size: 1024,
      originalname: 'document.pdf',
    };
    expect(() => validateFile(pdfFile)).toThrow(
      expect.objectContaining({
        statusCode: 400,
        code: 'INVALID_FILE_TYPE',
      })
    );
  });

  test('validateFile rejects files larger than 5MB', () => {
    const hugeFile = {
      mimetype: 'image/png',
      size: 6 * 1024 * 1024, // 6MB > 5MB limit
      originalname: 'huge.png',
    };
    expect(() => validateFile(hugeFile)).toThrow(
      expect.objectContaining({
        statusCode: 400,
        code: 'FILE_TOO_LARGE',
      })
    );
  });

  test('saveFile writes buffer to disk with UUID filename and returns URL', async () => {
    const fakeBuffer = Buffer.from('fake image content');
    const file = {
      mimetype: 'image/webp',
      size: fakeBuffer.length,
      originalname: 'evidence.webp',
      buffer: fakeBuffer,
    };

    const saved = await saveFile(file);
    createdFiles.push(saved.filename);

    expect(saved.filename).toMatch(/^[0-9a-f-]{36}\.webp$/);
    expect(saved.url).toBe(`/uploads/${saved.filename}`);

    const filePath = path.join(getUploadDir(), saved.filename);
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toBe('fake image content');
  });

  test('deleteFile removes file from disk safely', async () => {
    const file = {
      mimetype: 'image/jpeg',
      size: 10,
      originalname: 'temp.jpg',
      buffer: Buffer.from('temp data'),
    };

    const saved = await saveFile(file);
    const filePath = path.join(getUploadDir(), saved.filename);
    expect(fs.existsSync(filePath)).toBe(true);

    const deleted = await deleteFile(saved.filename);
    expect(deleted).toBe(true);
    expect(fs.existsSync(filePath)).toBe(false);
  });

  test('getFileUrl formats clean path preventing path traversal', () => {
    expect(getFileUrl('../../../etc/passwd')).toBe('/uploads/passwd');
    expect(getFileUrl('photo-123.jpg')).toBe('/uploads/photo-123.jpg');
  });
});
