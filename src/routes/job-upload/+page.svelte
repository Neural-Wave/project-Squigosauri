<script lang="ts">
	import {
		generateInterviewQuestion,
		getSkillQuestions,
		type InterviewData,
		type SkillsType
	} from '$lib/proomp/prompts';
	import { addDoc, collection, doc, getFirestore, setDoc } from 'firebase/firestore';
	import H1 from '../../components/Typography/H1.svelte';
	import Container from '../../components/UI/Container.svelte';
	import { onMount } from 'svelte';
	import { initializeApp, type FirebaseApp } from 'firebase/app';
	import { type Firestore } from 'firebase/firestore';
	import { firebaseConfig } from '$lib/firebase';

	let jobDetails: InterviewData | undefined = $state();
	let markdownContent: string = $state('');

	let app: FirebaseApp
	let db: Firestore

	onMount(() => {
		app = initializeApp(firebaseConfig);
		db = getFirestore(app);
	});

	async function handleSubmit(event: Event) {
		event.preventDefault();

		generateInterviewQuestion(markdownContent).then((res) => {
			const data = res.choices[0].message.content
				? (JSON.parse(res.choices[0].message.content) as InterviewData)
				: null;

			console.log(data);

			if (data) {
				getSkillQuestions(data.jobTitle, data.softSkills, data.hardSkills).then(async (res) => {
					const skills = res.choices[0].message.content
						? (JSON.parse(res.choices[0].message.content) as SkillsType)
						: null;

					console.log(skills);

					if (skills) {
						jobDetails = {
							...data,
							text: markdownContent,
							questions: skills,
						};
					} else {
						jobDetails = {
							...data,
							text: markdownContent,
						};
					}

					await addDoc(collection(db, 'job_offers'), jobDetails);
				});
			}
		});
	}
</script>

<Container>
	<div class="flex min-h-screen flex-col items-center p-4">
		<div class="w-full max-w-lg">
			<H1>Insert a new job position</H1>
			<form onsubmit={handleSubmit} class="w-full max-w-lg rounded-lg p-6 shadow-md">
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
