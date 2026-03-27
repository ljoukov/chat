<script lang="ts">
	import { page } from '$app/state';
	import { ChatMarkdown } from '@ljoukov/chat';
	import RenderSurface from '$lib/demo/RenderSurface.svelte';
	import { resolveRenderTheme } from '$lib/demo/render.js';
	import { inlineMarkdownShowcase, markdownShowcase } from '$lib/demo-data.js';

	const theme = $derived(resolveRenderTheme(page.url.searchParams));
	const variant = $derived(page.url.searchParams.get('state') === 'inline' ? 'inline' : 'block');
</script>

<svelte:head>
	<title>@ljoukov/chat · Render ChatMarkdown</title>
</svelte:head>

<RenderSurface
	component="markdown"
	target="chat-markdown"
	{theme}
	state={variant}
	panelClass="gallery-render__panel--narrow"
>
	{#if variant === 'inline'}
		<div class="inline-flex items-center gap-2 rounded-xl border bg-background px-4 py-3">
			<ChatMarkdown inline markdown={inlineMarkdownShowcase} />
		</div>
	{:else}
		<ChatMarkdown markdown={markdownShowcase} />
	{/if}
</RenderSurface>
