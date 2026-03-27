<script lang="ts">
	import { page } from '$app/state';
	import { ChatComposer } from '@ljoukov/chat';
	import RenderSurface from '$lib/demo/RenderSurface.svelte';
	import { resolveRenderTheme } from '$lib/demo/render.js';

	const theme = $derived(resolveRenderTheme(page.url.searchParams));
	const variant = $derived.by(() => {
		const requested = page.url.searchParams.get('state');
		if (
			requested === 'empty' ||
			requested === 'expanded' ||
			requested === 'submitting' ||
			requested === 'compact'
		) {
			return requested;
		}
		return 'idle';
	});

	let idleDraft = $state('Turn the brief into a checklist.');
	let expandedDraft = $state(
		'Draft the note in three parts:\n\n1. Key blockers\n2. Recommended owner\n3. Next milestone'
	);
</script>

<svelte:head>
	<title>@ljoukov/chat · Render ChatComposer</title>
</svelte:head>

<RenderSurface
	component="composer"
	target="chat-composer"
	{theme}
	state={variant}
	panelClass="gallery-render__panel--narrow"
>
	{#if variant === 'empty'}
		<ChatComposer
			value=""
			submitMode="enter"
			attachAction={{ ariaLabel: 'Attach', icon: 'attach' }}
			cameraAction={{ ariaLabel: 'Take photo', icon: 'camera' }}
			micAction={{ ariaLabel: 'Voice note', icon: 'mic' }}
		/>
	{:else if variant === 'expanded'}
		<ChatComposer
			bind:value={expandedDraft}
			submitMode="modEnter"
			attachAction={{ ariaLabel: 'Attach', icon: 'attach' }}
			cameraAction={{ ariaLabel: 'Take photo', icon: 'camera' }}
			micAction={{ ariaLabel: 'Voice note', icon: 'mic' }}
		/>
	{:else if variant === 'submitting'}
		<ChatComposer
			value="Summarising the final note..."
			submitReady={false}
			showSubmitSpinner
			attachAction={{ ariaLabel: 'Attach', icon: 'attach' }}
			micAction={{ ariaLabel: 'Voice note', icon: 'mic' }}
		/>
	{:else if variant === 'compact'}
		<ChatComposer value="" showSubmitSpinner compactSubmitSpinner submitReady={false} />
	{:else}
		<ChatComposer
			bind:value={idleDraft}
			submitMode="enter"
			attachAction={{ ariaLabel: 'Attach', icon: 'attach' }}
			cameraAction={{ ariaLabel: 'Take photo', icon: 'camera' }}
			micAction={{ ariaLabel: 'Voice note', icon: 'mic' }}
		/>
	{/if}
</RenderSurface>
