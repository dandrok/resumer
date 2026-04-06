import { z } from 'zod';

export const jobUrlSchema = z
  .string()
  .trim()
  .url('Enter a valid URL.')
  .refine((value) => value.startsWith('http://') || value.startsWith('https://'), {
    message: 'URL must start with http:// or https://',
  });
