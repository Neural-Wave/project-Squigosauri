import { initializeApp } from 'firebase/app';
import type { PageLoad } from './$types';
import { firebaseConfig } from '$lib/firebase';
import { collection, doc, getDoc, getDocs, getFirestore, query, where } from 'firebase/firestore';
import { jobDecoder } from '$lib/decoders';
import { randomElement } from '$lib/utils';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';

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

	const skillQuestionsURLMap: Record<string, string> = {};

	for await (const skillQuestion of [...softSkillQuestions, ...hardSkillQuestions]) {
		const { question } = skillQuestion;
		const questionId = await getQuestionId(question);

		skillQuestionsURLMap[question] = await getQuestionDownloadURLFromId(questionId);
	}

	let encodeUrl = new URLSearchParams({ question: `Hi, ${name}` });
	const greetingAudio = await fetch(`/dynamicTTS?${encodeUrl.toString()}`, {
		method: 'GET'
	});
	const greetingArrayBuffer = await greetingAudio.arrayBuffer();

	encodeUrl = new URLSearchParams({
		question: `Thanks for diving into all those skill assessment questions with me! Before we continue, how do you feel about the location in ${job.location}? Does it work for you?`
	});
	const locationAudio = await fetch(`/dynamicTTS?${encodeUrl.toString()}`, {
		method: 'GET'
	});
	const locationArrayBuffer = await locationAudio.arrayBuffer();

	const initialAckURL = await getDownloadURL(
		ref(storage, `acks/${randomElement((await getDocs(collection(db, 'acks'))).docs).id}.mp3`)
	);

	const greetingURL = await getQuestionDownloadURLFromId('Ql7iRAdQt3QgSJ4umPnv');
	const diplomaURL = await getQuestionDownloadURLFromId('UpA402IkN24tpcTxyssA');
	const transitionURL = await getQuestionDownloadURLFromId('rLZp9uq8fxlDJytPWojX');
	const salaryURL = await getQuestionDownloadURLFromId('V8Gnhud3yTZybDFA3MpB');
	const lastQuestionURL = await getQuestionDownloadURLFromId('8GGE1Q7Hzd4rEAwZgbYz');
	const byeByeURL = await getQuestionDownloadURLFromId('jFhS1L9h4kQjaOq0MLjA');

	return {
		job,
		skillQuestionsIdMap: skillQuestionsURLMap,
		prefetchedAudio: {
			greeting: greetingArrayBuffer,
			location: locationArrayBuffer
		},
		questionsURL: {
			...skillQuestionsURLMap
		},
		customQuestionURL: {
			initial: initialAckURL,
			greeting: greetingURL,
			diploma: diplomaURL,
			transition: transitionURL,
			salary: salaryURL,
			lastQuestion: lastQuestionURL,
			byeBye: byeByeURL
		}
	};
};
