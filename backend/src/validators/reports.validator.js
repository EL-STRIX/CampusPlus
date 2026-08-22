const { z } = require('zod');

const DEVICE_TYPES = [
  'fan',
  'light',
  'ac',
  'projector',
  'monitor',
  'keyboard',
  'mouse',
  'cpu',
  'ups',
  'ethernet_cable',
  'hdmi_cable',
  'other_cable',
  'other',
];

const createReportSchema = z
  .object({
    studentCode: z
      .string({ required_error: 'Student code is required' })
      .trim()
      .min(2, 'Student code is too short')
      .max(30, 'Student code is too long'),
    department: z
      .string({ required_error: 'Department is required' })
      .trim()
      .min(1, 'Department is required'),
    stream: z
      .string({ required_error: 'Stream is required' })
      .trim()
      .min(1, 'Stream is required'),
    labType: z.string().trim().max(100).optional().nullable(),
    yearSemester: z.string().trim().max(30).optional().nullable(),
    buildingId: z
      .string({ required_error: 'Building ID is required' })
      .uuid('Invalid building ID format'),
    roomId: z
      .string({ required_error: 'Room ID is required' })
      .uuid('Invalid room ID format'),
    deviceType: z.enum(DEVICE_TYPES, {
      errorMap: () => ({
        message: `Device type must be one of: ${DEVICE_TYPES.join(', ')}`,
      }),
    }),
    deviceNumber: z.string().trim().max(50).optional().nullable(),
    deviceNumberVisible: z
      .union([z.boolean(), z.string()])
      .transform((val) => {
        if (typeof val === 'boolean') return val;
        if (typeof val === 'string') return val.toLowerCase() === 'true';
        return false;
      }),
    additionalNotes: z
      .string()
      .trim()
      .max(500, 'Additional notes must be under 500 characters')
      .optional()
      .nullable(),
  })
  .refine(
    (data) => {
      // If deviceNumberVisible is true, deviceNumber is required and cannot be empty
      if (data.deviceNumberVisible) {
        return Boolean(data.deviceNumber && data.deviceNumber.trim().length > 0);
      }
      return true;
    },
    {
      message: 'Device number is required when number is visible',
      path: ['deviceNumber'],
    }
  );

module.exports = {
  DEVICE_TYPES,
  createReportSchema,
};
