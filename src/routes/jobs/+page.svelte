<script lang="ts">
	import JobPostCard from '../../components/UI/JobPostCard.svelte';
	import { marked } from 'marked';
	import { onMount } from 'svelte';
	import { initializeApp } from 'firebase/app';
	import { doc, getFirestore, getDocs, collection } from 'firebase/firestore';
	import { firebaseConfig } from '$lib/firebase';
	import type { InterviewData } from '$lib/proomp/prompts';
	import Container from '../../components/UI/Container.svelte';

	let interviewData: InterviewData | undefined = $state();
	let htmlDescription: string = $state('');
	let interviewDataList: InterviewData[] = $state()!;

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

<Container>
	<ul class="flex flex-row gap-4 pl-4 pr-4">
		{#each interviewDataList as interview}
			<JobPostCard interviewData={interview} />
		{/each}
	</ul>
</Container>
