<script lang="ts">
	export let color: string = '';
</script>

<div class={'container mx-auto' + color == 'orange' ? 'bg-orange-500' : ''}><slot /></div>
