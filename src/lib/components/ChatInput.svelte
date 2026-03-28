<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	type Variant = 'chat' | 'default';
	type SubmitMode = 'enter' | 'modEnter';

	type Props = {
		ariaLabel?: string;
		autocomplete?: HTMLTextareaAttributes['autocomplete'];
		class?: string;
		disabled?: boolean;
		inputClass?: string;
		maxChars?: number;
		maxLines?: number;
		onInput?: ((detail: { isExpanded: boolean; value: string }) => void) | undefined;
		onLayoutChange?: ((detail: { isExpanded: boolean; value: string }) => void) | undefined;
		onPaste?: ((event: ClipboardEvent) => void) | undefined;
		onSubmit?: ((detail: { value: string }) => void) | undefined;
		placeholder?: string;
		spellcheck?: boolean;
		submitMode?: SubmitMode;
		value?: string;
		variant?: Variant;
	};

	let {
		value = $bindable(''),
		placeholder = 'Type your message',
		disabled = false,
		maxLines = 7,
		maxChars = 1000,
		ariaLabel = 'Message',
		autocomplete = 'off',
		spellcheck = false,
		class: className = '',
		inputClass = '',
		variant = 'default',
		submitMode = 'modEnter',
		onInput = undefined,
		onLayoutChange = undefined,
		onSubmit = undefined,
		onPaste = undefined
	}: Props = $props();

	let textareaElement = $state<HTMLTextAreaElement | null>(null);
	let expanded = $state(false);
	let lastLayoutValue = $state(value);
	let lastLayoutExpanded = $state(false);

	function resizeTextarea() {
		if (!textareaElement) {
			return;
		}

		textareaElement.style.height = 'auto';

		const style = getComputedStyle(textareaElement);
		const lineHeight = Number.parseFloat(style.lineHeight) || 20;
		const paddingTop = Number.parseFloat(style.paddingTop) || 0;
		const paddingBottom = Number.parseFloat(style.paddingBottom) || 0;
		const hasValue = value.length > 0;
		const wantsExtraLine = variant === 'chat' && value.includes('\n');
		const singleHeight = lineHeight + paddingTop + paddingBottom;
		const hasVisualOverflow = textareaElement.scrollHeight > singleHeight + 1;

		expanded = hasValue && (wantsExtraLine || hasVisualOverflow);

		const isExpanded = hasValue && (expanded || wantsExtraLine);
		const baseMinLines = wantsExtraLine ? 3 : expanded ? 2 : 1;
		const minLines = Math.min(maxLines, baseMinLines);
		const minHeight = lineHeight * minLines + paddingTop + paddingBottom;
		const maxHeight = lineHeight * maxLines + paddingTop + paddingBottom;
		const nextHeight = Math.min(Math.max(textareaElement.scrollHeight, minHeight), maxHeight);

		textareaElement.style.height = `${nextHeight}px`;
		textareaElement.style.overflowY = textareaElement.scrollHeight > maxHeight ? 'auto' : 'hidden';
		textareaElement.dataset.expanded = isExpanded ? 'true' : 'false';

		if (lastLayoutExpanded !== isExpanded || lastLayoutValue !== value) {
			lastLayoutExpanded = isExpanded;
			lastLayoutValue = value;
			onLayoutChange?.({ isExpanded, value });
		}
	}

	function handleInput(event: Event) {
		const target = event.currentTarget as HTMLTextAreaElement;
		value = target.value;
		resizeTextarea();
		onInput?.({ isExpanded: target.dataset.expanded === 'true', value });
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key !== 'Enter' || event.isComposing) {
			return;
		}

		if (submitMode === 'enter') {
			if (event.shiftKey) {
				return;
			}

			event.preventDefault();
			const trimmed = value.trim();
			if (trimmed) {
				onSubmit?.({ value: trimmed });
			}
			return;
		}

		if (event.metaKey || event.ctrlKey) {
			event.preventDefault();
			const trimmed = value.trim();
			if (trimmed) {
				onSubmit?.({ value: trimmed });
			}
		}
	}

	$effect(() => {
		void value;
		resizeTextarea();
	});

	$effect(() => {
		if (!textareaElement || typeof ResizeObserver === 'undefined') {
			return;
		}

		const observedTarget = textareaElement.parentElement ?? textareaElement;
		let frameId = 0;
		let lastObservedWidth = observedTarget.getBoundingClientRect().width;

		const scheduleResize = () => {
			if (frameId) {
				cancelAnimationFrame(frameId);
			}

			frameId = requestAnimationFrame(() => {
				frameId = 0;
				resizeTextarea();
			});
		};

		const observer = new ResizeObserver((entries) => {
			const entry = entries[0];
			const nextWidth = entry?.contentRect.width ?? observedTarget.getBoundingClientRect().width;
			if (Math.abs(nextWidth - lastObservedWidth) < 0.5) {
				return;
			}

			lastObservedWidth = nextWidth;
			scheduleResize();
		});

		observer.observe(observedTarget);

		return () => {
			if (frameId) {
				cancelAnimationFrame(frameId);
			}
			observer.disconnect();
		};
	});
</script>

<textarea
	bind:this={textareaElement}
	bind:value
	rows={1}
	maxlength={maxChars}
	autocomplete={autocomplete}
	aria-label={ariaLabel}
	class={`chat-input chat-input--${variant} ${className} ${inputClass}`.trim()}
	data-expanded={expanded}
	{disabled}
	{placeholder}
	{spellcheck}
	oninput={handleInput}
	onkeydown={handleKeyDown}
	onpaste={(event) => onPaste?.(event)}
></textarea>

<style>
	.chat-input {
		width: 100%;
		resize: none;
		appearance: none;
		border: 0;
		background: transparent;
		color: inherit;
		font: inherit;
		outline: none;
	}

	.chat-input::placeholder {
		color: var(--lj-chat-input-placeholder, color-mix(in srgb, currentColor 62%, transparent));
	}

	.chat-input--default {
		min-height: 2.75rem;
		padding: 0.75rem 1rem;
		border: 2px solid var(--lj-chat-input-border, rgba(228, 228, 231, 0.95));
		border-radius: 1rem;
		background: var(--lj-chat-input-bg, #ffffff);
		box-shadow:
			var(--lj-chat-input-shadow, 0 1px 2px rgba(15, 23, 42, 0.04)),
			inset 0 1px 0 rgba(255, 255, 255, 0.65);
		font-size: 1rem;
		line-height: 1.45;
		transition:
			border-color 140ms ease,
			box-shadow 140ms ease,
			background-color 140ms ease;
	}

	.chat-input--default:focus,
	.chat-input--default:focus-visible {
		border-color: var(--lj-chat-input-focus-border, rgba(113, 113, 122, 0.95));
		box-shadow:
			0 0 0 4px var(--lj-chat-input-ring, rgba(15, 23, 42, 0.12)),
			inset 0 1px 0 rgba(255, 255, 255, 0.65);
	}

	.chat-input--chat {
		min-height: 0;
		padding: 0.15rem 0.2rem 0.25rem;
		font-size: 0.95rem;
		line-height: 1.5rem;
	}

	.chat-input:disabled {
		cursor: not-allowed;
		opacity: 0.68;
	}
</style>
