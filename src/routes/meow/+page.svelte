<script lang="ts">
	import { onMount } from 'svelte';

	onMount(async () => {
		const response = await fetch(`/uploadTTSQuestion`, {
			method: 'POST',
			body: JSON.stringify({
				questions: [
					'Thank you so much for your time today! It was great chatting with you, and I appreciate your insights. We\'ll be in touch soon—take care!',
				]
			}),
			headers: { contentType: 'application/json' }
		});

		// const response = await fetch(`/uploadAcks`, {
		// 	method: 'POST',
		// 	body: JSON.stringify({
		// 		acks: [
		// 			'Thank you for sharing that!',
		// 		]
		// 	}),
		// 	headers: { contentType: 'application/json' }
		// });

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
