<script lang="ts">
	import { onMount } from 'svelte';

	const SILENCE_THRESHOLD = 10.0;
	const SILENCE_DURATION = 500;

	let stream: MediaStream;
	let mediaRecorder: MediaRecorder;
	let audioContext: AudioContext;
	let analyser: AnalyserNode;

	function startRecording() {
		dataArray = new Uint8Array(analyser.frequencyBinCount);

		mediaRecorder.ondataavailable = (event) => {
			if (event.data.size > 0) currentChunk.push(event.data);
		};

		mediaRecorder.onstop = () => {
			const blob = new Blob(currentChunk, {
				type: 'audio/webm'
			});
			audioChunks = [...audioChunks, URL.createObjectURL(blob)];
			currentChunk = [];
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

	let audioChunks = $state<string[]>([]);

	function processAudio() {
		analyser.getByteFrequencyData(dataArray);

		const averageVolume = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length;

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
	<div>
		{#each audioChunks as chunk}
			<p>{chunk}</p>
		{/each}
	</div>
	<button onclick={toggleAudio}>MUTE</button>
</div>
