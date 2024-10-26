import { ElevenLabsClient } from 'elevenlabs';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '$lib/firebase.js';
import { getStorage, listAll, ref, uploadBytes } from 'firebase/storage';
import { z } from 'zod';

export async function POST({ request }) {
	const { questions } = z.object({ questions: z.array(z.string()) }).parse(await request.json());

	initializeApp(firebaseConfig);
	const storage = getStorage();

	const currentQuestions = (await listAll(ref(storage, 'questions'))).items.map(
		({ name }) => name.split('.')[0]
	);

	const elevenlabs = new ElevenLabsClient({
		apiKey: 'sk_2bf5abb69dcea64190b2f72f0435ee100650a6a3b95bc795'
	});

	for (const question of questions.filter((question) => !currentQuestions.includes(question))) {
		const audioStream = await elevenlabs.generate({
			stream: true,
			voice: 'Charlotte',
			text: question,
			model_id: 'eleven_multilingual_v2'
		});

		const chunks: Buffer[] = [];
		for await (const chunk of audioStream) {
			chunks.push(chunk);
		}
		const content = Buffer.concat(chunks);

		uploadBytes(ref(storage, `questions/${question}.mp3`), content, {
			contentType: 'audio/mpeg'
		});
	}

	return new Response();
}
