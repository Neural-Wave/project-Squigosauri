<script lang="ts">
	import { marked } from 'marked';
	import { onMount } from 'svelte';
	import { initializeApp } from 'firebase/app';
	import { doc, getFirestore, getDocs, collection } from 'firebase/firestore';
	import { firebaseConfig } from '$lib/firebase';
	import type { InterviewData } from '$lib/proomp/prompts';
	import Container from '../components/UI/Container.svelte';
	import HeroSearchBar from '../components/HeroSearchBar.svelte';
	import JobPostCard from '../components/UI/JobPostCard.svelte';

	let searchTerm = $state('');

	let interviewData: InterviewData | undefined = $state();
	let htmlDescription: string = $state('');
	let interviewDataList: InterviewData[] = $state([]);
	let filteredJobs = $derived(
		interviewDataList.filter((data) =>
			data.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
		)
	);

	onMount(async () => {
		const app = initializeApp(firebaseConfig);
		const db = getFirestore(app);

		const querySnapshot = await getDocs(collection(db, 'job_offers'));
		interviewDataList = querySnapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data()
		})) as unknown as InterviewData[];

		interviewDataList = interviewDataList.map((data) => ({
			...data,
			htmlDescription: data.text ? marked(data.text) : ''
		}));

		console.log(interviewDataList);
	});
</script>

<Container color={'orange'}>
	<HeroSearchBar bind:searchTerm />
</Container>
<Container>
	<ul class="mt-4 flex flex-row flex-wrap gap-4 p-4 md:pl-12 md:pr-12">
		{#each filteredJobs as interview}
			<JobPostCard interviewData={interview} />
		{/each}
	</ul>
</Container>
