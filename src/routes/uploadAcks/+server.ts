import { ElevenLabsClient } from 'elevenlabs';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '$lib/firebase.js';
import { getStorage, ref, uploadBytes } from 'firebase/storage';
import { addDoc, collection, getDocs, getFirestore } from 'firebase/firestore';
import { ackDecoder, acksDecoder } from '$lib/decoders';

export async function POST({ request }) {
	const { acks } = acksDecoder.parse(await request.json());

	initializeApp(firebaseConfig);
	const storage = getStorage();
	const db = getFirestore();

	const currentAcks = (await getDocs(collection(db, 'acks'))).docs.map(
		(doc) => ackDecoder.parse(doc.data()).name
	);

	const elevenlabs = new ElevenLabsClient({
		apiKey: 'sk_2bf5abb69dcea64190b2f72f0435ee100650a6a3b95bc795'
	});

	for (const ack of acks.filter((ack) => !currentAcks.includes(ack))) {
		const audioStream = await elevenlabs.generate({
			stream: true,
			voice: 'Jessica',
			text: ack,
			model_id: 'eleven_multilingual_v2'
		});

		const chunks: Buffer[] = [];
		for await (const chunk of audioStream) {
			chunks.push(chunk);
		}
		const content = Buffer.concat(chunks);

		const savedAck = await addDoc(collection(db, 'acks'), { name: ack });

		uploadBytes(ref(storage, `acks/${savedAck.id}.mp3`), content, {
			contentType: 'audio/mpeg'
		});
	}

	return new Response();
}
