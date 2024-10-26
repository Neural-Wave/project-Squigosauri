<script lang="ts">
	import { onMount } from 'svelte';

	onMount(async () => {
		const response = await fetch(`/uploadTTSQuestion`, {
			method: 'POST',
			body: JSON.stringify({
				questions: ['Oil up sally', "Hi i'm Matteo, i'm a loser", 'GNAAAAAAAM']
			}),
			headers: { contentType: 'application/json' }
		});

		const audioData = await response.arrayBuffer();

		const audioContext = new AudioContext();
		const audioBuffer = await audioContext.decodeAudioData(audioData);

		const source = audioContext.createBufferSource();
		source.buffer = audioBuffer;

		source.connect(audioContext.destination);

		source.start();
		console.log('STARTED');
	});
</script>

<div></div>
