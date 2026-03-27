<script lang="ts">
	import { page } from '$app/state';
	import { ChatTaskCard } from '@ljoukov/chat';
	import RenderSurface from '$lib/demo/RenderSurface.svelte';
	import { resolveRenderTheme } from '$lib/demo/render.js';
	import { taskCardStates } from '$lib/demo-data.js';

	const theme = $derived(resolveRenderTheme(page.url.searchParams));
	const variant = $derived.by(() => {
		const requested = page.url.searchParams.get('state');
		if (requested === 'success' || requested === 'failed') {
			return requested;
		}
		return 'running';
	});
	const task = $derived(
		taskCardStates.find((entry) => entry.status === variant) ??
			taskCardStates.find((entry) => entry.status === 'running') ??
			taskCardStates[0]
	);
</script>

<svelte:head>
	<title>@ljoukov/chat · Render ChatTaskCard</title>
</svelte:head>

<RenderSurface
	component="task-card"
	target="chat-task-card"
	{theme}
	state={variant}
	panelClass="gallery-render__panel--narrow"
>
	{#if task}
		<ChatTaskCard {task} />
	{/if}
</RenderSurface>
