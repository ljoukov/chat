<script lang="ts">
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
	import AgentStatusCard from '$lib/demo/AgentStatusCard.svelte';
	import { sampleFileAttachment, sampleImageAttachment } from '$lib/demo/chat-demo.js';

	const messageStates: ChatMessageData[] = [
		{
			id: 'message-user',
			role: 'user',
			parts: [textPart('Summarise this brief and keep the run state visible.')]
		},
		{
			id: 'message-assistant-markdown',
			role: 'assistant',
			parts: [
				thinkingPart('Pulling out blockers first so the answer reads like an operating note.'),
				markdownPart(
					[
						'### Handoff note',
						'',
						'- Confirm the export shape',
						'- Lock the QA owner',
						'- Schedule the dry run'
					].join('\n')
				)
			]
		},
		{
			id: 'message-system',
			role: 'system',
			parts: [statusPart('Streaming response from the assistant...', 'primary')]
		},
		{
			id: 'message-attachments',
			role: 'assistant',
			attachments: [sampleFileAttachment, sampleImageAttachment],
			parts: [textPart('Attachments can render before or alongside message content.')]
		},
		{
			id: 'message-custom',
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
		}
	];
</script>

<svelte:head>
	<title>@ljoukov/chat · ChatMessage</title>
</svelte:head>

<div class="gallery-page">
	<header class="gallery-page__intro">
		<div class="gallery-page__eyebrow">ChatMessage</div>
		<h1 class="gallery-page__title">Message states for user, assistant, system, and custom parts.</h1>
		<p class="gallery-page__description">
			A message can carry attachments plus an ordered list of text, markdown, thinking, status, task,
			and custom parts.
		</p>
	</header>

	<section class="gallery-stage">
		<div class="gallery-stage__header">
			<div>
				<p class="gallery-stage__title">Supported message states</p>
				<p class="gallery-stage__copy">
					Each example below is a single `ChatMessageData` object rendered in isolation.
				</p>
			</div>
		</div>

		<div class="gallery-grid gallery-grid--two">
			{#each messageStates as message (message.id)}
				<div class="gallery-frame">
					<ChatMessage {message}>
					{#snippet customPart(part: ChatCustomPart)}
							{#if part.key === 'agent-status'}
								<AgentStatusCard status={part.data as never} />
							{/if}
						{/snippet}
					</ChatMessage>
				</div>
			{/each}
		</div>
	</section>
</div>
