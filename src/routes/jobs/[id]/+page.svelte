<script lang="ts">
	import Container from '../../../components/UI/Container.svelte';
	import { page } from '$app/stores';
	import { marked } from 'marked';
	import { Icon } from 'svelte-icons-pack';
	import { BiSolidPhoneCall } from 'svelte-icons-pack/bi';
	import { type InterviewData } from '$lib/proomp/prompts';
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

	let userName = $state('');
	let interviewData: InterviewData | undefined = $state();
	let htmlDescription: string = $state('');

	onMount(() => {
		let app = initializeApp(firebaseConfig);
		let db = getFirestore(app);
		const docRef = doc(db, 'job_offers', $page.params.id);
		getDoc(docRef).then((res) => {
			if (res.exists()) {
				interviewData = res.data() as InterviewData;
				htmlDescription = marked(interviewData ? interviewData.text : '') as string;
			} else {
			}
		});
	});
</script>

{#if interviewData}
	<Container>
		<div class="bordershadow-md mx-auto max-w-3xl flex-wrap rounded-lg pl-4 pr-4">
			<h1 class="mb-2 text-2xl font-bold text-orange-600">
				{interviewData.jobTitle} - {interviewData.company}
			</h1>

			<div class="mt-4 flex flex-col gap-4">
				<div class="flex min-w-full flex-col">
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

				<div class="flex flex-row gap-8">
					<div>
						<h2 class="text-xl font-semibold">Soft Skills</h2>
						<ul class="list-disc pl-5">
							{#each interviewData.softSkills as skill}
								<li class="text-gray-600">{skill}</li>
							{/each}
						</ul>
					</div>
					<div>
						<h2 class="text-xl font-semibold">Hard Skills</h2>
						<ul class="list-disc pl-5">
							{#each interviewData.hardSkills as skill}
								<li class="text-gray-600">{skill}</li>
							{/each}
						</ul>
					</div>
				</div>
			</div>
			<hr class="mb-6 mt-6" />
			<div class="mb-24">
				<h2 class="text-xl font-semibold">Job description</h2>
				<div class="rendered-markdown">{@html htmlDescription}</div>
			</div>
			<div
				class="fixed bottom-0 left-1/2 flex w-full -translate-x-1/2 flex-col items-center justify-center sm:flex-row"
			>
				<input
					class=" flex w-full max-w-md items-center justify-center gap-4 rounded-md border-2 border-gray-200 text-center focus:ring-2 focus:ring-orange-400"
					type="text"
					placeholder="Insert name to start the screening call"
					bind:value={userName}
				/>
				<a href={`/jobs/${$page.params.id}/call?name=${userName}`}>
					<button
						class="min-w-xl flex w-full items-center justify-center gap-4 rounded-md
					 bg-orange-600 py-2 pl-4 pr-4 font-semibold text-white shadow-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-400
					{userName === ''
							? 'cursor-not-allowed bg-gray-400 hover:bg-gray-400'
							: 'bg-orange-600 hover:bg-orange-700'} "
						disabled={userName === ''}
					>
						<Icon src={BiSolidPhoneCall}></Icon>
						Start Screening Call
					</button>
				</a>
			</div>
		</div>
	</Container>
{:else}
	<p>nothing to see here</p>
{/if}
