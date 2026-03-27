<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';
	import type { ChatComposerAction } from '../types.js';
	import ChatInput from './ChatInput.svelte';

	type SubmitMode = 'enter' | 'modEnter';

	type Props = {
		ariaLabel?: string;
		attachAction?: ChatComposerAction | undefined;
		attachmentShortcutLabel?: string | null;
		autocomplete?: HTMLTextareaAttributes['autocomplete'];
		cameraAction?: ChatComposerAction | undefined;
		class?: string;
		compactSubmitSpinner?: boolean;
		disabled?: boolean;
		inputClass?: string;
		maxChars?: number;
		maxLines?: number;
		micAction?: ChatComposerAction | undefined;
		onInput?: ((detail: { isExpanded: boolean; value: string }) => void) | undefined;
		onPaste?: ((event: ClipboardEvent) => void) | undefined;
		onSubmit?: ((detail: { value: string }) => void) | undefined;
		placeholder?: string;
		sendAriaLabel?: string;
		showSubmitSpinner?: boolean;
		spellcheck?: boolean;
		submitMode?: SubmitMode;
		submitReady?: boolean;
		value?: string;
	};

	let {
		value = $bindable(''),
		placeholder = 'Ask anything',
		disabled = false,
		showSubmitSpinner = false,
		compactSubmitSpinner = false,
		maxLines = 8,
		maxChars = 12_000,
		ariaLabel = 'Message',
		sendAriaLabel = 'Send message',
		autocomplete = 'off',
		spellcheck = false,
		class: className = '',
		inputClass = '',
		submitMode = 'enter',
		submitReady = undefined,
		attachmentShortcutLabel = null,
		attachAction = undefined,
		cameraAction = undefined,
		micAction = undefined,
		onInput = undefined,
		onSubmit = undefined,
		onPaste = undefined
	}: Props = $props();

	let expanded = $state(value.includes('\n'));
	let inputValue = $state('');
	let compactSpinnerVisible = $state(false);
	let preparingCompactSpinner = $state(false);

	inputValue = value;

	const canSubmit = $derived.by(() => {
		if (typeof submitReady === 'boolean') {
			return submitReady && !disabled;
		}
		return !disabled && inputValue.trim().length > 0;
	});

	const wantsCompactSpinnerShell = $derived(showSubmitSpinner && compactSubmitSpinner);
	const showCompactSpinnerShell = $derived(compactSpinnerVisible);

	function handleInput(detail: { isExpanded: boolean; value: string }) {
		inputValue = detail.value;
		value = detail.value;
		expanded = detail.isExpanded;
		onInput?.(detail);
	}

	function handleSubmit() {
		const trimmed = inputValue.trim();
		if (!trimmed || !canSubmit || disabled || showSubmitSpinner) {
			return;
		}
		onSubmit?.({ value: trimmed });
	}

	function triggerAction(action: ChatComposerAction | undefined) {
		if (!action || disabled || action.disabled) {
			return;
		}
		action.onClick?.();
	}

	function resolveActionTitle(action: ChatComposerAction | undefined): string | undefined {
		if (!action) {
			return undefined;
		}
		if (!attachmentShortcutLabel || action.icon !== 'attach') {
			return action.ariaLabel;
		}
		return `${action.ariaLabel} (${attachmentShortcutLabel})`;
	}

	$effect(() => {
		if (preparingCompactSpinner || compactSpinnerVisible) {
			return;
		}
		inputValue = value;
	});

	$effect(() => {
		if (!wantsCompactSpinnerShell) {
			preparingCompactSpinner = false;
			compactSpinnerVisible = false;
			inputValue = value;
			return;
		}

		preparingCompactSpinner = true;
		compactSpinnerVisible = false;
		inputValue = '';
		let cancelled = false;

		void (async () => {
			await Promise.resolve();
			if (cancelled) {
				return;
			}
			compactSpinnerVisible = true;
			preparingCompactSpinner = false;
		})();

		return () => {
			cancelled = true;
		};
	});
</script>

<div class={`chat-composer-stack ${showCompactSpinnerShell ? 'is-spinner-only' : ''} ${className}`.trim()}>
	<div class={`chat-composer-shell ${showCompactSpinnerShell ? 'is-spinner-only' : ''}`}>
		<div
			class={`chat-composer-field ${expanded ? 'is-expanded' : ''} ${showCompactSpinnerShell ? 'is-spinner-only' : ''}`}
		>
			{#if (attachAction || cameraAction) && !showCompactSpinnerShell}
				<div class="chat-composer-leading">
					{#if attachAction}
						<button
							type="button"
							class="chat-composer-button"
							aria-label={attachAction.ariaLabel}
							title={resolveActionTitle(attachAction)}
							disabled={disabled || attachAction.disabled}
							onclick={() => triggerAction(attachAction)}
						>
							<svg viewBox="0 0 24 24" aria-hidden="true">
								<path
									d="M10 9V15C10 16.1046 10.8954 17 12 17C13.1046 17 14 16.1046 14 15V7C14 4.79086 12.2091 3 10 3C7.79086 3 6 4.79086 6 7V15C6 18.3137 8.68629 21 12 21C15.3137 21 18 18.3137 18 15V8"
									fill="none"
									stroke="currentColor"
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="1.8"
								/>
							</svg>
						</button>
					{/if}

					{#if cameraAction}
						<button
							type="button"
							class="chat-composer-button"
							aria-label={cameraAction.ariaLabel}
							title={cameraAction.ariaLabel}
							disabled={disabled || cameraAction.disabled}
							onclick={() => triggerAction(cameraAction)}
						>
							<svg viewBox="0 0 24 24" aria-hidden="true">
								<path
									d="M4 8.5C4 7.67157 4.67157 7 5.5 7H8L9.6 5H14.4L16 7H18.5C19.3284 7 20 7.67157 20 8.5V17.5C20 18.3284 19.3284 19 18.5 19H5.5C4.67157 19 4 18.3284 4 17.5V8.5Z"
									fill="none"
									stroke="currentColor"
									stroke-linejoin="round"
									stroke-width="1.8"
								/>
								<circle
									cx="12"
									cy="13"
									r="3.25"
									fill="none"
									stroke="currentColor"
									stroke-width="1.8"
								/>
							</svg>
						</button>
					{/if}
				</div>
			{/if}

			{#if !showCompactSpinnerShell}
				<div class="chat-composer-input">
					<ChatInput
						bind:value={inputValue}
						{ariaLabel}
						{autocomplete}
						{disabled}
						{inputClass}
						{maxChars}
						{maxLines}
						placeholder={showCompactSpinnerShell ? '' : placeholder}
						{spellcheck}
						{submitMode}
						variant="chat"
						class="chat-composer__textarea"
						{onPaste}
						onInput={handleInput}
						onLayoutChange={({ isExpanded, value: nextValue }) => {
							expanded = isExpanded;
							value = nextValue;
						}}
						onSubmit={handleSubmit}
					/>
				</div>
			{/if}

			<div class={`chat-composer-trailing ${showCompactSpinnerShell ? 'is-spinner-only' : ''}`}>
				{#if micAction && !showCompactSpinnerShell}
					<button
						type="button"
						class="chat-composer-button"
						aria-label={micAction.ariaLabel}
						title={micAction.ariaLabel}
						disabled={disabled || micAction.disabled}
						onclick={() => triggerAction(micAction)}
					>
						<svg viewBox="0 0 24 24" aria-hidden="true">
							<path
								d="M12 15C13.6569 15 15 13.6569 15 12V7C15 5.34315 13.6569 4 12 4C10.3431 4 9 5.34315 9 7V12C9 13.6569 10.3431 15 12 15Z"
								fill="none"
								stroke="currentColor"
								stroke-width="1.8"
							/>
							<path
								d="M6.5 11.5C6.5 14.5376 8.96243 17 12 17C15.0376 17 17.5 14.5376 17.5 11.5"
								fill="none"
								stroke="currentColor"
								stroke-linecap="round"
								stroke-width="1.8"
							/>
							<path
								d="M12 17V20"
								fill="none"
								stroke="currentColor"
								stroke-linecap="round"
								stroke-width="1.8"
							/>
						</svg>
					</button>
				{/if}

				<button
					type="button"
					class={`chat-composer-button is-send ${showCompactSpinnerShell ? 'is-spinner-only' : ''}`}
					aria-label={sendAriaLabel}
					disabled={showSubmitSpinner || !canSubmit}
					onclick={handleSubmit}
				>
					{#if showSubmitSpinner}
						<span class="chat-composer-spinner" aria-hidden="true"></span>
					{:else}
						<svg viewBox="0 0 24 24" aria-hidden="true">
							<path
								d="M12 5V19"
								fill="none"
								stroke="currentColor"
								stroke-linecap="round"
								stroke-width="1.9"
							/>
							<path
								d="M6.5 10.5L12 5L17.5 10.5"
								fill="none"
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.9"
							/>
						</svg>
					{/if}
				</button>
			</div>

			{#if !showCompactSpinnerShell}
				<div class="chat-composer-spacer" aria-hidden="true"></div>
			{/if}
		</div>
	</div>
</div>

<style>
	.chat-composer-stack {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.chat-composer-stack.is-spinner-only {
		align-items: flex-end;
	}

	.chat-composer-shell {
		padding: 0.62rem;
		border-radius: 1rem;
		border: 1px solid var(--lj-chat-composer-border, rgba(228, 228, 231, 0.95));
		background: var(--lj-chat-composer-bg, #ffffff);
		box-shadow: var(--lj-chat-composer-shadow, 0 1px 2px rgba(15, 23, 42, 0.04));
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		overflow: clip;
		background-clip: padding-box;
		transition:
			padding 0.2s ease,
			border-radius 0.2s ease,
			background 0.2s ease,
			border-color 0.2s ease,
			box-shadow 0.2s ease;
	}

	.chat-composer-shell.is-spinner-only {
		padding: 0.2rem;
		border-radius: 999px;
		box-shadow: none;
	}

	.chat-composer-shell:focus-within {
		border-color: var(--lj-chat-composer-focus-border, rgba(161, 161, 170, 0.95));
		box-shadow:
			0 0 0 3px var(--lj-chat-composer-ring, rgba(15, 23, 42, 0.08)),
			var(--lj-chat-composer-shadow, 0 1px 2px rgba(15, 23, 42, 0.04));
	}

	.chat-composer-field {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		grid-template-areas: 'leading input trailing';
		align-items: center;
		gap: 0.6rem;
	}

	.chat-composer-field.is-spinner-only {
		display: flex;
		align-items: center;
		justify-content: flex-end;
	}

	.chat-composer-field.is-expanded {
		grid-template-areas:
			'input input input'
			'leading spacer trailing';
		row-gap: 0.45rem;
		align-items: end;
	}

	.chat-composer-input {
		grid-area: input;
		min-width: 0;
		display: flex;
		align-items: stretch;
		padding: 0.12rem 0.16rem;
		border-radius: 0.9rem;
		background: color-mix(in srgb, currentColor 3%, transparent);
	}

	:global(.chat-composer__textarea) {
		width: 100%;
		padding: 0.12rem 0.2rem 0.18rem;
		font-family: inherit;
		font-size: 0.95rem;
		line-height: 1.5rem;
		color: var(--lj-chat-composer-text, inherit);
	}

	:global(.chat-composer__textarea::placeholder) {
		color: var(--lj-chat-composer-placeholder, color-mix(in srgb, currentColor 56%, transparent));
	}

	.chat-composer-leading {
		grid-area: leading;
		display: flex;
		align-items: center;
		gap: 0.35rem;
	}

	.chat-composer-trailing {
		grid-area: trailing;
		display: flex;
		align-items: center;
		gap: 0.32rem;
	}

	.chat-composer-trailing.is-spinner-only {
		gap: 0;
	}

	.chat-composer-spacer {
		grid-area: spacer;
		display: none;
	}

	.chat-composer-field.is-expanded .chat-composer-spacer {
		display: block;
	}

	.chat-composer-field.is-expanded .chat-composer-input {
		padding-bottom: 0.25rem;
	}

	.chat-composer-button {
		display: grid;
		place-items: center;
		width: 2.3rem;
		height: 2.3rem;
		border-radius: 999px;
		border: 1px solid
			var(--lj-chat-composer-button-border, color-mix(in srgb, currentColor 16%, transparent));
		background: var(--lj-chat-composer-button-bg, color-mix(in srgb, currentColor 7%, transparent));
		color: var(--lj-chat-composer-button-fg, color-mix(in srgb, currentColor 90%, transparent));
		box-shadow:
			0 1px 2px rgba(15, 23, 42, 0.05),
			inset 0 1px 0 rgba(255, 255, 255, 0.2);
		transition:
			transform 0.2s ease,
			background 0.2s ease,
			color 0.2s ease,
			border-color 0.2s ease,
			box-shadow 0.2s ease;
	}

	.chat-composer-field.is-expanded .chat-composer-button {
		align-self: end;
	}

	.chat-composer-button:hover:enabled:not(.is-send) {
		background: var(--lj-chat-composer-button-hover, rgba(148, 163, 184, 0.18));
		border-color: var(
			--lj-chat-composer-button-hover-border,
			color-mix(in srgb, currentColor 24%, transparent)
		);
		color: var(--lj-chat-composer-button-hover-fg, inherit);
		transform: translateY(-1px);
	}

	.chat-composer-button:focus-visible {
		outline: none;
		border-color: var(
			--lj-chat-composer-button-focus-border,
			color-mix(in srgb, currentColor 22%, transparent)
		);
		box-shadow:
			0 0 0 3px var(--lj-chat-composer-button-ring, rgba(15, 23, 42, 0.08)),
			inset 0 1px 0 rgba(255, 255, 255, 0.2);
	}

	.chat-composer-button:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	.chat-composer-button.is-send {
		background: var(--lj-chat-send-bg, #18181b);
		border-color: transparent;
		color: var(--lj-chat-send-fg, #fafafa);
		box-shadow: 0 12px 30px -18px rgba(15, 23, 42, 0.35);
	}

	.chat-composer-button.is-send:hover:enabled {
		background: var(
			--lj-chat-send-hover-bg,
			color-mix(in srgb, var(--lj-chat-send-bg, #18181b) 88%, transparent)
		);
		transform: translateY(-1px) scale(1.02);
	}

	.chat-composer-button.is-send:disabled {
		background: color-mix(in srgb, var(--lj-chat-send-bg, #18181b) 60%, transparent);
		color: color-mix(in srgb, var(--lj-chat-send-fg, #fafafa) 70%, transparent);
	}

	.chat-composer-button.is-send.is-spinner-only,
	.chat-composer-button.is-send.is-spinner-only:disabled {
		background: transparent;
		color: var(--lj-chat-send-bg, #18181b);
		box-shadow: none;
		opacity: 1;
		cursor: default;
	}

	.chat-composer-button svg {
		width: 1.02rem;
		height: 1.02rem;
	}

	.chat-composer-spinner {
		width: 1.1rem;
		height: 1.1rem;
		border-radius: 999px;
		border: 2px solid color-mix(in srgb, currentColor 40%, transparent);
		border-top-color: currentColor;
		animation: chat-composer-spin 0.8s linear infinite;
	}

	@keyframes chat-composer-spin {
		to {
			transform: rotate(360deg);
		}
	}

	@media (max-width: 640px) {
		.chat-composer-shell {
			padding: 0.6rem;
		}

		.chat-composer-button {
			width: 2.2rem;
			height: 2.2rem;
		}
	}
</style>
