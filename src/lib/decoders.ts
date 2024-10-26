import { z } from 'zod';

export const questionDecoder = z.object({ name: z.string() });
export const questionsDecoder = z.object({ questions: z.array(z.string()) });
