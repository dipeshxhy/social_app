import z from 'zod';

const addNewPostSchema = z.object({
  caption: z.string().trim().max(200, 'caption must be at most 200 characters'),
  image: z
    .string()
    .url('Invalid URL for image')
    .refine(
      (value) => ['image/jpeg', 'image/png', 'image/jpg'].includes(value),
      'Image must be in JPEG, PNG, or JPG format',
    ),
});

export { addNewPostSchema };
