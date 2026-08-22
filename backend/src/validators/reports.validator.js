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
    buildingName: z.string().trim().min(1, 'Building is required').optional().nullable(),
    building: z.string().trim().min(1, 'Building is required').optional().nullable(),
    buildingId: z.string().trim().optional().nullable(),
    roomName: z.string().trim().min(1, 'Room is required').optional().nullable(),
    room: z.string().trim().min(1, 'Room is required').optional().nullable(),
    roomId: z.string().trim().optional().nullable(),
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
      return Boolean(
        (data.buildingName && data.buildingName.trim().length > 0) ||
        (data.building && data.building.trim().length > 0) ||
        (data.buildingId && data.buildingId.trim().length > 0)
      );
    },
    {
      message: 'Building name or number is required',
      path: ['buildingName'],
    }
  )
  .refine(
    (data) => {
      return Boolean(
        (data.roomName && data.roomName.trim().length > 0) ||
        (data.room && data.room.trim().length > 0) ||
        (data.roomId && data.roomId.trim().length > 0)
      );
    },
    {
      message: 'Room number or identifier is required',
      path: ['roomName'],
    }
  )
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
