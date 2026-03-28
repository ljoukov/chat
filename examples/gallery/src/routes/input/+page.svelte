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

<div class="gallery-page max-w-[56rem]">
	<header class="gallery-page__intro">
		<div class="gallery-page__eyebrow">Input</div>
		<h1 class="gallery-page__title">Autosizing textarea states for forms and chat shells.</h1>
		<p class="gallery-page__description">
			The textarea primitive follows Spark’s stepped autoresize behavior and parent-aware resize
			observer while staying generic enough for non-chat use.
		</p>
	</header>

	<section class="gallery-stage">
		<div class="gallery-stage__header">
			<div>
				<p class="gallery-stage__title">Compact rows</p>
				<p class="gallery-stage__copy">
					Pair the lighter default states and the compact chat shell so the page stays dense instead
					of spreading small examples across a tall canvas.
				</p>
			</div>
		</div>

		<div class="gallery-grid gallery-grid--two xl:items-start">
			<div class="gallery-frame grid gap-4">
				<div class="gallery-note">
					<strong>Empty</strong>
					<br />
					Short-form field with the same focus and autoresize logic as the chat variant.
				</div>
				<div class="mx-auto w-full max-w-[34rem]">
					<ChatInput variant="default" placeholder="Type a short message" submitMode="enter" />
				</div>
			</div>

			<div class="gallery-frame grid gap-4">
				<div class="gallery-note">
					<strong>Populated</strong>
					<br />
					Useful for inline assistants and compact forms that should keep a neutral shell.
				</div>
				<div class="mx-auto w-full max-w-[34rem]">
					<ChatInput bind:value={defaultValue} variant="default" submitMode="enter" />
				</div>
			</div>

			<div class="gallery-frame grid gap-4">
				<div class="gallery-note">
					<strong>Disabled</strong>
					<br />
					Shows the request-in-flight state without changing the field layout.
				</div>
				<div class="mx-auto w-full max-w-[34rem]">
					<ChatInput
						value="The field is disabled while a request is in flight."
						variant="default"
						disabled
					/>
				</div>
			</div>

			<div class="gallery-frame grid gap-4">
				<div class="gallery-note">
					<strong>Single-line shell</strong>
					<br />
					Wraps from one line into the expanded composer layout as content grows.
				</div>
				<div class="mx-auto w-full max-w-[34rem] rounded-xl border bg-muted/30 px-4 py-4 shadow-sm">
					<ChatInput bind:value={chatValue} variant="chat" placeholder="Ask anything" submitMode="enter" />
				</div>
			</div>
		</div>
	</section>

	<section class="gallery-stage">
		<div class="gallery-stage__header">
			<div>
				<p class="gallery-stage__title">Multiline expansion</p>
				<p class="gallery-stage__copy">
					The heaviest state lives on its own row so the resize behavior is easy to inspect without
					unbalancing the rest of the page.
				</p>
			</div>
		</div>

		<div class="gallery-frame grid gap-4">
			<div class="gallery-note">
				<strong>Expanded multiline</strong>
				<br />
				Shift+Enter keeps explicit newlines and makes the stepped resize more obvious.
			</div>
			<div class="mx-auto w-full max-w-[42rem] rounded-xl border bg-muted/30 px-4 py-4 shadow-sm">
				<ChatInput
					bind:value={multilineValue}
					variant="chat"
					maxLines={12}
					placeholder="Shift+Enter for a newline"
					submitMode="modEnter"
				/>
			</div>
		</div>
	</section>
</div>
