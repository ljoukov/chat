<svelte:head>
	<title>@ljoukov/chat</title>
</svelte:head>

<script lang="ts">
	const commands = ['npm run dev:gallery', 'npm run dev:chat', 'npm run verify'];
</script>

<div class="page">
	<p class="eyebrow">Svelte component library</p>
	<h1>@ljoukov/chat</h1>
	<p class="lede">
		A reusable chat UI package for Svelte 5 with thread rendering, markdown replies, task cards,
		and composer primitives.
	</p>

	<div class="panel">
		<h2>Repo commands</h2>
		<ul>
			{#each commands as command (command)}
				<li><code>{command}</code></li>
			{/each}
		</ul>
	</div>
</div>

<style>
	:global(html) {
		background: #0b1120;
		color: #e2e8f0;
		font-family: 'Manrope', 'Avenir Next', 'Segoe UI', sans-serif;
	}

	:global(body) {
		margin: 0;
	}

	.page {
		width: min(720px, calc(100vw - 32px));
		margin: 0 auto;
		padding: 72px 0;
		display: grid;
		gap: 18px;
	}

	.eyebrow,
	.lede,
	.panel h2,
	.panel ul {
		margin: 0;
	}

	.eyebrow {
		font-size: 0.78rem;
		font-weight: 800;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: rgba(191, 219, 254, 0.84);
	}

	h1 {
		margin: 0;
		font-size: clamp(2.5rem, 5vw, 4rem);
		line-height: 0.98;
	}

	.lede {
		line-height: 1.7;
		color: rgba(226, 232, 240, 0.8);
	}

	.panel {
		padding: 18px;
		border-radius: 20px;
		border: 1px solid rgba(148, 163, 184, 0.2);
		background: rgba(255, 255, 255, 0.04);
	}

	.panel ul {
		padding-left: 1.2rem;
		line-height: 1.9;
	}

	code {
		font-family: 'SFMono-Regular', ui-monospace, monospace;
	}
</style>
