import { z } from 'zod';
import mongoose from 'mongoose';

const addNewPostSchema = z.object({
  caption: z
    .string()
    .trim()
    .max(200, 'Caption must be at most 200 characters')
    .optional(),
});

const addCommentSchema = z.object({
  text: z.string().trim().min(1, 'Comment cannot be empty').max(300, 'Comment must be at most 300 characters'),
});

const objectIdSchema = z.object({
  id: z.string().refine((value) => mongoose.Types.ObjectId.isValid(value), {
    message: 'Invalid ObjectId',
  }),
});

export { addCommentSchema, addNewPostSchema, objectIdSchema };
