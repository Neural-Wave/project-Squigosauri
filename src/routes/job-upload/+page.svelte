<script lang="ts">
	import H1 from '../../components/Typography/H1.svelte';
	import Container from '../../components/UI/Container.svelte';
	interface ApiResponse {
		success: boolean;
		html?: string;
		error?: string;
	}

	let markdownContent: string = '';

	async function handleSubmit(event: Event) {
		event.preventDefault();

		try {
			const response = await fetch('/api/MAIKUDAMMILAPI', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ markdown: markdownContent })
			});

			if (!response.ok) {
				throw new Error("Errore durante l'invio del markdown");
			}

			const result: ApiResponse = await response.json();
			console.log('Risultato dalla API:', result);
		} catch (error) {
			console.error('Errore:', error);
		}
	}
</script>

<Container>
	<div class="flex min-h-screen flex-col items-center p-4">
		<div class="w-full max-w-lg">
			<H1>Insert a new job position</H1>
			<form on:submit={handleSubmit} class="w-full max-w-lg rounded-lg p-6 shadow-md">
				<label for="markdown" class="mb-2 block text-sm font-medium text-gray-400"
					>Paste here your job description</label
				>
				<textarea
					id="markdown"
					bind:value={markdownContent}
					rows="10"
					class="block w-full rounded-md border border-orange-300 p-2 focus:outline-none focus:ring focus:ring-orange-300"
				></textarea>

				<button
					type="submit"
					class=" mt-4 w-full rounded-md bg-orange-600 py-2 font-semibold text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
				>
					Upload new job position
				</button>
			</form>
		</div>
	</div>
</Container>
