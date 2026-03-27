<script lang="ts">
	import {
		ChatComposer,
		ChatView,
		type ChatAttachment,
		type ChatCustomPart,
		type ChatMessageData
	} from '@ljoukov/chat';
	import { Button, buttonVariants } from '$demo/components/ui/button/index.js';
	import * as Card from '$demo/components/ui/card/index.js';
	import AgentStatusCard from '$lib/demo/AgentStatusCard.svelte';
	import {
		buildAssistantParts,
		emptySuggestions,
		makeUserMessage,
		placeholderMessage,
		sampleFileAttachment,
		sampleImageAttachment
	} from '$lib/demo/chat-demo.js';

	let draft = $state('');
	let draftAttachments = $state<ChatAttachment[]>([]);
	let messages = $state<ChatMessageData[]>([
		makeUserMessage('seed-user', 'Show an embedded custom agent status card for this run.', [
			{ ...sampleFileAttachment }
		]),
		{
			id: 'seed-assistant',
			role: 'assistant',
			parts: buildAssistantParts('Show an embedded custom agent status card for this run.')
		}
	]);

	const promptIdeas = [
		{
			copy: 'Render the custom extension surface inside the thread instead of plain text.',
			label: 'Custom status card',
			value: 'Show an embedded custom agent status card for this run.'
		},
		{
			copy: 'Exercise markdown tables plus a status block in the same assistant reply.',
			label: 'Table + task card',
			value: 'Show a markdown table and then render a task card for the run.'
		},
		{
			copy: 'Keep the answer short and operational so the composer remains the focal control.',
			label: 'Tight handoff note',
			value: 'Summarise this brief and leave a handoff note.'
		},
		{
			copy: 'Show the generic task card state with progress and follow-up actions.',
			label: 'Task card',
			value: 'Render a task card for the current run.'
		}
	] as const;

	function createId(prefix: string): string {
		if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
			return `${prefix}-${crypto.randomUUID()}`;
		}
		return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
	}

	function resetThread() {
		messages = [];
		draft = '';
		draftAttachments = [];
	}

	function addDraftAttachment(attachment: ChatAttachment) {
		const exists = draftAttachments.some((entry) => entry.id === attachment.id);
		if (exists) {
			return;
		}
		draftAttachments = [...draftAttachments, attachment];
	}

	function removeDraftAttachment(id: string) {
		draftAttachments = draftAttachments.filter((attachment) => attachment.id !== id);
	}

	function sendMessage(text: string) {
		const trimmed = text.trim();
		if (!trimmed && draftAttachments.length === 0) {
			return;
		}

		const userMessageId = createId('user');
		const assistantMessageId = createId('assistant');
		const attachments = draftAttachments.map((attachment) => ({ ...attachment }));

		messages = [
			...messages,
			makeUserMessage(userMessageId, trimmed || 'Attached context only.', attachments),
			placeholderMessage(assistantMessageId)
		];

		draft = '';
		draftAttachments = [];

		window.setTimeout(() => {
			messages = messages.map((message) =>
				message.id === assistantMessageId
					? {
							...message,
							parts: buildAssistantParts(trimmed)
						}
					: message
			);
		}, 780);
	}
</script>

<svelte:head>
	<title>@ljoukov/chat Chat Demo</title>
</svelte:head>

<div class="gallery-page gallery-page--wide">
	<header class="gallery-page__intro">
		<div class="gallery-page__eyebrow">Chat in action</div>
		<h1 class="gallery-page__title">One public API driving a live assistant surface.</h1>
		<p class="gallery-page__description">
			This route uses only the exported package primitives. The live thread stays primary while prompt
			presets, mocked attachments, and extension examples sit beside it.
		</p>
	</header>

	<section class="gallery-stage">
		<div class="gallery-stage__header">
			<div>
				<p class="gallery-stage__title">Interactive thread</p>
				<p class="gallery-stage__copy">
					Send a prompt, attach mocked files, and watch the placeholder assistant reply resolve into
					structured content.
				</p>
			</div>
			<Button type="button" variant="outline" size="sm" onclick={resetThread}>New thread</Button>
		</div>

		<div class="gallery-grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(19rem,0.8fr)] xl:items-start">
			<div class="gallery-canvas">
				<ChatView
					class="min-h-[40rem]"
					emptyDescription="Pick a prompt in the side rail or write your own. The extension hook still renders app-specific cards without changing the package."
					emptySuggestions={emptySuggestions}
					{messages}
				>
					{#snippet customPart(part: ChatCustomPart)}
						{#if part.key === 'agent-status'}
							<AgentStatusCard status={part.data as never} />
						{/if}
					{/snippet}

					{#snippet composer()}
						<div class="grid gap-3">
							{#if draftAttachments.length > 0}
								<div class="grid gap-2 sm:grid-cols-2">
									{#each draftAttachments as attachment (attachment.id)}
										<button
											type="button"
											class="grid gap-0.5 rounded-lg border bg-background px-3 py-2 text-left shadow-xs transition-colors hover:bg-accent"
											onclick={() => removeDraftAttachment(attachment.id)}
										>
											<span class="text-sm font-medium">{attachment.name}</span>
											<small class="text-xs text-muted-foreground">
												{attachment.detail ?? attachment.badge ?? 'Attached'}
											</small>
										</button>
									{/each}
								</div>
							{/if}

							<ChatComposer
								bind:value={draft}
								submitMode="enter"
								attachAction={{
									ariaLabel: 'Attach sample brief',
									icon: 'attach',
									onClick: () => addDraftAttachment(sampleFileAttachment)
								}}
								cameraAction={{
									ariaLabel: 'Attach sample image',
									icon: 'camera',
									onClick: () => addDraftAttachment(sampleImageAttachment)
								}}
								micAction={{
									ariaLabel: 'Prefix draft with voice note',
									icon: 'mic',
									onClick: () => {
										draft = draft.startsWith('Voice note:') ? draft : `Voice note: ${draft}`.trim();
									}
								}}
								submitReady={draft.trim().length > 0 || draftAttachments.length > 0}
								onSubmit={({ value }) => sendMessage(value)}
							/>
						</div>
					{/snippet}
				</ChatView>
			</div>

			<div class="grid gap-4">
				<Card.Root>
					<Card.Header class="border-b">
						<Card.Title>Prompt ideas</Card.Title>
						<Card.Description>Exercise task cards, markdown, and custom parts.</Card.Description>
					</Card.Header>

					<Card.Content class="grid gap-3 pt-6">
						{#each promptIdeas as prompt (prompt.label)}
							<button
								type="button"
								class="rounded-xl border bg-background p-4 text-left transition-colors hover:bg-accent/50"
								onclick={() => {
									draft = prompt.value;
								}}
							>
								<span class="text-sm font-medium">{prompt.label}</span>
								<span class="mt-2 block text-sm leading-6 text-muted-foreground">
									{prompt.copy}
								</span>
							</button>
						{/each}
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header class="border-b">
						<Card.Title>Assets and routes</Card.Title>
						<Card.Description>Attachments live in the same public message model.</Card.Description>
					</Card.Header>

					<Card.Content class="space-y-3 pt-6">
						<Button
							type="button"
							variant="secondary"
							class="w-full justify-start"
							onclick={() => addDraftAttachment(sampleFileAttachment)}
						>
							Attach sample brief
						</Button>
						<Button
							type="button"
							variant="secondary"
							class="w-full justify-start"
							onclick={() => addDraftAttachment(sampleImageAttachment)}
						>
							Attach sample screenshot
						</Button>
						<div class="border-t pt-3"></div>
						<a
							class={`${buttonVariants({ variant: 'outline' })} w-full justify-start`}
							href="/components/message"
						>
							Inspect message states
						</a>
						<a
							class={`${buttonVariants({ variant: 'outline' })} w-full justify-start`}
							href="/components/thread"
						>
							Inspect ChatView
						</a>
					</Card.Content>
				</Card.Root>
			</div>
		</div>
	</section>
</div>
