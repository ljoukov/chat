<script lang="ts">
	import { ChatInput } from '@ljoukov/chat';

	let defaultValue = $state('This default variant works well in compact forms and inline tools.');
	let chatValue = $state('This chat variant grows from one line to multiple lines as the message wraps.');
	let multilineValue = $state(
		'Shift+Enter keeps line breaks.\n\nThe Spark-derived resize logic steps from one line to two lines on wrap, then to three lines when the user explicitly inserts a newline.'
	);
</script>

<svelte:head>
	<title>@ljoukov/chat · ChatInput</title>
</svelte:head>

<div class="gallery-page">
	<header class="gallery-page__intro pt-1">
		<div class="gallery-page__eyebrow">ChatInput</div>
		<h1 class="gallery-page__title">Autosizing textarea states for forms and chat shells.</h1>
		<p class="gallery-page__description">
			The textarea primitive now follows Spark’s stepped autoresize behavior and parent-aware resize
			observer while staying generic enough for non-chat use.
		</p>
	</header>

	<div class="grid gap-4">
		<section class="gallery-stage">
			<div class="gallery-stage__header">
				<div>
					<p class="gallery-stage__title">Default variant</p>
					<p class="gallery-stage__copy">
						Standalone field styling for compact assistants, forms, and inline tools.
					</p>
				</div>
			</div>

			<div class="grid gap-3 xl:grid-cols-3">
				<div class="gallery-frame space-y-3">
					<p class="text-sm font-medium">Empty</p>
					<ChatInput variant="default" placeholder="Type a short message" submitMode="enter" />
				</div>

				<div class="gallery-frame space-y-3">
					<p class="text-sm font-medium">Filled</p>
					<ChatInput bind:value={defaultValue} variant="default" submitMode="enter" />
				</div>

				<div class="gallery-frame space-y-3">
					<p class="text-sm font-medium">Disabled</p>
					<ChatInput
						value="The field is disabled while a request is in flight."
						variant="default"
						disabled
					/>
				</div>
			</div>
		</section>

		<section class="gallery-stage">
			<div class="gallery-stage__header">
				<div>
					<p class="gallery-stage__title">Chat variant</p>
					<p class="gallery-stage__copy">
						Minimal field chrome for composer shells, including multiline expansion and keyboard
						submit control.
					</p>
				</div>
			</div>

			<div class="grid gap-3 xl:grid-cols-2">
				<div class="gallery-frame space-y-4">
					<div class="grid gap-2">
						<p class="text-sm font-medium">Single-line shell</p>
						<p class="text-sm leading-6 text-muted-foreground">
							Wraps from one line into the expanded composer layout as content grows.
						</p>
					</div>
					<div class="rounded-2xl border bg-muted/30 px-4 py-4 shadow-sm">
						<ChatInput
							bind:value={chatValue}
							variant="chat"
							placeholder="Ask anything"
							submitMode="enter"
						/>
					</div>
				</div>

				<div class="gallery-frame space-y-4">
					<div class="grid gap-2">
						<p class="text-sm font-medium">Expanded multiline</p>
						<p class="text-sm leading-6 text-muted-foreground">
							Shift+Enter keeps explicit newlines and makes the stepped resize more obvious.
						</p>
					</div>
					<div class="rounded-2xl border bg-muted/30 px-4 py-4 shadow-sm">
						<ChatInput
							bind:value={multilineValue}
							variant="chat"
							maxLines={12}
							placeholder="Shift+Enter for a newline"
							submitMode="modEnter"
						/>
					</div>
				</div>
			</div>
		</section>

		<section class="gallery-stage">
			<div class="gallery-stage__header">
				<div>
					<p class="gallery-stage__title">Resize behavior</p>
					<p class="gallery-stage__copy">
						The stepped resize logic is deliberately predictable so shells do not jump wildly as the
						user types.
					</p>
				</div>
			</div>

			<div class="grid gap-3 md:grid-cols-3">
				<div class="gallery-frame">
					<p class="text-sm font-medium">Wrap step</p>
					<p class="mt-2 text-sm leading-6 text-muted-foreground">
						The first wrap grows the textarea from one visible row to two instead of jumping straight
						to its full content height.
					</p>
				</div>

				<div class="gallery-frame">
					<p class="text-sm font-medium">Explicit newline</p>
					<p class="mt-2 text-sm leading-6 text-muted-foreground">
						A manual line break promotes the control to the next step so chat shells feel responsive
						to deliberate multiline input.
					</p>
				</div>

				<div class="gallery-frame">
					<p class="text-sm font-medium">Parent-aware resize</p>
					<p class="mt-2 text-sm leading-6 text-muted-foreground">
						A resize observer remeasures when the parent layout changes, which keeps the field stable
						inside drawers, panes, and composers.
					</p>
				</div>
			</div>
		</section>
	</div>
</div>
