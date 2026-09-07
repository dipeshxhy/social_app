import { z } from 'zod';
import mongoose from 'mongoose';

const sendMessageSchema = z
  .object({
    message: z
      .string()
      .trim()
      .max(1000, 'Message must be at most 1000 characters')
      .optional(),
    postId: z
      .string()
      .refine((value) => mongoose.Types.ObjectId.isValid(value), {
        message: 'Invalid post id',
      })
      .optional(),
  })
  .refine((data) => data.message?.length || data.postId, {
    message: 'A message or a post to share is required',
  });

const messageParamsSchema = z.object({
  id: z.string().refine((value) => mongoose.Types.ObjectId.isValid(value), {
    message: 'Invalid conversation or user id',
  }),
});

export { messageParamsSchema, sendMessageSchema };
