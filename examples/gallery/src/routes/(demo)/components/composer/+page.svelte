<script lang="ts">
	import { ChatComposer } from '@ljoukov/chat';

	let idleDraft = $state('Attach the brief and turn it into a concise launch checklist.');
	let expandedDraft = $state(
		'Draft the note in three parts:\n\n1. Key blockers\n2. Recommended owner\n3. Next milestone'
	);
</script>

<svelte:head>
	<title>@ljoukov/chat · ChatComposer</title>
</svelte:head>

<div class="gallery-page">
	<header class="gallery-page__intro">
		<div class="gallery-page__eyebrow">ChatComposer</div>
		<h1 class="gallery-page__title">Spark-style composer shells with reusable action chrome.</h1>
		<p class="gallery-page__description">
			The composer borrows Spark’s multiline layout behavior while staying presentational. Upload
			queues, SSE phases, and retry logic stay in the route layer.
		</p>
	</header>

	<section class="gallery-stage">
		<div class="gallery-stage__header">
			<div>
				<p class="gallery-stage__title">Core states</p>
				<p class="gallery-stage__copy">
					Idle, expanded, and submitting shells all share the same API surface.
				</p>
			</div>
		</div>

		<div class="gallery-grid gallery-grid--three">
			<div class="gallery-frame space-y-3">
				<p class="text-sm font-medium">Idle with actions</p>
				<ChatComposer
					bind:value={idleDraft}
					submitMode="enter"
					attachAction={{ ariaLabel: 'Attach', icon: 'attach' }}
					cameraAction={{ ariaLabel: 'Take photo', icon: 'camera' }}
					micAction={{ ariaLabel: 'Voice note', icon: 'mic' }}
				/>
			</div>

			<div class="gallery-frame space-y-3">
				<p class="text-sm font-medium">Expanded</p>
				<ChatComposer
					bind:value={expandedDraft}
					submitMode="modEnter"
					attachAction={{ ariaLabel: 'Attach', icon: 'attach' }}
					cameraAction={{ ariaLabel: 'Take photo', icon: 'camera' }}
					micAction={{ ariaLabel: 'Voice note', icon: 'mic' }}
				/>
			</div>

			<div class="gallery-frame space-y-3">
				<p class="text-sm font-medium">Submitting</p>
				<ChatComposer
					value="Summarising the final note..."
					submitReady={false}
					showSubmitSpinner
					attachAction={{ ariaLabel: 'Attach', icon: 'attach' }}
					micAction={{ ariaLabel: 'Voice note', icon: 'mic' }}
				/>
			</div>
		</div>
	</section>

	<section class="gallery-stage">
		<div class="gallery-stage__header">
			<div>
				<p class="gallery-stage__title">Compact spinner shell</p>
				<p class="gallery-stage__copy">
					When a route wants the whole composer to collapse into a small status affordance, the shell
					can switch into the compact spinner state.
				</p>
			</div>
		</div>

		<div class="gallery-frame flex min-h-40 items-end justify-end">
			<ChatComposer value="" showSubmitSpinner compactSubmitSpinner submitReady={false} />
		</div>
	</section>
</div>
