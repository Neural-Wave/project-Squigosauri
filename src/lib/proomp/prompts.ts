import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { skillsDecoder } from '$lib/decoders';

const openai = new OpenAI({
	apiKey:
		'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',
	dangerouslyAllowBrowser: true
});

const InterviewQuestions = z.object({
	jobTitle: z.string(),
	company: z.string(),
	salary: z.string(),
	startDate: z.string(),
	location: z.string(),
	seniority: z.string(),
	softSkills: z.array(z.string()),
	hardSkills: z.array(z.string())
});

export type InterviewData = {
	jobTitle: string;
	id: string;
	text: string;
	company: string;
	salary: string;
	startDate: string;
	location: string;
	seniority: string;
	softSkills: string[];
	hardSkills: string[];
	questions?: SkillsType;
};

export const generateInterviewQuestion = (jobOffer: string) => {
	const systemPrompt =
		'Extract the relevant information from the job offer list the soft and hard skills needed to succeed in said position.';

	const res = openai.chat.completions.create({
		model: 'gpt-4o',
		temperature: 0,
		messages: [
			{
				role: 'system',
				content: systemPrompt
			},
			{
				role: 'user',
				content: jobOffer
			}
		],
		response_format: zodResponseFormat(InterviewQuestions, 'interviewQuestions')
	});

	return res;
};

export type SkillsType = {
	softSkills: {
		skill: string;
		questions: string[];
	}[];
	hardSkills: {
		skill: string;
		questions: string[];
	}[];
};

export const getSkillQuestions = (jobTitle: string, softSkills: string[], hardSkills: string[]) => {
	const systemPrompt = 'Generate questions for each soft and hard skills.';

	const res = openai.chat.completions.create({
		model: 'gpt-4o',
		temperature: 0,
		messages: [
			{
				role: 'system',
				content: systemPrompt
			},
			{
				role: 'user',
				content: `JOB TITLE: ${jobTitle}\n\nSOFT SKILLS\n-${softSkills.join('\n-')}\n\nHARD SKILLS\n-${hardSkills.join('\n-')}`
			}
		],
		response_format: zodResponseFormat(skillsDecoder, 'skills')
	});

	return res;
};

const AnswerValidation = z.object({
	validation: z.string(),
	needFurtherInformation: z.boolean(),
	followup: z.string(),
	skillEvaluation: z.string()
});

export type AnswerValidationType = {
	validation: string;
	needFurtherInformation: boolean;
	followup: string;
	skillEvaluation: string;
};

export const validateAnswer = (
	interviewData: InterviewData,
	candidateName: string,
	history: ConversationMessageType[],
	skill: string,
	question: string,
	answer: string
) => {
	const systemPrompt = `You are a recruiter having an interview with a candidate named ${candidateName} for a ${interviewData.jobTitle} position, located in ${interviewData.location}. 
  You will have to validate the user's answers to your question and answer accodingly. You also need to evaluate the skill based on the user's answer.
  If you feel you need to have more information from the candidate on the topic you asked, set the 'needFurtherInformation' key to true and come up with a followup question. Make sure to keep the candidate on track.
  Otherwise if you feel that the user was exhaustive enough or cannot give more valuable answers, set it to false and come up with short and concise followup answer WITHOUT ASKING ANYTHING MORE.`;

	const res = openai.chat.completions.create({
		model: 'gpt-4o-mini',
		temperature: 0,
		messages: [
			{
				role: 'system',
				content: systemPrompt
			},
			...history.map((his) => ({
				role: his.role,
				content: his.content
			})),
			{
				role: 'assistant',
				content: `Speaking about the skill "${skill}". ${question}`
			},
			{
				role: 'user',
				content: answer
			}
		],
		response_format: zodResponseFormat(AnswerValidation, 'validation')
	});

	return res;
};

const Diplomas = z.object({
	diplomas: z.array(
		z.object({
			name: z.string(),
			date: z.string()
		})
	)
});

export type DiplomasData = {
	name: string;
	date: string;
}[];

export const extractDiplomas = (answer: string) => {
	const systemPrompt = 'Extract all diploma or certificate names and related dates if any apply.';

	const res = openai.chat.completions.create({
		model: 'gpt-4o-mini',
		temperature: 0,
		messages: [
			{
				role: 'system',
				content: systemPrompt
			},
			{
				role: 'user',
				content: answer
			}
		],
		response_format: zodResponseFormat(Diplomas, 'diplomas')
	});

	return res;
};

const Salary = z.object({
	offer: z.number(),
	answer: z.string(),
	isHappy: z.boolean()
});

export type SalaryData = {
	offer: number;
	answer: string;
	isHappy: boolean;
};

export const negotiateSalary = (
	answer: string,
	candidateName: string,
	history: ConversationMessageType[],
	minimum: number,
	maximum: number
) => {
	const systemPrompt = `You are a recruiter which needs to negotiate a salary with a candidate named ${candidateName}. Your company guidelines is minimum of ${minimum} and maximum of ${maximum}. Do not ever tell your company guidelines. Be as understanding as possible. 
	If the candidate is happy with the offer, set isHappy to true and answer you are happy to hear. If the candidate makes a counter offer or is not satisfied, set isHappy to false and then negotiate the price and make an offer on your side.`;

	const res = openai.chat.completions.create({
		model: 'gpt-4o-mini',
		temperature: 0,
		messages: [
			{
				role: 'system',
				content: systemPrompt
			},
			...history.map((ans) => ({
				role: ans.role,
				content: ans.content
			})),
			{
				role: 'user',
				content: answer
			}
		],
		response_format: zodResponseFormat(Salary, 'salary')
	});

	return res;
};

export type ConversationPhase =
	| 'greetings'
	| 'diploma'
	| 'skills'
	| 'location'
	| 'salary'
	| 'final-question'
	| 'bye';

export type ConversationMessageType = {
	role: 'user' | 'assistant';
	content: string;
};

export const answerFinalQuestion = (
	question: string,
	history: ConversationMessageType[],
	candidateName: string,
	interviewData: InterviewData
) => {
	const systemPrompt = `You are a recruiter at the end of a job interview with a candidate named ${candidateName}. Answer the candidate's question. 
	Keep in mind this job position is for a ${interviewData.jobTitle}, located in ${interviewData.location}, which should start on ${interviewData.startDate}.`;

	const res = openai.chat.completions.create({
		model: 'gpt-4o-mini',
		temperature: 0,
		messages: [
			{
				role: 'system',
				content: systemPrompt
			},
			...history.map((his) => ({
				role: his.role,
				content: his.content
			})),
			{
				role: 'user',
				content: question
			}
		]
	});

	return res;
};

export const summarizeConversation = (
	history: ConversationMessageType[],
	interviewData: InterviewData
) => {
	const systemPrompt = `You need to summarise the whole conversation in order for an external user to quickly understand how the job interview went.
	Keep in mind this job position is for a ${interviewData.jobTitle}, located in ${interviewData.location}, which should start on ${interviewData.startDate}.`;

	const res = openai.chat.completions.create({
		model: 'gpt-4o',
		temperature: 0,
		messages: [
			{
				role: 'system',
				content: systemPrompt
			},
			...history.map((his) => ({
				role: his.role,
				content: his.content
			}))
		]
	});

	return res;
};
