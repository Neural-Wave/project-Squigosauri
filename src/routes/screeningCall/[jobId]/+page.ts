import { initializeApp } from 'firebase/app';
import type { PageLoad } from './$types';
import { firebaseConfig } from '$lib/firebase';
import { collection, doc, getDoc, getDocs, getFirestore, query, where } from 'firebase/firestore';
import { jobDecoder } from '$lib/decoders';
import { randomElement } from '$lib/utils';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';
import type { InterviewData } from '$lib/proomp/prompts';

export type CallPageData = {
	job: InterviewData;
	prefetchedAudio: {
		greetingStart: { buffer: ArrayBuffer; text: string };
		location: { buffer: ArrayBuffer; text: string };
	};
	softSkillQuestions: Record<string, { url: string; skill: string }>;
	hardSkillQuestions: Record<string, { url: string; skill: string }>;
	customQuestionURL: {
		initialAck: { url: string; text: string };
		greetingEnd: { url: string; text: string };
		diploma: { url: string; text: string };
		transition: { url: string; text: string };
		salary: { url: string; text: string };
		lastQuestion: { url: string; text: string };
		byeBye: { url: string; text: string };
	};
};

initializeApp(firebaseConfig);
const db = getFirestore();
const storage = getStorage();

async function getQuestionId(question: string) {
	return (await getDocs(query(collection(db, 'questions'), where('name', '==', question)))).docs[0]
		.id;
}

async function getQuestionDownloadURLFromId(id: string) {
	return await getDownloadURL(ref(storage, `questions/${id}.mp3`));
}

async function getQuestionInfoFromId(id: string) {
	const url = await getQuestionDownloadURLFromId(id);
	const text = (await getDoc(doc(db, 'questions', id))).data()?.name;

	return { url, text };
}

export const load: PageLoad = async ({ params, fetch, url }) => {
	const { jobId } = params;
	const name = url.searchParams.get('name') ?? '';

	initializeApp(firebaseConfig);
	const db = getFirestore();
	const job = jobDecoder.parse((await getDoc(doc(db, 'job_offers', jobId))).data());

	const softSkillQuestions = (job.questions?.softSkills ?? []).map((softSkills) => ({
		skill: softSkills.skill,
		question: randomElement(softSkills?.questions)
	}));

	const hardSkillQuestions = (job.questions?.hardSkills ?? []).map((hardSkills) => ({
		skill: hardSkills.skill,
		question: randomElement(hardSkills?.questions)
	}));

	const softSkillQuestionsURLMap: Record<string, { url: string; skill: string }> = {};
	for await (const skillQuestion of softSkillQuestions) {
		const { question, skill } = skillQuestion;
		const questionId = await getQuestionId(question);

		softSkillQuestionsURLMap[question] = {
			url: await getQuestionDownloadURLFromId(questionId),
			skill
		};
	}

	const hardSkillQuestionsURLMap: Record<string, { url: string; skill: string }> = {};
	for await (const skillQuestion of hardSkillQuestions) {
		const { question, skill } = skillQuestion;
		const questionId = await getQuestionId(question);

		hardSkillQuestionsURLMap[question] = {
			url: await getQuestionDownloadURLFromId(questionId),
			skill
		};
	}

	const greetingText = `Hi, ${name}`;
	let encodeUrl = new URLSearchParams({ question: greetingText });
	const greetingAudio = await fetch(`/dynamicTTS?${encodeUrl.toString()}`, {
		method: 'GET'
	});
	const greetingArrayBuffer = await greetingAudio.arrayBuffer();
	const greetingStartQuestion = { buffer: greetingArrayBuffer, text: greetingText };

	const locationText = `Thanks for diving into all those skill assessment questions with me! Before we continue, how do you feel about the location in ${job.location}? Does it work for you?`;
	encodeUrl = new URLSearchParams({
		question: locationText
	});
	const locationAudio = await fetch(`/dynamicTTS?${encodeUrl.toString()}`, {
		method: 'GET'
	});
	const locationArrayBuffer = await locationAudio.arrayBuffer();
	const locationQuestion = { buffer: locationArrayBuffer, text: locationText };

	const initialAckId = randomElement((await getDocs(collection(db, 'acks'))).docs).id;
	const initialAckQuestion = {
		url: await getDownloadURL(ref(storage, `acks/${initialAckId}.mp3`)),
		text: (await getDoc(doc(db, 'acks', initialAckId))).data()?.name
	};

	const greetingQuestion = await getQuestionInfoFromId('Ql7iRAdQt3QgSJ4umPnv');
	const diplomaQuestion = await getQuestionInfoFromId('UpA402IkN24tpcTxyssA');
	const transitionQuestion = await getQuestionInfoFromId('rLZp9uq8fxlDJytPWojX');
	const salaryQuestion = await getQuestionInfoFromId('V8Gnhud3yTZybDFA3MpB');
	const lastQuestionQuestion = await getQuestionInfoFromId('8GGE1Q7Hzd4rEAwZgbYz');
	const byeByeQuestion = await getQuestionInfoFromId('jFhS1L9h4kQjaOq0MLjA');

	return {
		job: { ...job, id: jobId },
		prefetchedAudio: {
			greetingStart: greetingStartQuestion,
			location: locationQuestion
		},
		softSkillQuestions: softSkillQuestionsURLMap,
		hardSkillQuestions: hardSkillQuestionsURLMap,
		customQuestionURL: {
			initialAck: initialAckQuestion,
			greetingEnd: greetingQuestion,
			diploma: diplomaQuestion,
			transition: transitionQuestion,
			salary: salaryQuestion,
			lastQuestion: lastQuestionQuestion,
			byeBye: byeByeQuestion
		}
	} satisfies CallPageData;
};
