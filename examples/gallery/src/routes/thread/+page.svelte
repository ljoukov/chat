<script lang="ts">
	import {
		ChatComposer,
		ChatView,
		customPart,
		type ChatCustomPart,
		type ChatMessageData
	} from '@ljoukov/chat';
	import { Button } from '$demo/components/ui/button/index.js';
	import AgentStatusCard from '$lib/demo/AgentStatusCard.svelte';
	import { emptySuggestions } from '$lib/demo/chat-demo.js';
	import { threadMessages } from '$lib/demo-data.js';

	let emptyDraft = $state('');
	let threadDraft = $state('Show the owner and the dry-run date in the reply.');

	const extendedThread = [
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
	<title>@ljoukov/chat · ChatView</title>
</svelte:head>

<div class="gallery-page gallery-page--wide">
	<header class="gallery-page__intro">
		<div class="gallery-page__eyebrow">Thread</div>
		<h1 class="gallery-page__title">Thread shells for empty states, mapped transcripts, and toolbars.</h1>
		<p class="gallery-page__description">
			<code>ChatView</code> owns the thread surface while routes decide how to provide toolbars,
			composers, and custom-part rendering.
		</p>
	</header>

	<section class="gallery-grid gallery-grid--two">
		<div class="gallery-stage">
			<div class="gallery-stage__header">
				<div>
					<p class="gallery-stage__title">Empty state</p>
					<p class="gallery-stage__copy">
						Title, description, suggestions, and composer can all be provided without any messages.
					</p>
				</div>
			</div>

			<div class="gallery-canvas">
				<ChatView
					title="Start a thread"
					description="A route can pair the empty state with its own prompt suggestions."
					emptyDescription="Choose a suggestion or type your own prompt below."
					emptySuggestions={emptySuggestions}
					messages={[]}
				>
					{#snippet toolbar()}
						<Button type="button" variant="outline" size="sm">New thread</Button>
					{/snippet}

					{#snippet composer()}
						<ChatComposer bind:value={emptyDraft} submitMode="enter" />
					{/snippet}
				</ChatView>
			</div>
		</div>

		<div class="gallery-stage">
			<div class="gallery-stage__header">
				<div>
					<p class="gallery-stage__title">Mapped transcript</p>
					<p class="gallery-stage__copy">
						Text, markdown, attachments, task cards, and custom parts can all coexist in the same thread.
					</p>
				</div>
			</div>

			<div class="gallery-canvas">
				<ChatView
					class="min-h-[36rem]"
					title="Agent thread"
					description="A mapped message array stays small and stable even as the app adds custom UI."
					messages={extendedThread}
				>
					{#snippet toolbar()}
						<Button type="button" variant="outline" size="sm">Export transcript</Button>
					{/snippet}

					{#snippet customPart(part: ChatCustomPart)}
						{#if part.key === 'agent-status'}
							<AgentStatusCard status={part.data as never} />
						{/if}
					{/snippet}

					{#snippet composer()}
						<ChatComposer bind:value={threadDraft} submitMode="enter" />
					{/snippet}
				</ChatView>
			</div>
		</div>
	</section>
</div>
