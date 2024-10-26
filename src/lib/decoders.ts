import { z } from 'zod';

export const questionDecoder = z.object({ name: z.string() });
