<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import type { CallPageData } from './proxy+page';
	import { playAudio } from '$lib/utils';
	import { extractDiplomas } from '$lib/proomp/prompts';

	const { job, customQuestionURL, prefetchedAudio, softSkillQuestions, hardSkillQuestions } =
		$page.data as CallPageData;

	const { byeBye, diploma, greetingEnd, initialAck, lastQuestion, salary, transition } =
		customQuestionURL;

	const { greetingStart, location } = prefetchedAudio;

	type ConversationStatus = 'IDLE' | 'AI_TALKING' | 'AI_THINKING' | 'HUMAN_TALKING' | 'COMPLETE';
	let conversationStatus = $state<ConversationStatus>('IDLE');
	let conversationPhase = $state('greetings');

	let questionQueue = $state([
		{
			playQuestion: (onPlaybackEnd: () => void) => {
				const audioPlayer = new Audio(diploma.url);
				audioPlayer.onended = onPlaybackEnd;
				audioPlayer.play();
			},
			answerHandler: async (answer: string) => {
				const feedback = await extractDiplomas(answer);
				console.log(feedback);
			},
			questionText: diploma.text
		}
	]);

	let history = $state<string[]>([]);

	$effect(() => {
		switch (conversationStatus) {
			case 'IDLE': {
				playAudio(greetingStart.buffer, () => {
					const greetingEndPlayer = new Audio(greetingEnd.url);
					greetingEndPlayer.onended = () => {
						conversationStatus = 'AI_TALKING';
					};
					greetingEndPlayer.play();
				});

				return;
			}
			case 'AI_TALKING': {
				questionQueue[0].playQuestion(() => {
					conversationStatus = 'HUMAN_TALKING';
				});

				return;
			}
			case 'AI_THINKING': {
				return;
			}
			case 'HUMAN_TALKING': {
				return;
			}
			case 'COMPLETE': {
				return;
			}
		}
	});
</script>

<div class="grid grid-cols-2">
	<div>
		<div>STATUS: {conversationStatus}</div>
		<div>CURRENT QUESTION: {questionQueue[0].questionText}</div>
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
