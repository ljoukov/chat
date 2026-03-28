<script lang="ts">
	import 'katex/dist/katex.min.css';
	import { renderChatMarkdown, renderChatMarkdownInline } from '../internal/markdown.js';

	let {
		markdown,
		inline = false,
		class: className = ''
	}: {
		class?: string;
		inline?: boolean;
		markdown: string;
	} = $props();

	let rootElement = $state<HTMLElement | null>(null);

	const renderedHtml = $derived.by(() => {
		const trimmed = markdown.trim();
		if (!trimmed) {
			return '';
		}
		return inline ? renderChatMarkdownInline(markdown) : renderChatMarkdown(markdown);
	});

	async function copyText(value: string): Promise<boolean> {
		if (typeof navigator === 'undefined') {
			return false;
		}
		if (navigator.clipboard?.writeText) {
			try {
				await navigator.clipboard.writeText(value);
				return true;
			} catch {
				// Fall through to execCommand for older browsers.
			}
		}
		if (typeof document === 'undefined') {
			return false;
		}
		try {
			const textarea = document.createElement('textarea');
			textarea.value = value;
			textarea.readOnly = true;
			textarea.style.position = 'fixed';
			textarea.style.opacity = '0';
			textarea.style.pointerEvents = 'none';
			document.body.appendChild(textarea);
			textarea.select();
			const success = document.execCommand('copy');
			textarea.remove();
			return success;
		} catch {
			return false;
		}
	}

	const resetTimers = new WeakMap<HTMLButtonElement, number>();

	function setCopyButtonState(
		button: HTMLButtonElement,
		state: 'copied' | 'empty' | 'error' | 'idle',
		label: string
	) {
		button.setAttribute('aria-label', label);
		if (state === 'idle') {
			delete button.dataset.copyState;
		} else {
			button.dataset.copyState = state;
		}
		const existing = resetTimers.get(button);
		if (existing !== undefined) {
			window.clearTimeout(existing);
		}
		const next = window.setTimeout(() => {
			button.setAttribute('aria-label', 'Copy code');
			delete button.dataset.copyState;
		}, 1400);
		resetTimers.set(button, next);
	}

	async function handleCodeCopyClick(event: MouseEvent) {
		const target = event.target as HTMLElement | null;
		const button = target?.closest<HTMLButtonElement>('[data-code-copy]');
		if (!button) {
			return;
		}
		event.preventDefault();
		const code = button.closest('.code-block')?.querySelector('code')?.textContent ?? '';
		if (!code) {
			setCopyButtonState(button, 'empty', 'No code');
			return;
		}
		const copied = await copyText(code);
		setCopyButtonState(button, copied ? 'copied' : 'error', copied ? 'Copied' : 'Copy failed');
	}

	$effect(() => {
		if (!rootElement || typeof window === 'undefined') {
			return;
		}
		const element = rootElement;
		element.addEventListener('click', handleCodeCopyClick);
		return () => {
			element.removeEventListener('click', handleCodeCopyClick);
		};
	});
</script>

{#if inline}
	<span bind:this={rootElement} class={`chat-markdown is-inline ${className}`.trim()}>
		{@html renderedHtml}
	</span>
{:else}
	<div bind:this={rootElement} class={`chat-markdown ${className}`.trim()}>
		{@html renderedHtml}
	</div>
{/if}

<style>
	.chat-markdown {
		color: var(--lj-chat-markdown-text, inherit);
		font: inherit;
		line-height: inherit;
	}

	.chat-markdown.is-inline {
		display: inline;
	}

	:global(.chat-markdown > * + *) {
		margin-top: 0.8rem;
	}

	:global(.chat-markdown h1),
	:global(.chat-markdown h2),
	:global(.chat-markdown h3),
	:global(.chat-markdown h4) {
		margin: 1rem 0 0.35rem;
		font-size: 1.03em;
		font-weight: 600;
		line-height: 1.35;
		color: var(--lj-chat-markdown-heading, currentColor);
	}

	:global(.chat-markdown p),
	:global(.chat-markdown ul),
	:global(.chat-markdown ol),
	:global(.chat-markdown blockquote) {
		margin: 0;
	}

	:global(.chat-markdown ul),
	:global(.chat-markdown ol) {
		padding-left: 1.2rem;
	}

	:global(.chat-markdown li + li) {
		margin-top: 0.28rem;
	}

	:global(.chat-markdown a) {
		color: var(--lj-chat-markdown-link, currentColor);
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 0.18em;
	}

	:global(.chat-markdown strong) {
		font-weight: 700;
	}

	:global(.chat-markdown blockquote) {
		padding-left: 0.9rem;
		border-left: 3px solid
			var(--lj-chat-markdown-quote-border, color-mix(in srgb, currentColor 18%, transparent));
		color: var(--lj-chat-markdown-quote-text, color-mix(in srgb, currentColor 76%, transparent));
	}

	:global(.chat-markdown :not(pre) > code) {
		padding: 0.12rem 0.34rem;
		border-radius: 0.4rem;
		background: var(--lj-chat-markdown-inline-code-bg, color-mix(in srgb, currentColor 10%, transparent));
		font-family: 'JetBrains Mono', 'SFMono-Regular', ui-monospace, monospace;
		font-size: 0.86em;
	}

	:global(.chat-markdown table) {
		width: 100%;
		border-collapse: collapse;
		border-radius: 0.9rem;
		overflow: hidden;
		border: 1px solid
			var(--lj-chat-markdown-table-border, color-mix(in srgb, currentColor 15%, transparent));
		font-size: 0.94em;
	}

	:global(.chat-markdown thead) {
		background: var(--lj-chat-markdown-table-head, color-mix(in srgb, currentColor 8%, transparent));
	}

	:global(.chat-markdown th),
	:global(.chat-markdown td) {
		padding: 0.55rem 0.68rem;
		text-align: left;
		border-bottom: 1px solid
			var(--lj-chat-markdown-table-border, color-mix(in srgb, currentColor 15%, transparent));
	}

	:global(.chat-markdown tbody tr:last-child td) {
		border-bottom: none;
	}

	:global(.chat-markdown .katex-display) {
		margin: 0.8rem 0;
		overflow-x: auto;
		overflow-y: hidden;
	}

	:global(.chat-markdown .code-block) {
		margin: 0.9rem 0;
		border-radius: 0.95rem;
		border: 1px solid var(--lj-chat-markdown-code-border, rgba(148, 163, 184, 0.25));
		background: var(--lj-chat-markdown-code-bg, rgba(15, 23, 42, 0.96));
		color: var(--lj-chat-markdown-code-text, rgba(241, 245, 249, 0.98));
		overflow: hidden;
		box-shadow: 0 18px 42px -32px rgba(15, 23, 42, 0.52);
	}

	:global(.chat-markdown .code-block__header) {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.55rem 0.85rem;
		border-bottom: 1px solid
			var(--lj-chat-markdown-code-header-border, color-mix(in srgb, white 8%, transparent));
		background: var(
			--lj-chat-markdown-code-header-bg,
			color-mix(in srgb, var(--lj-chat-markdown-code-bg, rgba(15, 23, 42, 0.96)) 88%, white 12%)
		);
	}

	:global(.chat-markdown .code-block__lang) {
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--lj-chat-markdown-code-header-fg, color-mix(in srgb, white 74%, transparent));
	}

	:global(.chat-markdown .code-block__copy) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border-radius: 999px;
		border: none;
		background: var(--lj-chat-markdown-code-copy-bg, color-mix(in srgb, white 10%, transparent));
		color: inherit;
	}

	:global(.chat-markdown .code-block__copy[data-copy-state='copied']) {
		background: color-mix(in srgb, #4ade80 26%, transparent);
	}

	:global(.chat-markdown .code-block__copy[data-copy-state='error']),
	:global(.chat-markdown .code-block__copy[data-copy-state='empty']) {
		background: color-mix(in srgb, #f87171 26%, transparent);
	}

	:global(.chat-markdown .code-block__copy-icon) {
		width: 1rem;
		height: 1rem;
		fill: none;
		stroke: currentColor;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 1.8;
	}

	:global(.chat-markdown pre) {
		margin: 0;
		padding: 1rem 1rem 1.1rem;
		overflow-x: auto;
	}

	:global(.chat-markdown pre code) {
		font-family: 'JetBrains Mono', 'SFMono-Regular', ui-monospace, monospace;
		font-size: 0.84rem;
		line-height: 1.75;
	}

	:global(.chat-markdown .hljs-keyword),
	:global(.chat-markdown .hljs-built_in) {
		color: #93c5fd;
	}

	:global(.chat-markdown .hljs-string),
	:global(.chat-markdown .hljs-title) {
		color: #86efac;
	}

	:global(.chat-markdown .hljs-number),
	:global(.chat-markdown .hljs-literal) {
		color: #fdba74;
	}

	:global(.chat-markdown .hljs-comment) {
		color: rgba(148, 163, 184, 0.78);
	}

	:global(.chat-markdown .sr-only) {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
