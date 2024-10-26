<script lang="ts">
	import Container from '../../../components/UI/Container.svelte';
	import { page } from '$app/stores';
	import { marked } from 'marked';
	import { Icon } from 'svelte-icons-pack';
	import { BiSolidPhoneCall } from 'svelte-icons-pack/bi';
	import { mockJobOffer1 } from '$lib/proomp/prompts';
	import { onMount } from 'svelte';
	import { initializeApp, type FirebaseApp } from 'firebase/app';
	import {
		doc,
		DocumentReference,
		Firestore,
		getFirestore,
		getDoc,
		type DocumentData
	} from 'firebase/firestore';
	import { firebaseConfig } from '$lib/firebase';

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

	let interviewData: InterviewData;

	onMount(async () => {
		let app = initializeApp(firebaseConfig);
		let db = getFirestore(app);
		const docRef = doc(db, 'job_offers', $page.params.id);
		const res = await getDoc(docRef);
		console.log(res);
		if (res.exists()) {
			console.log('Document data:', res.data());
			interviewData = res.data();
		} else {
			console.log('No such document!');
		}
	});

	const htmlDescription = marked(interviewData ? interviewData.text : '');
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
