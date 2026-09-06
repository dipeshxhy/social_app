import { z } from 'zod';

const editUserSchema = z.object({
  bio: z.string().max(200, 'Bio must be at most 200 characters').optional(),
  gender: z
    .enum(['male', 'female', 'other', 'prefer not to say'], {
      errorMap: () => ({ message: 'Invalid gender value' }),
    })
    .optional(),
  profilePicture: z
    .string()
    .url('Invalid URL for profile picture')
    .refine(
      (value) => ['image/jpeg', 'image/png', 'image/jpg'].includes(value),
      'Image must be in JPEG, PNG, or JPG format',
    )
    .optional(),
});

export { editUserSchema };
