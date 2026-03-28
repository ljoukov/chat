<script lang="ts">
	import { ChatTaskCard } from '@ljoukov/chat';
	import { taskCardStates } from '$lib/demo-data.js';
</script>

<svelte:head>
	<title>@ljoukov/chat · ChatTaskCard</title>
</svelte:head>

<div class="gallery-page gallery-page--wide">
	<header class="gallery-page__intro">
		<div class="gallery-page__eyebrow">Task card</div>
		<h1 class="gallery-page__title">Every supported run-card state in one place.</h1>
		<p class="gallery-page__description">
			Task cards are presentational summaries that stay attached to the message that created them.
		</p>
	</header>

	<section class="gallery-stage">
		<div class="gallery-stage__header">
			<div>
				<p class="gallery-stage__title">Supported statuses</p>
				<p class="gallery-stage__copy">
					Draft, queued, running, ready, success, failed, and stopped all use the same data shape.
				</p>
			</div>
		</div>

		<div class="gallery-grid gallery-grid--three">
			{#each taskCardStates as task, index (task.title + index.toString())}
				<ChatTaskCard {task} />
			{/each}
		</div>
	</section>
</div>
