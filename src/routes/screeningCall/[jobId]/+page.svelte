<script lang="ts">
	import { page } from '$app/stores';
	import { jobDecoder } from '$lib/decoders';
	import { firebaseConfig } from '$lib/firebase';
	import { type ConversationPhase } from '$lib/proomp/prompts';
	import { playAudio, randomElement } from '$lib/utils';
	import { initializeApp } from 'firebase/app';
	import { doc, getDoc, getFirestore } from 'firebase/firestore';
	import { onMount } from 'svelte';
	import type { z } from 'zod';

	const { job, greetingAudio } = $page.data as {
		job: z.infer<typeof jobDecoder>;
		greetingAudio: ArrayBuffer;
	};

	const name = $page.url.searchParams.get('name') ?? '';

	type ConversationStatus = 'IDLE' | 'AI_TALKING' | 'AI_THINKING' | 'HUMAN_TALKING' | 'COMPLETE';
	let conversationStatus = $state<ConversationStatus>('IDLE');
	let conversationPhase = $state<ConversationPhase>('greetings');

	let currentQuestion = $state<string | undefined>();
	let skillQuestionsQueue = $state<{ skill: string; question: string }[]>([
		...(job.questions?.softSkills ?? []).map((softSkills) => ({
			skill: softSkills.skill,
			question: randomElement(softSkills?.questions)
		})),
		...(job.questions?.hardSkills ?? []).map((hardSkills) => ({
			skill: hardSkills.skill,
			question: randomElement(hardSkills?.questions)
		}))
	]);
	let history = $state<string[]>([]);

	onMount(async () => {
		conversationStatus = 'IDLE';
	});

	$effect(() => {
		switch (conversationStatus) {
			case 'IDLE': {
			}
			case 'AI_TALKING': {
			}
			case 'AI_THINKING': {
			}
			case 'HUMAN_TALKING': {
			}
			case 'COMPLETE': {
			}
		}
	});
</script>

<div class="grid grid-cols-2">
	<div>
		<div>STATUS: {conversationStatus}</div>
		<div>CURRENT QUESTION: {currentQuestion}</div>
	</div>
	<div>
		<p>HISTORY</p>
		<div>
			{#each history as entry}
				<p>{entry}</p>
			{/each}
		</div>
	</div>
</div>
