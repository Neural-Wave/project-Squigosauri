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
