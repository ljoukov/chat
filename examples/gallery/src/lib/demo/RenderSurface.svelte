<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { RenderTheme } from '$lib/demo/render.js';

	type Props = {
		children: Snippet;
		component: string;
		panelClass?: string;
		state?: string | null;
		target: string;
		targetClass?: string;
		targetStyle?: string;
		theme: RenderTheme;
	};

	let {
		children,
		component,
		panelClass = '',
		state = null,
		target,
		targetClass = '',
		targetStyle = '',
		theme
	}: Props = $props();
</script>

<div
	class={`gallery-render theme-${theme}`}
	data-component-root
	data-component={component}
	data-render-ready="true"
	data-state={state ?? undefined}
	data-theme={theme}
>
	<div class={`gallery-render__panel ${panelClass}`.trim()}>
		<div class={targetClass} data-screenshot-target={target} style={targetStyle}>
			{@render children()}
		</div>
	</div>
</div>
