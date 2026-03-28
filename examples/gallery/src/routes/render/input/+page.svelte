<script lang="ts">
	import { page } from '$app/state';
	import { ChatInput } from '@ljoukov/chat';
	import RenderSurface from '$lib/demo/RenderSurface.svelte';
	import { resolveRenderTheme } from '$lib/demo/render.js';

	const theme = $derived(resolveRenderTheme(page.url.searchParams));
	const variant = $derived.by(() => {
		const requested = page.url.searchParams.get('state');
		if (
			requested === 'filled' ||
			requested === 'chat' ||
			requested === 'multiline' ||
			requested === 'disabled'
		) {
			return requested;
		}
		return 'empty';
	});

	let defaultValue = $state('This default variant works well in compact forms and inline tools.');
	let chatValue = $state('This chat variant stays lean inside a richer composer shell.');
	let multilineValue = $state(
		'Shift+Enter keeps line breaks.\n\nThe autoresize logic steps deliberately from one line to two, then to explicit multiline.'
	);
	const previewSurfaceStyle = $derived(
		theme === 'dark'
			? 'padding: 24px; border-radius: 24px; border: 1px solid var(--border); background: color-mix(in srgb, var(--card) 88%, black);'
			: 'padding: 24px; border-radius: 24px; border: 1px solid var(--border); background: color-mix(in srgb, white 92%, #f4f4f5);'
	);
</script>

<svelte:head>
	<title>@ljoukov/chat · Render ChatInput</title>
</svelte:head>

<RenderSurface
	component="input"
	target="chat-input"
	{theme}
	state={variant}
	panelClass="gallery-render__panel--narrow"
	targetClass="render-target--padded"
	targetStyle={previewSurfaceStyle}
>
	{#if variant === 'filled'}
		<ChatInput bind:value={defaultValue} variant="default" submitMode="enter" />
	{:else if variant === 'chat'}
		<ChatInput
			bind:value={chatValue}
			variant="chat"
			placeholder="Ask anything"
			submitMode="enter"
		/>
	{:else if variant === 'multiline'}
		<ChatInput
			bind:value={multilineValue}
			variant="default"
			maxLines={12}
			placeholder="Shift+Enter for a newline"
			submitMode="modEnter"
		/>
	{:else if variant === 'disabled'}
		<ChatInput
			value="The field is disabled while a request is in flight."
			variant="default"
			disabled
		/>
	{:else}
		<ChatInput variant="default" placeholder="Ask anything" submitMode="enter" />
	{/if}
</RenderSurface>
