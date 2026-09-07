import { z } from 'zod';
import mongoose from 'mongoose';

const objectIdSchema = z.string().refine((value) => mongoose.Types.ObjectId.isValid(value), {
  message: 'Invalid id',
});

const adminUserIdParamSchema = z.object({
  id: objectIdSchema,
});

const adminPostIdParamSchema = z.object({
  id: objectIdSchema,
});

export { adminPostIdParamSchema, adminUserIdParamSchema };