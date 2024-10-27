import { z } from 'zod';

export const questionDecoder = z.object({ name: z.string() });
export const questionsDecoder = z.object({ questions: z.array(z.string()) });

export const ackDecoder = z.object({ name: z.string() });
export const acksDecoder = z.object({ acks: z.array(z.string()) });
