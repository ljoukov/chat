<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$demo/utils.js';

	let { class: className, children, ...restProps }: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div
	data-slot="card-footer"
	class={cn('flex items-center px-6 [.border-t]:pt-6', className)}
	{...restProps}
>
	{@render children?.()}
</div>
