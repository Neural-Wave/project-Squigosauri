<script lang="ts">
	import OpenAI from 'openai';
	import { onMount } from 'svelte';

	const SILENCE_THRESHOLD = 10.0;
	const SILENCE_DURATION = 500;

	const openai = new OpenAI({
		apiKey:
			'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',
		dangerouslyAllowBrowser: true
	});

	let stream: MediaStream;
	let mediaRecorder: MediaRecorder;
	let audioContext: AudioContext;
	let analyser: AnalyserNode;

	let chunkId = 0;

	let noiseLevel = $state(0);

	function startRecording() {
		dataArray = new Uint8Array(analyser.frequencyBinCount);

		mediaRecorder.ondataavailable = (event) => {
			if (event.data.size > 0) currentChunk.push(event.data);
		};

		mediaRecorder.onstop = async () => {
			const blob = new File(
				[
					new Blob(currentChunk, {
						type: 'audio/webm'
					})
				],
				`${chunkId++}.mp3`
			);

			currentChunk = [];

			const text = await openai.audio.transcriptions.create({
				file: blob,
				model: 'whisper-1',
				language: 'en'
			});

			console.log(text);
		};

		mediaRecorder.start();
		processAudio();
	}

	function stopRecording() {
		if (mediaRecorder.state !== 'inactive') mediaRecorder.stop();
		if (audioContext.state !== 'closed') audioContext.close();
		if (animationController) cancelAnimationFrame(animationController);
	}

	onMount(async () => {
		stream = await navigator.mediaDevices.getUserMedia({
			audio: true
		});

		audioContext = new AudioContext();
		mediaRecorder = new MediaRecorder(stream);

		analyser = audioContext.createAnalyser();
		analyser.fftSize = 256;

		const source = audioContext.createMediaStreamSource(stream);
		source.connect(analyser);

		startRecording();
	});

	let silenceStart: number | null = null;
	let dataArray: Uint8Array;
	let currentChunk: Blob[] = [];
	let animationController: number | null = null;

	function processAudio() {
		analyser.getByteFrequencyData(dataArray);

		const averageVolume = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length;
		noiseLevel = averageVolume;

		if (averageVolume < SILENCE_THRESHOLD) {
			if (!silenceStart) silenceStart = Date.now();

			if (Date.now() - silenceStart >= SILENCE_DURATION) {
				mediaRecorder.stop();
				mediaRecorder.start();
				silenceStart = null;
			}
		} else {
			silenceStart = null;
		}

		animationController = requestAnimationFrame(processAudio);
	}

	function toggleAudio() {
		const [audioTrack] = stream.getAudioTracks();
		if (audioTrack) {
			audioTrack.enabled = !audioTrack.enabled;
		}
	}
</script>

<div>
	<button onclick={stopRecording}>STOP</button>
	<div>{noiseLevel}</div>
	<button onclick={toggleAudio}>MUTE</button>
</div>
