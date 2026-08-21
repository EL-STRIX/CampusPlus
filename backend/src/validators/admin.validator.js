const { z } = require('zod');

const loginSchema = z.object({
  username: z.string({ required_error: 'Username is required' }).trim().min(1, 'Username is required'),
  password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
});

const updateStatusSchema = z
  .object({
    status: z.enum(['open', 'in_progress', 'resolved', 'rejected'], {
      errorMap: () => ({
        message: "Status must be one of: 'open', 'in_progress', 'resolved', 'rejected'",
      }),
    }),
    rejectionReason: z.string().trim().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.status === 'rejected') {
        return Boolean(data.rejectionReason && data.rejectionReason.trim().length > 0);
      }
      return true;
    },
    {
      message: "rejectionReason is required when status is 'rejected'",
      path: ['rejectionReason'],
    }
  );

const mergeReportSchema = z.object({
  targetReportId: z.string({ required_error: 'targetReportId is required' }).uuid('Invalid targetReportId format'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string({ required_error: 'Current password is required' }).min(1, 'Current password is required'),
  newPassword: z
    .string({ required_error: 'New password is required' })
    .min(8, 'New password must be at least 8 characters long')
    .regex(/\d/, 'New password must contain at least 1 number'),
});

module.exports = {
  loginSchema,
  updateStatusSchema,
  mergeReportSchema,
  changePasswordSchema,
};
