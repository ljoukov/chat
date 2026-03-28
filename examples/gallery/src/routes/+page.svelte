<script lang="ts">
	import { demoNavigation } from '$lib/demo/navigation.js';

	const renderRoutes = [
		{ href: '/render/chat?theme=light', label: 'Chat', caption: 'Component-only thread capture' },
		{
			href: '/render/composer?theme=light&state=idle',
			label: 'Composer',
			caption: 'Spark-style composer render'
		},
		{ href: '/render/input?theme=light', label: 'Input', caption: 'Autosize textarea states' },
		{ href: '/render/markdown?theme=light&state=block', label: 'Markdown', caption: 'Block and inline markdown' },
		{ href: '/render/message?theme=light&state=custom', label: 'Message', caption: 'Message parts and attachments' },
		{ href: '/render/task-card?theme=light&state=running', label: 'Task card', caption: 'Run-card state variants' },
		{ href: '/render/thread?theme=light&state=mapped', label: 'Thread', caption: 'Thread empty and mapped states' }
	] as const;
</script>

<div class="gallery-page max-w-[54rem]">
	<header class="gallery-page__intro">
		<div class="gallery-page__eyebrow">Overview</div>
		<h1 class="gallery-page__title">Library routes for chat surfaces, composers, and renders.</h1>
		<p class="gallery-page__description">
			Use this app to inspect the exported package surfaces. The live chat demo stays separate from the
			component pages so screenshots and visual checks remain repeatable.
		</p>
	</header>

	<section class="gallery-grid gallery-grid--two gap-3 xl:items-start">
		<div class="gallery-stage">
			<div class="gallery-stage__header">
				<div>
					<p class="gallery-stage__title">Routes</p>
					<p class="gallery-stage__copy">
						Start with the full chat surface, then move to the focused component routes when you need tighter visual checks.
					</p>
				</div>
			</div>

			<div class="gallery-list">
				{#each demoNavigation.slice(1) as item (item.href)}
					<a class="gallery-list__item" href={item.href}>
						<div>
							<h2 class="gallery-list__item-title">{item.label}</h2>
							<p class="gallery-list__item-copy">{item.caption}</p>
						</div>
						<span class="gallery-pill">Route</span>
					</a>
				{/each}
			</div>
		</div>

		<div class="gallery-stage">
			<div class="gallery-stage__header">
				<div>
					<p class="gallery-stage__title">Render surfaces</p>
					<p class="gallery-stage__copy">
						Isolated routes with no sidebar or header chrome, intended for README screenshots and UI review.
					</p>
				</div>
			</div>

			<div class="gallery-list">
				{#each renderRoutes as route (route.href)}
					<a class="gallery-list__item" href={route.href}>
						<div>
							<h2 class="gallery-list__item-title">{route.label}</h2>
							<p class="gallery-list__item-copy">{route.caption}</p>
						</div>
						<span class="gallery-pill">Open</span>
					</a>
				{/each}
			</div>
		</div>
	</section>

	<section class="gallery-stage">
		<div class="gallery-stage__header">
			<div>
				<p class="gallery-stage__title">Surface families</p>
				<p class="gallery-stage__copy">
					The package separates transcript layout, input primitives, and supporting rich-content parts so
					app code can mix them without reimplementing the shell.
				</p>
			</div>
		</div>

		<div class="gallery-list">
			<div class="gallery-list__item">
				<div>
					<h2 class="gallery-list__item-title">Transcript surfaces</h2>
					<p class="gallery-list__item-copy">
						`ChatView`, `ChatMessage`, and `ChatTaskCard` cover the thread shell, message blocks, and
						run-state UI. Use them when you need a full assistant thread with streamed parts,
						attachments, and status cards.
					</p>
				</div>
				<span class="gallery-pill">Thread</span>
			</div>
			<div class="gallery-list__item">
				<div>
					<h2 class="gallery-list__item-title">Input surfaces</h2>
					<p class="gallery-list__item-copy">
						`ChatComposer` and `ChatInput` share the Spark-derived autoresize behavior and keyboard
						submit flow. Use them when you want the full composer shell or just the textarea
						primitive.
					</p>
				</div>
				<span class="gallery-pill">Input</span>
			</div>
			<div class="gallery-list__item">
				<div>
					<h2 class="gallery-list__item-title">Rich text and parts</h2>
					<p class="gallery-list__item-copy">
						`ChatMarkdown` plus the part factories keep markdown, task cards, maths, and custom
						thread inserts aligned. Use them when assistant replies need richer blocks without a
						separate renderer.
					</p>
				</div>
				<span class="gallery-pill">Parts</span>
			</div>
		</div>
	</section>

	<section class="gallery-stage">
		<div class="gallery-stage__header">
			<div>
				<p class="gallery-stage__title">Inspection flow</p>
				<p class="gallery-stage__copy">
					The gallery mirrors the review sequence for the package: live route first, isolated render
					second, README screenshot last.
				</p>
			</div>
		</div>

		<div class="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] xl:items-start">
			<div class="gallery-list">
				<div class="gallery-list__item">
					<div>
						<h2 class="gallery-list__item-title">1. Live route</h2>
						<p class="gallery-list__item-copy">
							Check the full page route for spacing, section rhythm, and how the component behaves
							with surrounding UI.
						</p>
					</div>
				</div>
				<div class="gallery-list__item">
					<div>
						<h2 class="gallery-list__item-title">2. Isolated render</h2>
						<p class="gallery-list__item-copy">
							Use the matching `/render/*` route to verify just the exported component without
							gallery chrome.
						</p>
					</div>
				</div>
				<div class="gallery-list__item">
					<div>
						<h2 class="gallery-list__item-title">3. README asset</h2>
						<p class="gallery-list__item-copy">
							Capture the selector-based screenshot only after the live route and render route both
							look correct.
						</p>
					</div>
				</div>
			</div>

			<div class="grid gap-4">
				<div class="gallery-note">
					<strong>Library contract</strong>
					<br />
					`ChatView`, `ChatComposer`, `ChatInput`, `ChatMessage`, `ChatTaskCard`, and
					`ChatMarkdown` are the public package contract. The gallery exists to exercise those
					exports, not to document its own internal route structure.
				</div>

				<div class="gallery-note">
					<strong>Review target</strong>
					<br />
					If a route looks good in the gallery but fails in `/render/*`, treat the render route as the
					source of truth for docs and screenshot work.
				</div>
			</div>
		</div>
	</section>
</div>
