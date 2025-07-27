import { z } from 'zod';

export const profileFormSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  dob: z
    .string()
    .min(1, 'Date of Birth is required')
    .refine(
      (val) => {
        if (!val) return false;
        const inputDate = new Date(val);
        const today = new Date();
        inputDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        return inputDate <= today;
      },
      { message: 'Date of Birth cannot be in the future' }
    ),
  gender: z.string().optional(),
});
