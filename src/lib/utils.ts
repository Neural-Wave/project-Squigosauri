import type { RealtimeTranscriber } from 'assemblyai';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from './firebase';
import { collection, doc, getDoc, getDocs, getFirestore } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';

export const randomElement = <T>(items: T[]) => items[Math.floor(Math.random() * items.length)];

export async function playAudio(buffer: ArrayBuffer, onPlaybackEnd?: () => void) {
	const audioContext = new AudioContext();
	const audioBuffer = await audioContext.decodeAudioData(buffer);

	const source = audioContext.createBufferSource();
	source.buffer = audioBuffer;

	source.connect(audioContext.destination);

	source.onended = () => {
		if (onPlaybackEnd) {
			onPlaybackEnd();
		}
	};

	source.start();
}

export function mergeBuffers(lhs: Int16Array, rhs: Int16Array) {
	const mergedBuffer = new Int16Array(lhs.length + rhs.length);
	mergedBuffer.set(lhs, 0);
	mergedBuffer.set(rhs, lhs.length);
	return mergedBuffer;
}

export async function transcribeMediaStream(transcriber: RealtimeTranscriber, stream: MediaStream) {
	const audioContext = new AudioContext({
		sampleRate: 16_000,
		latencyHint: 'balanced'
	});

	const source = audioContext.createMediaStreamSource(stream);

	await audioContext.audioWorklet.addModule('/src/lib/audio-processor.js');
	const audioWorkletNode = new AudioWorkletNode(audioContext, 'audio-processor');

	source.connect(audioWorkletNode);
	audioWorkletNode.connect(audioContext.destination);

	let audioBufferQueue = new Int16Array(0);

	audioWorkletNode.port.onmessage = (event) => {
		const currentBuffer = new Int16Array(event.data.audio_data);
		audioBufferQueue = mergeBuffers(audioBufferQueue, currentBuffer);

		const bufferDuration = (audioBufferQueue.length / audioContext.sampleRate) * 1000;

		if (bufferDuration >= 100) {
			const totalSamples = Math.floor(audioContext.sampleRate * 0.1);

			const finalBuffer = new Uint8Array(audioBufferQueue.subarray(0, totalSamples).buffer);

			audioBufferQueue = audioBufferQueue.subarray(totalSamples);
			transcriber.sendAudio(finalBuffer);
		}
	};
}

export async function getRandomAck() {
	initializeApp(firebaseConfig);

	const db = getFirestore();
	const storage = getStorage();

	const id = randomElement((await getDocs(collection(db, 'acks'))).docs).id;
	return {
		url: await getDownloadURL(ref(storage, `acks/${id}.mp3`)),
		text: (await getDoc(doc(db, 'acks', id))).data()?.name
	};
}
