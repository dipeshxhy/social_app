import { z } from 'zod';

const registerUserSchema = z.object({
  username: z.string().min(2, 'Name must be at least 2 characters'),

  email: z.string().email('Invalid email address'), // Built-in email validation

  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginUserSchema = z.object({
  email: z.email('invalid email address').trim().lowercase(),
  password: z.string().min(6, 'password must be at least 6 chars long'),
});
export { loginUserSchema, registerUserSchema };
