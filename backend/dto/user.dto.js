import { z } from 'zod';
import mongoose from 'mongoose';

const editUserSchema = z.object({
  bio: z.string().max(200, 'Bio must be at most 200 characters').optional(),
  gender: z
    .enum(['male', 'female', 'other', 'prefer not to say'], {
      errorMap: () => ({ message: 'Invalid gender value' }),
    })
    .optional(),
});

const userIdParamsSchema = z.object({
  id: z.string().refine((value) => mongoose.Types.ObjectId.isValid(value), {
    message: 'Invalid user id',
  }),
});

export { editUserSchema, userIdParamsSchema };
