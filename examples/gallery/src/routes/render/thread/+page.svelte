<script lang="ts">
	import { page } from '$app/state';
	import {
		ChatComposer,
		ChatView,
		customPart,
		type ChatCustomPart,
		type ChatMessageData
	} from '@ljoukov/chat';
	import RenderSurface from '$lib/demo/RenderSurface.svelte';
	import AgentStatusCard from '$lib/demo/AgentStatusCard.svelte';
	import { resolveRenderTheme } from '$lib/demo/render.js';
	import { emptySuggestions } from '$lib/demo/chat-demo.js';
	import { threadMessages } from '$lib/demo-data.js';

	const theme = $derived(resolveRenderTheme(page.url.searchParams));
	const variant = $derived(page.url.searchParams.get('state') === 'empty' ? 'empty' : 'mapped');

	let draft = $state('Show the owner and the dry-run date in the reply.');

	const messages = [
		...threadMessages,
		{
			id: 'thread-custom',
			role: 'assistant',
			parts: [
				customPart('agent-status', {
					progress: 81,
					stage: 'Finalising the owner handoff',
					summary: 'The route can inject richer status UI without changing the library renderer.',
					title: 'Extension hook',
					updates: ['Mapped transcript', 'Rendered task card', 'Prepared custom summary']
				})
			]
		}
	] satisfies ChatMessageData[];
</script>

<svelte:head>
	<title>@ljoukov/chat · Render ChatView</title>
</svelte:head>

<RenderSurface
	component="thread"
	target="chat-thread"
	{theme}
	state={variant}
	panelClass="gallery-render__panel--wide"
>
	{#if variant === 'empty'}
		<ChatView
			title="Start a thread"
			description="A route can pair the empty state with its own prompt suggestions."
			emptyDescription="Choose a suggestion or type your own prompt below."
			emptySuggestions={emptySuggestions}
			messages={[]}
		>
			{#snippet composer()}
				<ChatComposer bind:value={draft} submitMode="enter" />
			{/snippet}
		</ChatView>
	{:else}
		<ChatView
			class="min-h-[36rem]"
			title="Agent thread"
			description="Mapped text, markdown, attachments, task cards, and app-defined custom parts."
			{messages}
		>
			{#snippet customPart(part: ChatCustomPart)}
				{#if part.key === 'agent-status'}
					<AgentStatusCard status={part.data as never} />
				{/if}
			{/snippet}

			{#snippet composer()}
				<ChatComposer bind:value={draft} submitMode="enter" />
			{/snippet}
		</ChatView>
	{/if}
</RenderSurface>
