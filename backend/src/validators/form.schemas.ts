import { z } from 'zod';

/** Sri Lankan mobile: 07XXXXXXXX, 947XXXXXXXX, or +947XXXXXXXX */
const sriLankaMobileRegex = /^(?:0|94|\+94)7\d{8}$/;

const mobileNumberSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s-]/g, ''))
  .refine((value) => sriLankaMobileRegex.test(value), {
    message:
      'Enter a valid Sri Lankan mobile number (e.g. 0771234567 or +94771234567)',
  });

export const createFormSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {
    message: 'Gender must be MALE, FEMALE, or OTHER',
  }),
  mobileNumber: mobileNumberSchema,
  address: z.string().trim().min(1, 'Address is required'),
  feedback: z.string().trim().optional(),
});

export const updateFormSchema = createFormSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field is required to update' }
);

export const listFormsQuerySchema = z.object({
  gender: z
    .enum(['MALE', 'FEMALE', 'OTHER'])
    .optional()
    .or(z.literal('').transform(() => undefined)),
  search: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() ? v.trim() : undefined)),
});
