<script lang="ts">
	import { page } from '$app/stores';
	import { type RealtimeTranscript } from 'assemblyai';
	import { RealtimeTranscriber } from 'assemblyai/streaming';
	import { onMount } from 'svelte';

	const SAMPLE_RATE = 16_000;

	const { token } = $page.data;

	function mergeBuffers(lhs: Int16Array, rhs: Int16Array) {
		const mergedBuffer = new Int16Array(lhs.length + rhs.length);
		mergedBuffer.set(lhs, 0);
		mergedBuffer.set(rhs, lhs.length);
		return mergedBuffer;
	}

	let stream: MediaStream;
	let transcriber: RealtimeTranscriber;
	let audioBufferQueue = new Int16Array(0);

	onMount(async () => {
		transcriber = new RealtimeTranscriber({ token, sampleRate: SAMPLE_RATE });

		transcriber.on('transcript', (transcript: RealtimeTranscript) => {
			if (!transcript.text) {
				return;
			}

			if (transcript.message_type === 'PartialTranscript') {
				console.log('Partial:', transcript.text);
			} else {
				console.log('Final:', transcript.text);
			}
		});

		await transcriber.connect();

		stream = await navigator.mediaDevices.getUserMedia({
			audio: true
		});

		const audioContext = new AudioContext({
			sampleRate: SAMPLE_RATE,
			latencyHint: 'balanced'
		});

		const source = audioContext.createMediaStreamSource(stream);

		await audioContext.audioWorklet.addModule('/src/lib/audio-processor.js');
		const audioWorkletNode = new AudioWorkletNode(audioContext, 'audio-processor');

		source.connect(audioWorkletNode);
		audioWorkletNode.connect(audioContext.destination);

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
	});

	function toggleAudio() {
		const [audioTrack] = stream.getAudioTracks();
		if (audioTrack) {
			audioTrack.enabled = !audioTrack.enabled;
		}
	}

	async function stopRecording() {
		await transcriber.close();
	}
</script>

<div>
	<button onclick={stopRecording}>STOP</button>
	<button onclick={toggleAudio}>MUTE</button>
</div>
