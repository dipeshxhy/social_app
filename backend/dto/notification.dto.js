import { z } from 'zod';
import mongoose from 'mongoose';

const notificationParamsSchema = z.object({
  id: z.string().refine((value) => mongoose.Types.ObjectId.isValid(value), {
    message: 'Invalid notification id',
  }),
});

export { notificationParamsSchema };
