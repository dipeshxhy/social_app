import { z } from 'zod';
import mongoose from 'mongoose';

const storyParamsSchema = z.object({
  id: z.string().refine((value) => mongoose.Types.ObjectId.isValid(value), {
    message: 'Invalid story id',
  }),
});

export { storyParamsSchema };