<script lang="ts">
	let { searchTerm = $bindable() } = $props<{ searchTerm: string }>();
</script>

<div class="flex h-72 flex-col justify-center bg-orange-100 pl-4 pr-4 md:items-center">
	<h1 class="text-3xl text-orange-600 md:text-5xl">Find your dream job today</h1>
	<p class="mb-4 text-gray-500 md:text-center">
		Explore thousands of job opportunities and take the next step in your career.
	</p>
	<div class="flex w-full gap-2 md:max-w-lg md:items-center md:justify-center">
		<input
			class="h-full w-full rounded-md border border-orange-300 p-2 focus:outline-none focus:ring focus:ring-orange-300"
			type="text"
			name=""
			id=""
			bind:value={searchTerm}
		/>
		<button
			class="w-sm rounded-md bg-orange-600 px-4 py-2 text-center text-xs font-semibold text-white hover:bg-orange-700"
			>Search</button
		>
	</div>
	<p class=" mt-4 text-orange-300 md:text-center">Powered by Screening Spaghetti ®</p>
</div>
