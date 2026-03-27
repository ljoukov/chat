<script lang="ts">
	import { page } from '$app/state';
	import {
		ChatMessage,
		customPart,
		markdownPart,
		statusPart,
		textPart,
		thinkingPart,
		type ChatCustomPart,
		type ChatMessageData
	} from '@ljoukov/chat';
	import RenderSurface from '$lib/demo/RenderSurface.svelte';
	import AgentStatusCard from '$lib/demo/AgentStatusCard.svelte';
	import { resolveRenderTheme } from '$lib/demo/render.js';
	import { sampleFileAttachment, sampleImageAttachment } from '$lib/demo/chat-demo.js';

	const theme = $derived(resolveRenderTheme(page.url.searchParams));
	const variant = $derived.by(() => {
		const requested = page.url.searchParams.get('state');
		return requested === 'attachments' || requested === 'custom' ? requested : 'assistant';
	});

	const message = $derived.by<ChatMessageData>(() => {
		if (variant === 'attachments') {
			return {
				id: 'render-message-attachments',
				role: 'assistant',
				attachments: [sampleFileAttachment, sampleImageAttachment],
				parts: [textPart('Attachments can render before or alongside message content.')]
			};
		}

		if (variant === 'custom') {
			return {
				id: 'render-message-custom',
				role: 'assistant',
				parts: [
					customPart('agent-status', {
						progress: 64,
						stage: 'Drafting the closing summary',
						summary: 'A custom card can live inside a normal assistant message.',
						title: 'Embedded status card',
						updates: ['Attached brief', 'Mapped blockers', 'Preparing final handoff']
					})
				]
			};
		}

		return {
			id: 'render-message-assistant',
			role: 'assistant',
			parts: [
				thinkingPart('Pulling out blockers first so the answer reads like an operating note.'),
				markdownPart(
					['### Handoff note', '', '- Confirm the export shape', '- Lock the QA owner', '- Schedule the dry run'].join('\n')
				),
				statusPart('Ready to hand off', 'primary')
			]
		};
	});
</script>

<svelte:head>
	<title>@ljoukov/chat · Render ChatMessage</title>
</svelte:head>

<RenderSurface
	component="message"
	target="chat-message"
	{theme}
	state={variant}
	panelClass="gallery-render__panel--narrow"
>
	<ChatMessage {message}>
		{#snippet customPart(part: ChatCustomPart)}
			{#if part.key === 'agent-status'}
				<AgentStatusCard status={part.data as never} />
			{/if}
		{/snippet}
	</ChatMessage>
</RenderSurface>
