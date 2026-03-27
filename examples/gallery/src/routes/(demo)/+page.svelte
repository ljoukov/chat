<script lang="ts">
	import { buttonVariants } from '$demo/components/ui/button/index.js';
</script>

<svelte:head>
	<title>@ljoukov/chat Demo Overview</title>
</svelte:head>

<div class="gallery-page">
	<section class="gallery-stage p-6 lg:p-7">
		<div class="gallery-grid gap-8 lg:grid-cols-[minmax(0,1.12fr)_minmax(22rem,0.88fr)] lg:items-start">
			<div class="grid gap-6 lg:pr-6">
				<header class="space-y-4">
					<div class="gallery-page__eyebrow">Svelte component library</div>
					<div class="space-y-3">
						<h1 class="text-5xl font-semibold tracking-tight sm:text-6xl">@ljoukov/chat</h1>
						<p class="max-w-3xl text-lg leading-8 text-muted-foreground">
							Composable chat UI for Svelte and SvelteKit: threaded transcripts, markdown replies,
							attachments, task cards, and a Spark-style composer that stays clean under real app
							state.
						</p>
					</div>
				</header>

				<div class="gallery-toolbar">
					<a class={buttonVariants({ variant: 'default' })} href="/chat">Open live chat demo</a>
					<a class={buttonVariants({ variant: 'outline' })} href="/components/thread">
						Browse component pages
					</a>
				</div>

				<div class="gallery-note max-w-sm">
					<strong>Install</strong>
					<br />
					<code>npm install @ljoukov/chat</code>
				</div>

				<p class="max-w-3xl text-sm leading-6 text-muted-foreground">
					Use the live chat route for an end-to-end surface, then move through the component pages to
					inspect every supported state in isolation.
				</p>
			</div>

			<div class="rounded-2xl border bg-card p-5 shadow-sm">
				<div class="flex items-center justify-between gap-3">
					<p class="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
					Minimal setup
					</p>
					<span class="gallery-pill">Package</span>
				</div>
				<pre class="mt-4 overflow-x-auto rounded-xl bg-foreground p-4 text-sm leading-7 text-background"><code>import &#123; ChatComposer, ChatTaskCard, ChatView &#125; from '@ljoukov/chat';</code></pre>
				<div class="mt-4 grid gap-3 text-sm leading-6 text-muted-foreground">
					<p>Map assistant threads with markdown, attachments, and task-state UI.</p>
					<p>Use the live demo for the full surface, then drill into isolated component states.</p>
					<p>Keep app-specific cards in-thread through the custom part extension hook.</p>
				</div>
			</div>
		</div>
	</section>

	<section class="gallery-stage">
		<div class="gallery-stage__header">
			<div>
				<p class="gallery-stage__title">Start here</p>
				<p class="gallery-stage__copy">
					The sidebar stays exhaustive. These entry points are the quickest way to explore the demo app.
				</p>
			</div>
		</div>

		<div class="gallery-grid gap-3 md:grid-cols-2">
			{#each [
				{
					copy: 'Live thread demo with markdown, attachments, task cards, and a custom embedded card.',
					group: 'Demo',
					href: '/chat',
					label: 'Chat In Action'
				},
				{
					copy: 'Input and composer states, including Spark-style autoresize and shell behavior.',
					group: 'Components',
					href: '/components/composer',
					label: 'Composer + Input'
				},
				{
					copy: 'Message rendering, markdown blocks, and thread-level empty or populated states.',
					group: 'Components',
					href: '/components/thread',
					label: 'Thread Rendering'
				},
				{
					copy: 'Structured task-card states for long-running work, progress, and follow-up actions.',
					group: 'Components',
					href: '/components/task-card',
					label: 'Structured State'
				}
			] as item (item.href)}
				<a class="gallery-list__item" href={item.href}>
					<div>
						<h2 class="gallery-list__item-title">{item.label}</h2>
						<p class="gallery-list__item-copy">{item.copy}</p>
					</div>
					<span class="gallery-pill">{item.group}</span>
				</a>
			{/each}
		</div>
	</section>
</div>
