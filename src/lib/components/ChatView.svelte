<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ChatCustomPart, ChatMessageData, ChatSuggestion } from '../types.js';
	import ChatMessage from './ChatMessage.svelte';

	type Props = {
		class?: string;
		composer?: Snippet | undefined;
		customPart?: Snippet<[part: ChatCustomPart, message: ChatMessageData]> | undefined;
		description?: string;
		emptyDescription?: string;
		emptySuggestions?: ChatSuggestion[];
		emptyTitle?: string;
		messages?: ChatMessageData[];
		title?: string;
		toolbar?: Snippet | undefined;
	};

	let {
		messages = [],
		title = undefined,
		description = undefined,
		toolbar = undefined,
		composer = undefined,
		customPart = undefined,
		emptyTitle = 'Start a new conversation',
		emptyDescription = 'Use the composer below to send your first message.',
		emptySuggestions = [],
		class: className = ''
	}: Props = $props();
</script>

<section class={`chat-view ${className}`.trim()} aria-label={title ?? 'Chat'}>
	{#if title || description || toolbar}
		<header class="chat-view__header">
			<div class="chat-view__heading">
				{#if title}
					<h2>{title}</h2>
				{/if}
				{#if description}
					<p>{description}</p>
				{/if}
			</div>
			{#if toolbar}
				<div class="chat-view__toolbar">
					{@render toolbar()}
				</div>
			{/if}
		</header>
	{/if}

	<div class="chat-view__thread" aria-live="polite" aria-relevant="additions text">
		{#if messages.length === 0}
			<div class="chat-view__empty">
				<h3>{emptyTitle}</h3>
				<p>{emptyDescription}</p>
				{#if emptySuggestions.length > 0}
					<div class="chat-view__suggestions">
						{#each emptySuggestions as suggestion, index (suggestion.id ?? suggestion.label + index.toString())}
							<span>{suggestion.label}</span>
						{/each}
					</div>
				{/if}
			</div>
		{:else}
			<div class="chat-view__messages">
				{#each messages as message (message.id)}
					<div class="chat-view__message">
						<ChatMessage {customPart} {message} />
					</div>
				{/each}
			</div>
		{/if}
	</div>

	{#if composer}
		<div class="chat-view__composer">
			{@render composer()}
		</div>
	{/if}
</section>

<style>
	.chat-view {
		display: grid;
		gap: 1.25rem;
		min-height: 0;
		padding: clamp(0.875rem, 2vw, 1.25rem);
		border-radius: var(--lj-chat-shell-radius, 1rem);
		border: 1px solid var(--lj-chat-shell-border, rgba(228, 228, 231, 0.95));
		background: var(--lj-chat-shell-bg, #ffffff);
		box-shadow: var(--lj-chat-shell-shadow, 0 1px 2px rgba(15, 23, 42, 0.05));
	}

	.chat-view__header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
	}

	.chat-view__heading {
		display: grid;
		gap: 0.35rem;
	}

	.chat-view__heading h2,
	.chat-view__empty h3 {
		margin: 0;
		font-size: clamp(1.2rem, 2vw, 1.5rem);
		line-height: 1.1;
	}

	.chat-view__heading p,
	.chat-view__empty p {
		margin: 0;
		color: color-mix(in srgb, currentColor 66%, transparent);
		line-height: 1.55;
	}

	.chat-view__toolbar {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: 0.6rem;
	}

	.chat-view__thread {
		min-height: clamp(16rem, 42vh, 28rem);
	}

	.chat-view__messages {
		display: grid;
		gap: 1.3rem;
	}

	.chat-view__message {
		animation: chat-view-message-in 320ms cubic-bezier(0.2, 0.9, 0.2, 1) both;
	}

	.chat-view__empty {
		display: grid;
		gap: 0.8rem;
		padding: clamp(1.2rem, 4vw, 2rem);
		border-radius: 0.875rem;
		border: 1px solid var(--lj-chat-empty-border, rgba(228, 228, 231, 0.95));
		background: var(--lj-chat-empty-bg, rgba(250, 250, 250, 0.85));
		text-align: center;
	}

	.chat-view__suggestions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.55rem;
	}

	.chat-view__suggestions span {
		display: inline-flex;
		align-items: center;
		min-height: 2.1rem;
		padding: 0.4rem 0.75rem;
		border-radius: 999px;
		background: var(--lj-chat-suggestion-bg, rgba(255, 255, 255, 0.96));
		border: 1px solid var(--lj-chat-suggestion-border, rgba(228, 228, 231, 0.95));
		font-size: 0.88rem;
	}

	.chat-view__composer {
		position: sticky;
		bottom: 0;
		padding-top: 0.2rem;
	}

	@keyframes chat-view-message-in {
		from {
			opacity: 0;
			transform: translateY(12px);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 720px) {
		.chat-view {
			padding: 0.85rem;
			border-radius: 0.875rem;
		}

		.chat-view__header {
			flex-direction: column;
		}
	}
</style>
