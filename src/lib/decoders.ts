import { z } from 'zod';

export const questionDecoder = z.object({ name: z.string() });
export const questionsDecoder = z.object({ questions: z.array(z.string()) });

export const ackDecoder = z.object({ name: z.string() });
export const acksDecoder = z.object({ acks: z.array(z.string()) });

export const skillsDecoder = z.object({
	softSkills: z.array(
		z.object({
			skill: z.string(),
			questions: z.array(z.string())
		})
	),
	hardSkills: z.array(
		z.object({
			skill: z.string(),
			questions: z.array(z.string())
		})
	)
});

export const jobDecoder = z.object({
	jobTitle: z.string(),
	text: z.string(),
	company: z.string(),
	salary: z.string(),
	startDate: z.string(),
	location: z.string(),
	seniority: z.string(),
	softSkills: z.array(z.string()),
	hardSkills: z.array(z.string()),
	questions: z.optional(skillsDecoder)
});
