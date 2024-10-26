<script lang="ts">
	import { AssemblyAI, type RealtimeTranscript } from 'assemblyai';
	import { onMount } from 'svelte';

	const client = new AssemblyAI({
		apiKey: '08299525b5064f8f98eaebaa2b5f8356'
	});

	const SAMPLE_RATE = 16_000;

	const transcriber = client.realtime.transcriber({
		sampleRate: SAMPLE_RATE
	});

	transcriber.on('open', ({ sessionId }) => {
		console.log(`Session opened with ID: ${sessionId}`);
	});

	transcriber.on('error', (error: Error) => {
		console.error('Error:', error);
	});

	transcriber.on('close', (code: number, reason: string) => {
		console.log('Session closed:', code, reason);
	});

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

	onMount(async () => {
		await transcriber.connect();
	});

	async function stopRecording() {
		await transcriber.close();
	}
</script>

<div>
	<button onclick={stopRecording}>STOP</button>
	<button>MUTE</button>
</div>
