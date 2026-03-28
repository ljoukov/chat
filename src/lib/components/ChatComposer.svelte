<script lang="ts">
	import { tick } from 'svelte';
	import type { HTMLTextareaAttributes } from 'svelte/elements';
	import { formatBytes } from '../internal/format.js';
	import type { ChatAttachment, ChatComposerAction } from '../types.js';
	import ChatInput from './ChatInput.svelte';

	type SubmitMode = 'enter' | 'modEnter';

	type Props = {
		ariaLabel?: string;
		attachments?: ChatAttachment[];
		attachmentError?: string | null;
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
		onRemoveAttachment?: ((attachment: ChatAttachment) => void) | undefined;
		onRetryAttachment?: ((attachment: ChatAttachment) => void) | undefined;
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
		placeholder = 'Type your message',
		disabled = false,
		showSubmitSpinner = false,
		compactSubmitSpinner = false,
		maxLines = 7,
		maxChars = 1000,
		ariaLabel = 'Message',
		sendAriaLabel = 'Send message',
		autocomplete = 'off',
		spellcheck = false,
		class: className = '',
		inputClass = '',
		submitMode = 'modEnter',
		submitReady = undefined,
		attachments = [],
		attachmentError = null,
		attachmentShortcutLabel = null,
		attachAction = undefined,
		cameraAction = undefined,
		micAction = undefined,
		onInput = undefined,
		onSubmit = undefined,
		onPaste = undefined,
		onRemoveAttachment = undefined,
		onRetryAttachment = undefined
	}: Props = $props();

	let expanded = $state(value.includes('\n'));
	let inputValue = $state('');
	let compactSpinnerVisible = $state(false);
	let preparingCompactSpinner = $state(false);
	let actionMenuOpen = $state(false);
	let rootElement = $state<HTMLDivElement | null>(null);

	inputValue = value;

	const canSubmit = $derived.by(() => {
		if (typeof submitReady === 'boolean') {
			return submitReady && !disabled;
		}
		return !disabled && inputValue.trim().length > 0;
	});

	const wantsCompactSpinnerShell = $derived(showSubmitSpinner && compactSubmitSpinner);
	const showCompactSpinnerShell = $derived(compactSpinnerVisible);
	const hasLeadingActions = $derived(Boolean(attachAction || cameraAction));

	function handleInput(detail: { isExpanded: boolean; value: string }) {
		inputValue = detail.value;
		value = detail.value;
		expanded = detail.isExpanded;
		onInput?.(detail);
	}

	function handleSubmit() {
		const trimmed = inputValue.trim();
		if (!canSubmit || disabled || showSubmitSpinner) {
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

	function triggerMenuAction(action: ChatComposerAction | undefined) {
		actionMenuOpen = false;
		triggerAction(action);
	}

	function toggleActionMenu() {
		if (!hasLeadingActions || disabled) {
			return;
		}
		actionMenuOpen = !actionMenuOpen;
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

	function resolveActionLabel(action: ChatComposerAction | undefined): string {
		if (!action) {
			return '';
		}
		if (action.label?.trim()) {
			return action.label;
		}
		if (action.icon === 'camera') {
			return 'Take photo';
		}
		if (action.icon === 'attach') {
			return 'Add photos & files';
		}
		if (action.icon === 'mic') {
			return 'Voice input';
		}
		return action.ariaLabel;
	}

	function resolveAttachmentStatus(attachment: ChatAttachment): 'failed' | 'ready' | 'uploading' {
		return attachment.status ?? 'ready';
	}

	function isImageAttachment(attachment: ChatAttachment): boolean {
		if (attachment.kind) {
			return attachment.kind === 'image';
		}
		return Boolean(attachment.src) || attachment.contentType?.startsWith('image/') === true;
	}

	function resolveAttachmentBadge(attachment: ChatAttachment): string {
		if (attachment.badge?.trim()) {
			return attachment.badge;
		}
		return isImageAttachment(attachment) ? 'IMG' : 'FILE';
	}

	function resolveAttachmentMeta(attachment: ChatAttachment): string | null {
		if (attachment.detail?.trim()) {
			return attachment.detail;
		}
		if (attachment.sizeLabel?.trim()) {
			return attachment.sizeLabel;
		}
		return formatBytes(attachment.sizeBytes);
	}

	function removeAttachment(attachment: ChatAttachment) {
		if (disabled) {
			return;
		}
		onRemoveAttachment?.(attachment);
	}

	function retryAttachment(attachment: ChatAttachment) {
		if (disabled) {
			return;
		}
		onRetryAttachment?.(attachment);
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
			await tick();
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

	$effect(() => {
		if (!actionMenuOpen || typeof document === 'undefined') {
			return;
		}

		const handlePointerDown = (event: PointerEvent) => {
			if (!(event.target instanceof Node) || rootElement?.contains(event.target)) {
				return;
			}
			actionMenuOpen = false;
		};

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				actionMenuOpen = false;
			}
		};

		document.addEventListener('pointerdown', handlePointerDown, true);
		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('pointerdown', handlePointerDown, true);
			document.removeEventListener('keydown', handleKeyDown);
		};
	});

	$effect(() => {
		if (!hasLeadingActions || disabled) {
			actionMenuOpen = false;
		}
	});
</script>

<div class={`chat-composer-stack ${showCompactSpinnerShell ? 'is-spinner-only' : ''} ${className}`.trim()}>
	<div
		bind:this={rootElement}
		class={`chat-composer-shell ${showCompactSpinnerShell ? 'is-spinner-only' : ''}`}
	>
		{#if !showCompactSpinnerShell && attachments.length > 0}
			<div class="chat-composer-attachments" role="list">
				{#each attachments as attachment (attachment.id)}
					{@const isImage = isImageAttachment(attachment)}
					{@const status = resolveAttachmentStatus(attachment)}
					{@const meta = resolveAttachmentMeta(attachment)}
					<div class="chat-composer-attachment-wrap">
						<div
							class={`chat-composer-attachment ${isImage ? 'is-image' : 'is-file'} is-${status}`}
							role="listitem"
						>
							{#if isImage && attachment.src}
								<img src={attachment.src} alt={attachment.alt ?? attachment.name} loading="lazy" />
							{:else}
								<div class="chat-composer-attachment-doc">
									<span class="chat-composer-attachment-badge">{resolveAttachmentBadge(attachment)}</span>
									<span class="chat-composer-attachment-name">{attachment.name}</span>
									{#if meta}
										<span class="chat-composer-attachment-meta">{meta}</span>
									{/if}
								</div>
							{/if}

							{#if status === 'uploading'}
								<div class="chat-composer-attachment-status" aria-label="Uploading">
									<span class="chat-composer-attachment-spinner" aria-hidden="true"></span>
								</div>
							{:else if status === 'failed'}
								<div
									class="chat-composer-attachment-status chat-composer-attachment-status--failed"
									aria-hidden="true"
								></div>
								<span class="chat-composer-attachment-failed-badge" aria-hidden="true">!</span>
								{#if onRetryAttachment}
									<button
										type="button"
										class="chat-composer-attachment-retry"
										aria-label="Retry attachment"
										onclick={() => retryAttachment(attachment)}
										disabled={disabled}
									>
										<svg viewBox="0 0 24 24" aria-hidden="true">
											<path
												d="M3 12a9 9 0 1 0 3-6.7"
												fill="none"
												stroke="currentColor"
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="1.9"
											/>
											<path
												d="M3 3v5h5"
												fill="none"
												stroke="currentColor"
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="1.9"
											/>
										</svg>
									</button>
								{/if}
								{#if onRemoveAttachment}
									<button
										type="button"
										class="chat-composer-attachment-remove"
										aria-label="Remove attachment"
										onclick={() => removeAttachment(attachment)}
									>
										<span class="chat-composer-attachment-remove-glyph" aria-hidden="true">×</span>
									</button>
								{/if}
							{:else if onRemoveAttachment}
								<button
									type="button"
									class="chat-composer-attachment-remove"
									aria-label="Remove attachment"
									onclick={() => removeAttachment(attachment)}
								>
									<span class="chat-composer-attachment-remove-glyph" aria-hidden="true">×</span>
								</button>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}

		{#if !showCompactSpinnerShell && attachmentError}
			<div class="chat-composer-attachment-error" role="status">
				{attachmentError}
			</div>
		{/if}

		<div
			class={`chat-composer-field ${expanded ? 'is-expanded' : ''} ${showCompactSpinnerShell ? 'is-spinner-only' : ''}`}
		>
			{#if hasLeadingActions && !showCompactSpinnerShell}
				<div class="chat-composer-leading">
					<div class="chat-composer-menu">
						<button
							type="button"
							class="chat-composer-button chat-composer-button--ghost"
							aria-label={resolveActionTitle(attachAction) ?? 'Open attachment options'}
							title={resolveActionTitle(attachAction) ?? 'Open attachment options'}
							aria-expanded={actionMenuOpen}
							aria-haspopup="menu"
							disabled={disabled}
							onclick={toggleActionMenu}
						>
							<svg viewBox="0 0 24 24" aria-hidden="true">
								<path
									d="M12 5V19"
									fill="none"
									stroke="currentColor"
									stroke-linecap="round"
									stroke-width="1.9"
								/>
								<path
									d="M5 12H19"
									fill="none"
									stroke="currentColor"
									stroke-linecap="round"
									stroke-width="1.9"
								/>
							</svg>
						</button>

						{#if actionMenuOpen}
							<div class="chat-composer-menu__content" role="menu">
								{#if attachAction}
									<button
										type="button"
										class="chat-composer-menu__item"
										role="menuitem"
										title={resolveActionTitle(attachAction)}
										disabled={disabled || attachAction.disabled}
										onclick={() => triggerMenuAction(attachAction)}
									>
										<span class="chat-composer-menu__icon" aria-hidden="true">
											<svg viewBox="0 0 24 24">
												<path
													d="M10 9V15C10 16.1046 10.8954 17 12 17C13.1046 17 14 16.1046 14 15V7C14 4.79086 12.2091 3 10 3C7.79086 3 6 4.79086 6 7V15C6 18.3137 8.68629 21 12 21C15.3137 21 18 18.3137 18 15V8"
													fill="none"
													stroke="currentColor"
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="1.8"
												/>
											</svg>
										</span>
										<span class="chat-composer-menu__label">{resolveActionLabel(attachAction)}</span>
										{#if attachmentShortcutLabel}
											<span class="chat-composer-menu__shortcut">{attachmentShortcutLabel}</span>
										{/if}
									</button>
								{/if}

								{#if attachAction && cameraAction}
									<div class="chat-composer-menu__separator" aria-hidden="true"></div>
								{/if}

								{#if cameraAction}
									<button
										type="button"
										class="chat-composer-menu__item"
										role="menuitem"
										title={resolveActionTitle(cameraAction)}
										disabled={disabled || cameraAction.disabled}
										onclick={() => triggerMenuAction(cameraAction)}
									>
										<span class="chat-composer-menu__icon" aria-hidden="true">
											<svg viewBox="0 0 24 24">
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
										</span>
										<span class="chat-composer-menu__label">{resolveActionLabel(cameraAction)}</span>
									</button>
								{/if}
							</div>
						{/if}
					</div>
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
						onLayoutChange={({ isExpanded }) => {
							if (isExpanded || inputValue.includes('\n')) {
								expanded = true;
								return;
							}

							if (inputValue.trim().length === 0) {
								expanded = false;
							}
						}}
						onSubmit={handleSubmit}
					/>
				</div>
			{/if}

			<div class={`chat-composer-trailing ${showCompactSpinnerShell ? 'is-spinner-only' : ''}`}>
				{#if micAction && !showCompactSpinnerShell}
					<button
						type="button"
						class="chat-composer-button chat-composer-button--ghost"
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
		gap: var(--lj-chat-composer-stack-gap, 0.6rem);
	}

	.chat-composer-stack.is-spinner-only {
		align-items: flex-end;
	}

	.chat-composer-shell {
		padding: var(--lj-chat-composer-padding, 0.625rem);
		border-radius: var(--lj-chat-composer-radius, 12px);
		border: 1px solid var(--lj-chat-composer-border, rgba(228, 228, 231, 0.95));
		background: var(--lj-chat-composer-bg, #ffffff);
		box-shadow: var(
			--lj-chat-composer-shadow,
			0 18px 45px -32px rgba(15, 23, 42, 0.35),
			inset 0 1px 0 rgba(255, 255, 255, 0.55)
		);
		display: flex;
		flex-direction: column;
		gap: var(--lj-chat-composer-card-gap, 0.6rem);
		overflow: visible;
		background-clip: padding-box;
		backdrop-filter: var(--lj-chat-composer-backdrop, blur(16px));
		transition:
			padding var(--lj-chat-composer-shell-transition-duration, 0.2s) ease,
			border-radius var(--lj-chat-composer-shell-transition-duration, 0.2s) ease,
			background var(--lj-chat-composer-shell-transition-duration, 0.2s) ease,
			border-color var(--lj-chat-composer-shell-transition-duration, 0.2s) ease,
			box-shadow var(--lj-chat-composer-shell-transition-duration, 0.2s) ease;
	}

	.chat-composer-shell.is-spinner-only {
		padding: var(--lj-chat-composer-spinner-shell-padding, 0.2rem);
		border-radius: 999px;
		background: var(
			--lj-chat-composer-spinner-shell-bg,
			color-mix(in srgb, var(--lj-chat-composer-bg, #ffffff) 92%, transparent)
		);
		border-color: var(
			--lj-chat-composer-spinner-shell-border,
			var(--lj-chat-composer-border, rgba(228, 228, 231, 0.95))
		);
		box-shadow: none;
		backdrop-filter: var(--lj-chat-composer-spinner-shell-backdrop, none);
	}

	.chat-composer-shell:focus-within {
		border-color: var(--lj-chat-composer-focus-border, rgba(161, 161, 170, 0.95));
		box-shadow:
			0 0 0 3px var(--lj-chat-composer-ring, rgba(15, 23, 42, 0.08)),
			var(
				--lj-chat-composer-shadow,
				0 18px 45px -32px rgba(15, 23, 42, 0.35),
				inset 0 1px 0 rgba(255, 255, 255, 0.55)
			);
	}

	.chat-composer-attachments {
		display: flex;
		gap: 0.6rem;
		overflow-x: auto;
		padding: 0.2rem 0.1rem 0.4rem;
		scrollbar-width: thin;
	}

	.chat-composer-attachment-wrap {
		flex: 0 0 auto;
		display: inline-flex;
	}

	.chat-composer-attachment-error {
		padding: 0.5rem 0.75rem;
		border-radius: 0.75rem;
		border: 1px solid rgba(239, 68, 68, 0.28);
		background: rgba(239, 68, 68, 0.08);
		color: rgba(185, 28, 28, 0.9);
		font-size: 0.85rem;
	}

	.chat-composer-attachment {
		position: relative;
		flex: 0 0 auto;
		height: 96px;
		border-radius: 0.9rem;
		border: 1px solid var(--lj-chat-composer-attachment-border, rgba(228, 228, 231, 0.95));
		background: var(--lj-chat-composer-attachment-bg, #ffffff);
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		padding: 0.35rem;
	}

	.chat-composer-attachment.is-failed {
		border-color: rgba(220, 38, 38, 0.48);
		background: color-mix(in srgb, rgba(220, 38, 38, 0.14) 72%, var(--lj-chat-composer-attachment-bg, #ffffff));
	}

	.chat-composer-attachment.is-failed img {
		filter: saturate(0.7) brightness(0.8);
	}

	.chat-composer-attachment.is-image {
		min-width: 120px;
		max-width: 180px;
	}

	.chat-composer-attachment.is-file {
		aspect-ratio: 3 / 4;
		width: 72px;
	}

	.chat-composer-attachment img {
		height: 100%;
		width: auto;
		max-width: 100%;
		object-fit: contain;
		display: block;
		border-radius: 0.6rem;
	}

	.chat-composer-attachment-doc {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.35rem;
		text-align: center;
		padding: 0.35rem;
		font-size: 0.65rem;
		color: var(--lj-chat-composer-meta, rgba(30, 41, 59, 0.7));
	}

	.chat-composer-attachment-badge {
		font-size: 0.6rem;
		font-weight: 700;
		padding: 0.2rem 0.4rem;
		border-radius: 0.4rem;
		background: color-mix(in srgb, currentColor 8%, transparent);
		color: var(--lj-chat-composer-text, inherit);
	}

	.chat-composer-attachment-name {
		max-width: 6.5rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.chat-composer-attachment-meta {
		font-size: 0.6rem;
		color: var(--lj-chat-composer-meta, rgba(30, 41, 59, 0.65));
	}

	.chat-composer-attachment-status {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: color-mix(in srgb, var(--lj-chat-composer-bg, #ffffff) 60%, transparent);
		backdrop-filter: blur(4px);
	}

	.chat-composer-attachment-status--failed {
		background: color-mix(in srgb, rgba(220, 38, 38, 0.2) 62%, transparent);
		backdrop-filter: blur(1.5px);
		pointer-events: none;
	}

	.chat-composer-attachment-spinner {
		width: 1.4rem;
		height: 1.4rem;
		border-radius: 999px;
		border: 2px solid color-mix(in srgb, currentColor 40%, transparent);
		border-top-color: currentColor;
		animation: chat-composer-spin 0.8s linear infinite;
	}

	.chat-composer-attachment-remove,
	.chat-composer-attachment-retry {
		border-radius: 999px;
		border: none;
		display: grid;
		place-items: center;
		cursor: pointer;
	}

	.chat-composer-attachment-remove {
		position: absolute;
		top: 0.35rem;
		right: 0.35rem;
		width: 1.35rem;
		height: 1.35rem;
		background: color-mix(in srgb, currentColor 16%, transparent);
		color: var(--lj-chat-composer-text, inherit);
	}

	.chat-composer-attachment-retry {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 2.15rem;
		height: 2.15rem;
		color: #fff;
		background: color-mix(in srgb, rgb(220, 38, 38) 88%, rgb(127, 29, 29));
		box-shadow:
			0 6px 16px -8px rgba(127, 29, 29, 0.9),
			0 0 0 2px rgba(255, 255, 255, 0.78);
		z-index: 2;
	}

	.chat-composer-attachment-retry:hover:enabled {
		background: color-mix(in srgb, rgb(185, 28, 28) 92%, rgb(127, 29, 29));
	}

	.chat-composer-attachment-retry:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	.chat-composer-attachment-retry svg {
		width: 1rem;
		height: 1rem;
	}

	.chat-composer-attachment-failed-badge {
		position: absolute;
		top: 0.35rem;
		left: 0.35rem;
		width: 1.25rem;
		height: 1.25rem;
		border-radius: 999px;
		display: grid;
		place-items: center;
		font-size: 0.78rem;
		font-weight: 700;
		line-height: 1;
		color: rgba(127, 29, 29, 0.95);
		background: rgba(255, 255, 255, 0.9);
		border: 1px solid rgba(220, 38, 38, 0.45);
		z-index: 2;
	}

	.chat-composer-attachment-remove-glyph {
		display: block;
		font-size: 0.95rem;
		line-height: 1;
		transform: translateY(-0.5px);
	}

	.chat-composer-field {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		grid-template-areas: 'leading input trailing';
		align-items: center;
		gap: var(--lj-chat-composer-gap, 0.6rem);
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

	.chat-composer-leading {
		grid-area: leading;
		display: flex;
		align-items: center;
	}

	.chat-composer-menu {
		position: relative;
	}

	.chat-composer-menu__content {
		position: absolute;
		left: 0;
		bottom: calc(100% + 0.75rem);
		z-index: 20;
		min-width: 15.5rem;
		padding: 0.35rem;
		border-radius: 1rem;
		border: 1px solid var(--lj-chat-composer-menu-border, rgba(228, 228, 231, 0.95));
		background: var(--lj-chat-composer-menu-bg, #ffffff);
		box-shadow: var(
			--lj-chat-composer-menu-shadow,
			0 16px 40px -28px rgba(15, 23, 42, 0.45)
		);
	}

	.chat-composer-menu__item {
		width: 100%;
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		align-items: center;
		gap: 0.65rem;
		padding: 0.6rem 0.65rem;
		border: none;
		border-radius: 0.75rem;
		background: transparent;
		color: var(--lj-chat-composer-text, inherit);
		font: inherit;
		font-size: 0.92rem;
		text-align: left;
	}

	.chat-composer-menu__item:hover:enabled {
		background: color-mix(in srgb, currentColor 6%, transparent);
	}

	.chat-composer-menu__item:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.chat-composer-menu__icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.6rem;
		height: 1.6rem;
		border-radius: 0.6rem;
		background: color-mix(in srgb, currentColor 12%, transparent);
		color: var(--lj-chat-composer-text, inherit);
	}

	.chat-composer-menu__icon svg {
		width: 1rem;
		height: 1rem;
	}

	.chat-composer-menu__label {
		min-width: 0;
	}

	.chat-composer-menu__shortcut {
		font-size: 0.75rem;
		color: var(--lj-chat-composer-meta, rgba(30, 41, 59, 0.65));
	}

	.chat-composer-menu__separator {
		height: 1px;
		margin: 0.3rem 0.25rem;
		background: color-mix(in srgb, currentColor 12%, transparent);
	}

	.chat-composer-input {
		grid-area: input;
		min-width: 0;
		display: flex;
		align-items: stretch;
	}

	:global(.chat-composer__textarea) {
		width: 100%;
		padding: var(--lj-chat-composer-textarea-padding, 0.15rem 0.2rem 0.25rem);
		font-family: inherit;
		font-size: var(--lj-chat-composer-font-size, 0.95rem);
		line-height: var(--lj-chat-composer-line-height, 1.5rem);
		color: var(--lj-chat-composer-text, inherit);
	}

	:global(.chat-composer__textarea::placeholder) {
		color: var(
			--lj-chat-composer-placeholder,
			color-mix(in srgb, currentColor 56%, transparent)
		);
	}

	.chat-composer-trailing {
		grid-area: trailing;
		display: flex;
		align-items: center;
		gap: var(--lj-chat-composer-trailing-gap, 0.4rem);
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
		width: var(--lj-chat-composer-button-size, 2.25rem);
		height: var(--lj-chat-composer-button-size, 2.25rem);
		border-radius: 999px;
		border: 1px solid transparent;
		background: transparent;
		color: var(--lj-chat-composer-button-fg, color-mix(in srgb, currentColor 90%, transparent));
		transition:
			transform var(--lj-chat-composer-button-transition-duration, 0.2s) ease,
			background var(--lj-chat-composer-button-transition-duration, 0.2s) ease,
			color var(--lj-chat-composer-button-transition-duration, 0.2s) ease,
			border-color var(--lj-chat-composer-button-transition-duration, 0.2s) ease,
			box-shadow var(--lj-chat-composer-button-transition-duration, 0.2s) ease;
	}

	.chat-composer-field.is-expanded .chat-composer-button {
		align-self: end;
	}

	.chat-composer-button:hover:enabled:not(.is-send) {
		background: var(--lj-chat-composer-button-hover, rgba(148, 163, 184, 0.18));
		color: var(--lj-chat-composer-button-hover-fg, inherit);
		transform: translateY(-1px);
	}

	.chat-composer-button:focus-visible {
		outline: none;
		box-shadow: 0 0 0 3px var(--lj-chat-composer-button-ring, rgba(15, 23, 42, 0.08));
	}

	.chat-composer-button:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	.chat-composer-button.is-send {
		background: var(--lj-chat-send-bg, #18181b);
		border-color: transparent;
		color: var(--lj-chat-send-fg, #fafafa);
		box-shadow: var(--lj-chat-send-shadow, 0 12px 30px -18px rgba(15, 23, 42, 0.35));
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
		color: var(--lj-chat-composer-spinner-shell-fg, var(--lj-chat-send-bg, #18181b));
		box-shadow: none;
		opacity: 1;
		cursor: default;
	}

	.chat-composer-button svg {
		width: 1.05rem;
		height: 1.05rem;
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
			border-radius: min(var(--lj-chat-composer-radius, 12px), 1.5rem);
		}

		.chat-composer-button {
			width: var(--lj-chat-composer-button-size, 2.2rem);
			height: var(--lj-chat-composer-button-size, 2.2rem);
		}

		.chat-composer-menu__content {
			left: calc(50% - 1.125rem);
			transform: translateX(-50%);
		}
	}
</style>
