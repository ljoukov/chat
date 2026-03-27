<script lang="ts">
	import * as Card from '$demo/components/ui/card/index.js';

	type AgentStatus = {
		progress: number;
		stage: string;
		summary: string;
		title: string;
		updates: string[];
	};

	let { status }: { status: AgentStatus } = $props();

	const progress = $derived(Math.max(0, Math.min(100, status.progress)));
</script>

<Card.Root class="gap-5 rounded-[1.25rem] border bg-card/95 shadow-sm">
	<Card.Header class="gap-3 px-5 pt-5 pb-0">
		<div class="flex items-center justify-between gap-3">
			<span
				class="inline-flex items-center rounded-full border bg-muted/70 px-3 py-1 text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase"
			>
				Embedded card
			</span>
			<span class="text-xs font-medium text-muted-foreground">{progress}%</span>
		</div>
		<Card.Title class="text-[1.15rem] tracking-tight">{status.title}</Card.Title>
		<Card.Description class="leading-6">{status.summary}</Card.Description>
	</Card.Header>

	<Card.Content class="space-y-5 px-5 pb-5">
		<div class="space-y-2.5">
			<div class="h-2.5 rounded-full bg-muted" aria-hidden="true">
				<div
					class="h-full rounded-full bg-primary transition-[width]"
					style={`width:${progress.toString()}%`}
				></div>
			</div>
			<p class="text-sm font-medium text-muted-foreground">{status.stage}</p>
		</div>

		<div class="grid gap-2.5">
			{#each status.updates as update, index (update + index.toString())}
				<div class="rounded-xl border bg-muted/35 px-3.5 py-2.5 text-sm leading-6 shadow-xs">
					{update}
				</div>
			{/each}
		</div>
	</Card.Content>
</Card.Root>
