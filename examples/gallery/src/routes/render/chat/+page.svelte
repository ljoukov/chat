<script lang="ts">
	import {
		ChatComposer,
		ChatView,
		markdownPart,
		thinkingPart,
		type ChatAttachment,
		type ChatCustomPart,
		type ChatMessageData
	} from '@ljoukov/chat';
	import RenderSurface from '$lib/demo/RenderSurface.svelte';
	import AgentStatusCard from '$lib/demo/AgentStatusCard.svelte';
	import {
		makeUserMessage,
		sampleFileAttachment
	} from '$lib/demo/chat-demo.js';
	import { customPart } from '@ljoukov/chat';
	import { page } from '$app/state';
	import { resolveRenderTheme } from '$lib/demo/render.js';

	const theme = $derived(resolveRenderTheme(page.url.searchParams));

	let draft = $state('Keep the live status card visible and call out the owner.');
	let draftAttachments = $state<ChatAttachment[]>([{ ...sampleFileAttachment }]);

	const messages = [
		makeUserMessage(
			'render-chat-user',
			'Summarise the migration brief and keep the live agent status visible in the thread.',
			[{ ...sampleFileAttachment }]
		),
		{
			id: 'render-chat-assistant-copy',
			role: 'assistant',
			parts: [
				thinkingPart(
					'Pulling out the decision points first so the answer reads like an operating note, not a transcript.'
				),
				markdownPart(
					[
						'### Handoff note',
						'',
						'- Confirm the export owner before the dry run.',
						'- Keep the status surface in-thread so the run does not disappear into prose.',
						'- Treat the next decision as owner, date, and blocker in the same sentence.'
					].join('\n')
				)
			]
		},
		{
			id: 'render-chat-custom',
			role: 'assistant',
			parts: [
				customPart('agent-status', {
					progress: 72,
					stage: 'Collecting the final evidence bundle',
					summary:
						'The agent has already normalised the brief and is now reconciling the remaining open blockers.',
					title: 'Analysis agent',
					updates: [
						'Attached context pack',
						'Generated a condensed plan',
						'Waiting on one unresolved owner'
					]
				})
			]
		}
	] satisfies ChatMessageData[];
</script>

<svelte:head>
	<title>@ljoukov/chat · Render Chat Demo</title>
</svelte:head>

<RenderSurface component="chat" target="chat-demo" {theme} panelClass="gallery-render__panel--chat">
	<ChatView
		class="mx-auto w-full max-w-[66rem]"
		title="Agent thread"
		{messages}
	>
		{#snippet customPart(part: ChatCustomPart)}
			{#if part.key === 'agent-status'}
				<AgentStatusCard status={part.data as never} />
			{/if}
		{/snippet}

		{#snippet composer()}
			<div class="grid gap-3">
				<div class="render-attachment-row">
					{#each draftAttachments as attachment (attachment.id)}
						<div class="render-attachment-pill">
							<span class="text-sm font-medium">{attachment.name}</span>
							<small class="text-xs text-muted-foreground">
								{attachment.detail ?? attachment.badge ?? 'Attached'}
							</small>
						</div>
					{/each}
				</div>

				<ChatComposer
					bind:value={draft}
					submitMode="enter"
					attachAction={{ ariaLabel: 'Attach sample brief', icon: 'attach' }}
					cameraAction={{ ariaLabel: 'Attach sample image', icon: 'camera' }}
					micAction={{ ariaLabel: 'Prefix draft with voice note', icon: 'mic' }}
					submitReady={draft.trim().length > 0 || draftAttachments.length > 0}
				/>
			</div>
		{/snippet}
	</ChatView>
</RenderSurface>
