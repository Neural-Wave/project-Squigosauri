<script lang="ts">
	import type { InterviewData } from '$lib/proomp/prompts';
	import { marked } from 'marked';
	export let interviewData: InterviewData;
</script>

<div
	class="mx-auto flex w-1/2 rounded-lg border border-gray-200 bg-white shadow-md transition-shadow duration-200 hover:shadow-lg"
>
	<div class="flex w-full flex-col justify-between p-5">
		<h3 class="text-base font-semibold text-gray-800 md:text-xl">{interviewData.jobTitle}</h3>
		<p class="text-sm text-gray-500">{interviewData.company}</p>
		<p class="mt-1 text-sm text-gray-600"><strong>Location:</strong> {interviewData.location}</p>
		<button
			class="mt-4 w-full rounded-md bg-orange-600 px-4 py-2 text-center font-semibold text-white hover:bg-orange-700"
		>
			{interviewData.id}
		</button>
	</div>
</div>
