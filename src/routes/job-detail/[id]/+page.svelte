<script lang="ts">
	import Container from '../../../components/UI/Container.svelte';
	import { page } from '$app/stores';
	import { marked } from 'marked';
	import { Icon } from 'svelte-icons-pack';
	import { BiSolidPhoneCall } from 'svelte-icons-pack/bi';

	interface InterviewData {
		jobTitle: string;
		company: string;
		salary: string;
		startDate: string;
		location: string;
		seniority: string;
		softskills: string[];
		hardskills: string[];
	}

	// onMount(async () => {
	// 	try {
	// 		const response = await fetch(`/api/interviews/${$page.params.id}`);
	// 		if (!response.ok) {
	// 			throw new Error('Network response was not ok');
	// 		}
	// 		interviewData = await response.json();
	// 	} catch (err) {
	// 		error = err instanceof Error ? err.message : 'Unknown error occurred';
	// 	}
	// });

	const interviewData = {
		jobTitle: 'Software Engineer',
		company: 'Tech Innovations Inc.',
		salary: '90,000',
		startDate: '2024-03-01',
		location: 'San Francisco, CA',
		seniority: 'Senior',
		markdownDesc: `# Descrizione della Posizione: Software Engineer

Siamo entusiasti di presentare l'opportunità di un **Software Engineer** presso **Tech Innovations Inc.** Questa posizione offre un **stipendio competitivo di 90,000 USD** e la possibilità di iniziare a lavorare dal **1 Marzo 2024** nella vibrante città di **San Francisco, CA**. Cerchiamo candidati con un livello di **seniority** elevato, pronti a contribuire a progetti innovativi.

## Ruolo: Software Engineer

### Soft Skills
- **Problem Solving**: Capacità di affrontare e risolvere complessi problemi tecnici.
- **Adaptability**: Flessibilità e capacità di adattarsi a nuove tecnologie e sfide.
- **Collaboration**: Eccellenti doti relazionali per lavorare efficacemente all'interno di un team.

### Hard Skills
- **JavaScript** e **TypeScript**: Competenze solide in programmazione.
- **React**: Esperienza nello sviluppo di interfacce utente moderne e responsive.
- **Node.js**: Capacità di sviluppare applicazioni server-side.
- **SQL**: Conoscenza approfondita nella gestione di database relazionali.

Se ritieni di avere le competenze e l'esperienza necessarie, ti invitiamo a **premere il pulsante ed iniziare il colloquio di screening** per discutere questa entusiasmante opportunità.
`,
		softskills: ['Problem Solving', 'Adaptability', 'Collaboration'],
		hardskills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL']
	};

	const htmlDescription = marked(interviewData.markdownDesc);
</script>

<Container>
	<div class="bordershadow-md mx-auto max-w-3xl rounded-lg pl-4 pr-4">
		<h1 class="mb-2 text-2xl font-bold text-orange-600">
			Job Title: {interviewData.jobTitle} - #{$page.params.id}
		</h1>

		<div class="mt-4 flex flex-col justify-between gap-4 md:flex-row md:gap-0">
			<div class="flex flex-col">
				<h2 class="text-xl font-semibold">Summary</h2>
				<p class="text-gray-600">
					Company: <span class="font-semibold">{interviewData.company}</span>
				</p>
				<p class="text-gray-600">
					Salary: <span class="font-semibold">{interviewData.salary}</span>
				</p>
				<p class="text-gray-600">
					Start Date: <span class="font-semibold">{interviewData.startDate}</span>
				</p>
				<p class="text-gray-600">
					Location: <span class="font-semibold">{interviewData.location}</span>
				</p>
				<p class="text-gray-600">
					Seniority: <span class="font-semibold">{interviewData.seniority}</span>
				</p>
			</div>

			<div>
				<h2 class="text-xl font-semibold">Soft Skills</h2>
				<ul class="list-disc pl-5">
					{#each interviewData.softskills as skill}
						<li class="text-gray-600">{skill}</li>
					{/each}
				</ul>
			</div>

			<div>
				<h2 class="text-xl font-semibold">Hard Skills</h2>
				<ul class="list-disc pl-5">
					{#each interviewData.hardskills as skill}
						<li class="text-gray-600">{skill}</li>
					{/each}
				</ul>
			</div>
		</div>
		<hr class="mb-6 mt-6" />
		<div class="mb-24">
			<h2 class="text-xl font-semibold">Job description</h2>
			<div class="rendered-markdown">{@html htmlDescription}</div>
		</div>
		<button
			class="fixed bottom-0 left-1/2 mb-6 flex w-full max-w-xl -translate-x-1/2 items-center justify-center gap-4 rounded-md bg-orange-600 py-2 font-semibold text-white shadow-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
		>
			<Icon src={BiSolidPhoneCall}></Icon>
			Start Screening Call
		</button>
	</div>
</Container>
