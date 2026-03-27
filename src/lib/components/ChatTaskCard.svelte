<script lang="ts">
	import { formatRelativeTime, toDate } from '../internal/format.js';
	import type { ChatTaskCardData, ChatTaskStatus } from '../types.js';

	let {
		task,
		class: className = ''
	}: {
		class?: string;
		task: ChatTaskCardData;
	} = $props();

	let now = $state(Date.now());

	const normalizedStatus = $derived.by(() => task.status);
	const accent = $derived.by(() => {
		if (task.accent) {
			return task.accent;
		}
		switch (task.status) {
			case 'failed':
				return 'danger';
			case 'ready':
			case 'success':
				return 'success';
			case 'queued':
			case 'running':
				return 'warm';
			default:
				return 'cool';
		}
	});

	const statusLabel = $derived(resolveStatusLabel(task.status, task.statusLabel));
	const showSpinner = $derived(task.status === 'queued' || task.status === 'running');
	const relativeAge = $derived.by(() => {
		const startedAt = toDate(task.startedAt);
		if (!startedAt || (task.status !== 'queued' && task.status !== 'running')) {
			return null;
		}
		return formatRelativeTime(startedAt, { now });
	});
	const progressValue = $derived.by(() => {
		if (!task.progress) {
			return null;
		}
		return Math.max(0, Math.min(100, task.progress.value));
	});

	function resolveStatusLabel(status: ChatTaskStatus, explicit?: string): string {
		if (explicit) {
			return explicit;
		}
		switch (status) {
			case 'draft':
				return 'Draft';
			case 'failed':
				return 'Failed';
			case 'queued':
				return 'Queued';
			case 'ready':
				return 'Ready';
			case 'running':
				return 'Running';
			case 'stopped':
				return 'Stopped';
			case 'success':
				return 'Complete';
		}
	}

	$effect(() => {
		if ((task.status !== 'queued' && task.status !== 'running') || typeof window === 'undefined') {
			return;
		}
		const timer = window.setInterval(() => {
			now = Date.now();
		}, 30_000);
		return () => {
			window.clearInterval(timer);
		};
	});
</script>

<article
	class={`chat-task-card ${className}`.trim()}
	data-accent={accent}
	data-status={normalizedStatus}
>
	<header class="chat-task-card__header">
		<div class="chat-task-card__status">
			{#if showSpinner}
				<span class="chat-task-card__spinner" aria-hidden="true"></span>
			{/if}
			<span>{statusLabel}</span>
		</div>
		{#if task.meta}
			<span class="chat-task-card__meta">{task.meta}</span>
		{/if}
	</header>

	<div class="chat-task-card__body">
		{#if task.eyebrow}
			<p class="chat-task-card__eyebrow">{task.eyebrow}</p>
		{/if}
		<h3>{task.title}</h3>
		{#if task.subtitle}
			<p class="chat-task-card__subtitle">{task.subtitle}</p>
		{/if}
		{#if task.summary}
			<p class="chat-task-card__summary">{task.summary}</p>
		{/if}
		{#if relativeAge}
			<p class="chat-task-card__age">Started {relativeAge}</p>
		{/if}
		{#if progressValue !== null}
			<div class="chat-task-card__progress">
				<div class="chat-task-card__progress-track" aria-hidden="true">
					<div
						class="chat-task-card__progress-fill"
						style={`width:${progressValue.toString()}%`}
					></div>
				</div>
				{#if task.progress?.label}
					<p>{task.progress.label}</p>
				{/if}
			</div>
		{/if}
		{#if task.stats && task.stats.length > 0}
			<div class="chat-task-card__stats">
				{#each task.stats as stat, index (stat.label + index.toString())}
					<div>
						<span>{stat.label}</span>
						<p>{stat.value}</p>
					</div>
				{/each}
			</div>
		{/if}
		{#if task.warning}
			<p class="chat-task-card__warning">{task.warning}</p>
		{/if}
	</div>

	{#if task.actions && task.actions.length > 0}
		<footer class="chat-task-card__actions">
			{#each task.actions as action, index (action.id ?? action.label + index.toString())}
				{#if action.href}
					<a
						class={`chat-task-card__action ${action.tone === 'primary' ? 'is-primary' : ''}`}
						href={action.disabled ? undefined : action.href}
						aria-disabled={action.disabled}
					>
						{action.label}
					</a>
				{:else}
					<button
						type="button"
						class={`chat-task-card__action ${action.tone === 'primary' ? 'is-primary' : ''}`}
						disabled={action.disabled}
						onclick={() => action.onClick?.()}
					>
						{action.label}
					</button>
				{/if}
			{/each}
		</footer>
	{/if}
</article>

<style>
	.chat-task-card {
		display: grid;
		gap: 1rem;
		padding: 1rem;
		border-radius: 1rem;
		border: 1px solid var(--lj-chat-card-border, rgba(228, 228, 231, 0.95));
		background: var(--lj-chat-card-bg, #ffffff);
		box-shadow: var(--lj-chat-card-shadow, 0 1px 2px rgba(15, 23, 42, 0.05));
	}

	.chat-task-card[data-accent='warm'] {
		--lj-chat-task-accent: #f59e0b;
	}

	.chat-task-card[data-accent='success'] {
		--lj-chat-task-accent: #22c55e;
	}

	.chat-task-card[data-accent='danger'] {
		--lj-chat-task-accent: #ef4444;
	}

	.chat-task-card[data-accent='cool'] {
		--lj-chat-task-accent: #3b82f6;
	}

	.chat-task-card[data-accent='default'] {
		--lj-chat-task-accent: #64748b;
	}

	.chat-task-card__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.85rem;
	}

	.chat-task-card__status {
		display: inline-flex;
		align-items: center;
		gap: 0.48rem;
		padding: 0.32rem 0.58rem;
		border-radius: 999px;
		border: 1px solid color-mix(in srgb, var(--lj-chat-task-accent, #3b82f6) 18%, transparent);
		background: color-mix(in srgb, var(--lj-chat-task-accent, #3b82f6) 8%, white);
		font-size: 0.74rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: color-mix(in srgb, var(--lj-chat-task-accent, #3b82f6) 70%, #0f172a);
	}

	.chat-task-card__spinner {
		width: 0.82rem;
		height: 0.82rem;
		border-radius: 999px;
		border: 2px solid color-mix(in srgb, var(--lj-chat-task-accent, #3b82f6) 24%, transparent);
		border-top-color: var(--lj-chat-task-accent, #3b82f6);
		animation: chat-task-card-spin 0.8s linear infinite;
	}

	.chat-task-card__meta {
		font-size: 0.78rem;
		color: color-mix(in srgb, currentColor 66%, transparent);
	}

	.chat-task-card__body {
		display: grid;
		gap: 0.4rem;
	}

	.chat-task-card__eyebrow {
		margin: 0;
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: color-mix(in srgb, currentColor 52%, transparent);
	}

	.chat-task-card h3 {
		margin: 0;
		font-size: 1rem;
		line-height: 1.25;
	}

	.chat-task-card__subtitle,
	.chat-task-card__summary,
	.chat-task-card__age,
	.chat-task-card__warning {
		margin: 0;
		font-size: 0.9rem;
		line-height: 1.5;
	}

	.chat-task-card__subtitle {
		color: color-mix(in srgb, currentColor 76%, transparent);
	}

	.chat-task-card__summary {
		color: color-mix(in srgb, currentColor 88%, transparent);
	}

	.chat-task-card__age {
		color: color-mix(in srgb, currentColor 62%, transparent);
	}

	.chat-task-card__warning {
		color: color-mix(in srgb, #ef4444 76%, currentColor);
	}

	.chat-task-card__progress {
		display: grid;
		gap: 0.35rem;
	}

	.chat-task-card__progress p {
		margin: 0;
		font-size: 0.8rem;
		color: color-mix(in srgb, currentColor 72%, transparent);
	}

	.chat-task-card__progress-track {
		height: 0.44rem;
		border-radius: 999px;
		background: color-mix(in srgb, currentColor 10%, transparent);
		overflow: hidden;
	}

	.chat-task-card__progress-fill {
		height: 100%;
		border-radius: inherit;
		background: linear-gradient(90deg, var(--lj-chat-task-accent, #3b82f6), color-mix(in srgb, var(--lj-chat-task-accent, #3b82f6) 56%, white));
	}

	.chat-task-card__stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(7rem, 1fr));
		gap: 0.55rem;
	}

	.chat-task-card__stats div {
		padding: 0.68rem 0.72rem;
		border-radius: 0.8rem;
		border: 1px solid color-mix(in srgb, currentColor 8%, transparent);
		background: color-mix(in srgb, currentColor 3%, transparent);
	}

	.chat-task-card__stats span {
		display: block;
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: color-mix(in srgb, currentColor 54%, transparent);
	}

	.chat-task-card__stats p {
		margin: 0.25rem 0 0;
		font-size: 0.98rem;
		font-weight: 600;
	}

	.chat-task-card__actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.55rem;
	}

	.chat-task-card__action {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 2.2rem;
		padding: 0.5rem 0.8rem;
		border-radius: 0.625rem;
		border: 1px solid color-mix(in srgb, currentColor 10%, transparent);
		background: transparent;
		color: inherit;
		font: inherit;
		text-decoration: none;
	}

	.chat-task-card__action.is-primary {
		background: var(--lj-chat-task-primary-bg, #18181b);
		color: var(--lj-chat-task-primary-fg, #fafafa);
		border-color: var(--lj-chat-task-primary-bg, #18181b);
	}

	.chat-task-card__action[aria-disabled='true'],
	.chat-task-card__action:disabled {
		pointer-events: none;
		opacity: 0.48;
	}

	@keyframes chat-task-card-spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
