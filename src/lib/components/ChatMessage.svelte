<script lang="ts">
	import type { Snippet } from 'svelte';
	import { formatBytes } from '../internal/format.js';
	import type { ChatAttachment, ChatCustomPart, ChatMessageData } from '../types.js';
	import ChatMarkdown from './ChatMarkdown.svelte';
	import ChatTaskCard from './ChatTaskCard.svelte';

	type Props = {
		customPart?: Snippet<[part: ChatCustomPart, message: ChatMessageData]> | undefined;
		message: ChatMessageData;
	};

	let { message, customPart = undefined }: Props = $props();

	function resolveAttachmentKind(attachment: ChatAttachment): 'file' | 'image' {
		if (attachment.kind) {
			return attachment.kind;
		}
		if (attachment.contentType?.startsWith('image/') || attachment.src) {
			return 'image';
		}
		return 'file';
	}

	function resolveAttachmentMeta(attachment: ChatAttachment): string | null {
		if (attachment.detail) {
			return attachment.detail;
		}
		if (attachment.sizeLabel) {
			return attachment.sizeLabel;
		}
		return formatBytes(attachment.sizeBytes);
	}
</script>

<article class={`chat-message is-${message.role}`} aria-label={message.label ?? undefined}>
	{#if message.attachments && message.attachments.length > 0}
		<div class="chat-message__attachments">
			{#each message.attachments as attachment (attachment.id)}
				{@const kind = resolveAttachmentKind(attachment)}
				{@const meta = resolveAttachmentMeta(attachment)}
				{@const href = attachment.href ?? attachment.src}
				{#if kind === 'image' && attachment.src}
					<a class="chat-message__attachment is-image" href={href ?? undefined}>
						<img src={attachment.src} alt={attachment.alt ?? attachment.name} loading="lazy" />
						<span class="chat-message__attachment-name">{attachment.name}</span>
					</a>
				{:else}
					<a class="chat-message__attachment is-file" href={href ?? undefined}>
						<span class="chat-message__attachment-badge">{attachment.badge ?? 'FILE'}</span>
						<span class="chat-message__attachment-copy">
							<span class="chat-message__attachment-name">{attachment.name}</span>
							{#if meta}
								<span class="chat-message__attachment-meta">{meta}</span>
							{/if}
						</span>
					</a>
				{/if}
			{/each}
		</div>
	{/if}

	<div class="chat-message__bubble">
		{#each message.parts as part, index (part.type + index.toString())}
			{#if part.type === 'text'}
				<p class="chat-message__plain">{part.text}</p>
			{:else if part.type === 'markdown'}
				<ChatMarkdown class="chat-message__markdown" markdown={part.markdown} />
			{:else if part.type === 'thinking'}
				<div class="chat-message__thinking" data-collapsed={part.collapsed ?? false}>
					<p class="chat-message__thinking-label">{part.label ?? 'Thinking'}</p>
					<ChatMarkdown class="chat-message__thinking-body" markdown={part.markdown} />
				</div>
			{:else if part.type === 'status'}
				<p class={`chat-message__status is-${part.tone ?? 'muted'}`}>
					<span class="chat-message__status-spinner" aria-hidden="true"></span>
					{part.label}
				</p>
			{:else if part.type === 'task'}
				<ChatTaskCard task={part.task} />
			{:else if part.type === 'custom' && customPart}
				{@render customPart(part, message)}
			{/if}
		{/each}
	</div>
</article>

<style>
	.chat-message {
		display: grid;
		gap: 0.45rem;
		width: 100%;
		max-width: 100%;
	}

	.chat-message.is-user {
		justify-items: end;
	}

	.chat-message__attachments {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
		max-width: min(36rem, 100%);
	}

	.chat-message.is-user .chat-message__attachments {
		justify-content: flex-end;
	}

	.chat-message__attachment {
		display: inline-flex;
		flex-direction: column;
		gap: 0.35rem;
		min-width: 10rem;
		text-decoration: none;
		color: inherit;
	}

	.chat-message__attachment.is-image {
		width: clamp(12rem, 30vw, 15rem);
		padding: 0.375rem;
		border-radius: 1rem;
		border: 1px solid var(--lj-chat-attachment-border, rgba(228, 228, 231, 0.95));
		background: var(--lj-chat-attachment-bg, #ffffff);
		box-shadow: var(--lj-chat-attachment-shadow, 0 1px 2px rgba(15, 23, 42, 0.05));
	}

	.chat-message__attachment.is-image img {
		width: 100%;
		aspect-ratio: 4 / 3;
		object-fit: cover;
		border-radius: 0.75rem;
	}

	.chat-message__attachment.is-file {
		flex-direction: row;
		align-items: center;
		gap: 0.7rem;
		padding: 0.78rem 0.9rem;
		border-radius: 1rem;
		border: 1px solid var(--lj-chat-attachment-border, rgba(228, 228, 231, 0.95));
		background: var(--lj-chat-attachment-bg, #ffffff);
		box-shadow: var(--lj-chat-attachment-shadow, 0 1px 2px rgba(15, 23, 42, 0.05));
	}

	.chat-message__attachment-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 2.4rem;
		height: 2.4rem;
		padding: 0 0.5rem;
		border-radius: 999px;
		background: color-mix(in srgb, currentColor 6%, transparent);
		font-size: 0.68rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.chat-message__attachment-copy {
		display: grid;
		gap: 0.15rem;
		min-width: 0;
	}

	.chat-message__attachment-name {
		font-size: 0.88rem;
		font-weight: 600;
		line-height: 1.3;
	}

	.chat-message__attachment-meta {
		font-size: 0.76rem;
		color: color-mix(in srgb, currentColor 56%, transparent);
	}

	.chat-message__bubble {
		display: grid;
		gap: 0.8rem;
		max-width: min(44rem, 100%);
		width: 100%;
	}

	.chat-message.is-user .chat-message__bubble {
		width: auto;
		min-width: min(12rem, 100%);
		max-width: min(40rem, 100%);
		padding: 0.78rem 0.95rem 0.82rem;
		border-radius: 1rem 1rem 0.4rem 1rem;
		border: 1px solid var(--lj-chat-user-border, #18181b);
		background: var(--lj-chat-user-bg, #18181b);
		color: var(--lj-chat-user-fg, #fafafa);
	}

	.chat-message__plain,
	.chat-message__status {
		margin: 0;
	}

	.chat-message__plain {
		white-space: pre-wrap;
		line-height: 1.6;
	}

	.chat-message__markdown {
		font-size: 0.98rem;
		line-height: 1.68;
	}

	.chat-message__thinking {
		display: grid;
		gap: 0.35rem;
		padding: 0.7rem 0.8rem;
		border-radius: 0.875rem;
		border: 1px solid var(--lj-chat-thinking-border, rgba(228, 228, 231, 0.95));
		background: var(--lj-chat-thinking-bg, rgba(244, 244, 245, 0.8));
	}

	.chat-message__thinking-label {
		margin: 0;
		font-size: 0.68rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: color-mix(in srgb, currentColor 52%, transparent);
	}

	.chat-message__thinking-body {
		font-size: 0.82rem;
		line-height: 1.5;
		color: color-mix(in srgb, currentColor 74%, transparent);
	}

	.chat-message__status {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
	}

	.chat-message__status.is-muted {
		color: color-mix(in srgb, currentColor 62%, transparent);
	}

	.chat-message__status.is-primary {
		color: color-mix(in srgb, #2563eb 76%, currentColor);
	}

	.chat-message__status.is-critical {
		color: color-mix(in srgb, #dc2626 76%, currentColor);
	}

	.chat-message__status-spinner {
		width: 0.95rem;
		height: 0.95rem;
		border-radius: 999px;
		border: 2px solid color-mix(in srgb, currentColor 22%, transparent);
		border-top-color: currentColor;
		animation: chat-message-spin 0.78s linear infinite;
	}

	@keyframes chat-message-spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
