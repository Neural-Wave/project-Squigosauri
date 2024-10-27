<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import type { CallPageData } from './proxy+page';
	import { getRandomAck, playAudio, transcribeMediaStream } from '$lib/utils';
	import { extractDiplomas, negotiateSalary, validateAnswer } from '$lib/proomp/prompts';
	import { RealtimeTranscriber, type RealtimeTranscript } from 'assemblyai/streaming';

	const {
		job,
		customQuestionURL,
		prefetchedAudio,
		softSkillQuestions,
		hardSkillQuestions,
		assemblyAIToken
	} = $page.data as CallPageData;

	const name = $page.url.searchParams.get('name') ?? '';

	const { byeBye, diploma, greetingEnd, lastQuestion, salary, transition } = customQuestionURL;

	const { greetingStart, location } = prefetchedAudio;

	type ConversationStatus = 'IDLE' | 'AI_TALKING' | 'AI_THINKING' | 'HUMAN_TALKING' | 'COMPLETE';
	let conversationStatus = $state<ConversationStatus>('IDLE');
	let currentAck = transition;

	let questionQueue = $state([
		{
			playQuestion: (onPlaybackEnd: () => void) => {
				const audioPlayer = new Audio(diploma.url);
				audioPlayer.onended = onPlaybackEnd;
				audioPlayer.play();
			},
			answerHandler: async (answer: string) => {
				const feedback = await extractDiplomas(answer);
				// TODO: add content to results
				const content = JSON.parse(feedback.choices[0].message.content ?? '');
			},
			questionText: diploma.text,
			shouldPlayAck: true
		},
		...Object.entries(softSkillQuestions).map(([text, { url, skill }]) => {
			return {
				playQuestion: (onPlaybackEnd: () => void) => {
					const audioPlayer = new Audio(url);
					audioPlayer.onended = onPlaybackEnd;
					audioPlayer.play();
				},
				answerHandler: async (answer: string) => {
					const validationAnswer = await validateAnswer(job, name, [], skill, text, answer);
					const { validation } = JSON.parse(validationAnswer.choices[0].message.content ?? '');
					// questionQueue.unshift({
					// 	playQuestion: (onPlaybackEnd: () => void) => {
					// 		const audioPlayer = new Audio(url);
					// 		audioPlayer.onended = onPlaybackEnd;
					// 		audioPlayer.play();
					// 	},
					// 	answerHandler: async (answer: string) => {
					// 		const validationAnswer = await validateAnswer(job, name, [], skill, text, answer);
					// 		const { validation } = JSON.parse(validationAnswer.choices[0].message.content ?? '');
					// 		questionQueue.unshift();
					// 	},
					// 	questionText: text,
					// 	shouldPlayAck: true
					// });
				},
				questionText: text,
				shouldPlayAck: true
			};
		}),
		...Object.entries(hardSkillQuestions).map(([text, { url, skill }]) => {
			return {
				playQuestion: (onPlaybackEnd: () => void) => {
					const audioPlayer = new Audio(url);
					audioPlayer.onended = onPlaybackEnd;
					audioPlayer.play();
				},
				answerHandler: async (answer: string) => {
					const validationAnswer = await validateAnswer(job, name, [], skill, text, answer);
					const { validation } = JSON.parse(validationAnswer.choices[0].message.content ?? '');
					console.log(validation);
				},
				questionText: text,
				shouldPlayAck: true
			};
		}),
		{
			playQuestion: (onPlaybackEnd: () => void) => {
				playAudio(location.buffer, onPlaybackEnd);
			},
			answerHandler: async (answer: string) => {
				console.log(answer);
			},
			questionText: location.text,
			shouldPlayAck: true
		},
		{
			playQuestion: (onPlaybackEnd: () => void) => {
				const audioPlayer = new Audio(salary.url);
				audioPlayer.onended = onPlaybackEnd;
				audioPlayer.play();
			},
			answerHandler: async (answer: string) => {
				const negotiationAnswer = await negotiateSalary(answer, name, [], 50_000, 100_000);
				const { validation } = JSON.parse(negotiationAnswer.choices[0].message.content ?? '');
				console.log(validation);
			},
			questionText: salary.text,
			shouldPlayAck: true
		},
		{
			playQuestion: (onPlaybackEnd: () => void) => {
				const audioPlayer = new Audio(lastQuestion.url);
				audioPlayer.onended = onPlaybackEnd;
				audioPlayer.play();
			},
			answerHandler: async (answer: string) => {
				console.log(answer);
			},
			questionText: lastQuestion.text,
			shouldPlayAck: true
		},
		{
			playQuestion: (onPlaybackEnd: () => void) => {
				const audioPlayer = new Audio(byeBye.url);
				audioPlayer.onended = onPlaybackEnd;
				audioPlayer.play();
			},
			answerHandler: async (answer: string) => {
				console.log(answer);
				conversationStatus = 'COMPLETE';
			},
			questionText: byeBye.text,
			shouldPlayAck: false
		}
	]);

	let history = $state<string[]>([]);

	let stream: MediaStream;
	let transcriber: RealtimeTranscriber;

	let transcription = $state('');

	onMount(async () => {
		transcriber = new RealtimeTranscriber({ token: assemblyAIToken, sampleRate: 16_000 });

		transcriber.on('transcript', async (transcript: RealtimeTranscript) => {
			if (!transcript.text) {
				return;
			}

			transcription = transcript.text;

			if (transcript.message_type === 'FinalTranscript') {
				conversationStatus = 'AI_THINKING';
			}
		});

		transcriber.connect();

		stream = await navigator.mediaDevices.getUserMedia({
			audio: true
		});

		await transcribeMediaStream(transcriber, stream);
	});

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
				getRandomAck().then((ack) => {
					currentAck = ack;
				});
				questionQueue[0].playQuestion(() => {
					conversationStatus = 'HUMAN_TALKING';
				});
				return;
			}
			case 'AI_THINKING': {
				const finishedThinking = async () => {
					questionQueue.shift();
					transcription = '';
					conversationStatus = 'AI_TALKING';
				};

				if (questionQueue[0].shouldPlayAck) {
					const audioPlayer = new Audio(currentAck.url);
					const audioEndedPromise = new Promise((resolve) => {
						audioPlayer.onended = resolve;
					});
					audioPlayer.play();

					Promise.all([questionQueue[0].answerHandler(transcription), audioEndedPromise]).then(
						finishedThinking
					);
				} else {
					questionQueue[0].answerHandler(transcription).then(finishedThinking);
				}
				return;
			}
			case 'HUMAN_TALKING': {
				return;
			}
			case 'COMPLETE': {
				transcriber.close();
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
		<p>LIVE TRANSCRIPTION</p>
		<div>
			{transcription}
		</div>
	</div>
</div>
