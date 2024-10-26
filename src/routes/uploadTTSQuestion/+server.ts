import { ElevenLabsClient } from 'elevenlabs';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '$lib/firebase.js';
import { getStorage, listAll, ref, uploadBytes } from 'firebase/storage';
import { z } from 'zod';
import { addDoc, collection, getDocs, getFirestore } from 'firebase/firestore';
import { questionDecoder } from '$lib/decoders';

export async function POST({ request }) {
	const { questions } = z.object({ questions: z.array(z.string()) }).parse(await request.json());

	initializeApp(firebaseConfig);
	const storage = getStorage();
	const db = getFirestore();

	const currentQuestions = (await getDocs(collection(db, 'questions'))).docs.map(
		(doc) => questionDecoder.parse(doc.data()).name
	);

	const elevenlabs = new ElevenLabsClient({
		apiKey: 'sk_2bf5abb69dcea64190b2f72f0435ee100650a6a3b95bc795'
	});

	for (const question of questions.filter((question) => !currentQuestions.includes(question))) {
		const audioStream = await elevenlabs.generate({
			stream: true,
			voice: 'Jessica',
			text: question,
			model_id: 'eleven_multilingual_v2'
		});

		const chunks: Buffer[] = [];
		for await (const chunk of audioStream) {
			chunks.push(chunk);
		}
		const content = Buffer.concat(chunks);

		const savedQuestion = await addDoc(collection(db, 'questions'), { name: question });

		uploadBytes(ref(storage, `questions/${savedQuestion.id}.mp3`), content, {
			contentType: 'audio/mpeg'
		});
	}

	return new Response();
}
