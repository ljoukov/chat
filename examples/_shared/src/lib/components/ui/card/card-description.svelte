<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$demo/utils.js';

	let { class: className, children, ...restProps }: HTMLAttributes<HTMLParagraphElement> = $props();
</script>

<div
	data-slot="card-description"
	class={cn('text-muted-foreground text-sm', className)}
	{...restProps}
>
	{@render children?.()}
</div>
