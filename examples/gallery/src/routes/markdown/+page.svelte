<script lang="ts">
	import { ChatMarkdown } from '@ljoukov/chat';
	import { inlineMarkdownShowcase, markdownShowcase } from '$lib/demo-data.js';
</script>

<svelte:head>
	<title>@ljoukov/chat · ChatMarkdown</title>
</svelte:head>

<div class="gallery-page">
	<header class="gallery-page__intro">
		<div class="gallery-page__eyebrow">Markdown</div>
		<h1 class="gallery-page__title">Markdown renderer for prose, tables, code, and maths.</h1>
		<p class="gallery-page__description">
			The renderer supports block and inline modes, KaTeX formulas, syntax-highlighted code blocks, and
			copyable snippets.
		</p>
	</header>

	<section class="gallery-grid gallery-grid--two">
		<div class="gallery-stage">
			<div class="gallery-stage__header">
				<div>
					<p class="gallery-stage__title">Block markdown</p>
					<p class="gallery-stage__copy">
						Use the block renderer for assistant replies, notes, tables, and code examples.
					</p>
				</div>
			</div>
			<div class="gallery-frame">
				<ChatMarkdown markdown={markdownShowcase} />
			</div>
		</div>

		<div class="gallery-stage">
			<div class="gallery-stage__header">
				<div>
					<p class="gallery-stage__title">Inline markdown</p>
					<p class="gallery-stage__copy">
						Inline mode is useful in labels, chips, and compact metadata rows.
					</p>
				</div>
			</div>
			<div class="gallery-frame">
				<div class="gallery-inline-preview">
					<div class="gallery-inline-chip">
						<span class="text-sm font-medium">Snippet</span>
						<ChatMarkdown inline markdown={inlineMarkdownShowcase} />
					</div>
					<div class="gallery-inline-chip">
						<span class="text-sm font-medium">Command</span>
						<ChatMarkdown inline markdown="Run `npm run verify` before publishing." />
					</div>
				</div>
			</div>
		</div>
	</section>
</div>
