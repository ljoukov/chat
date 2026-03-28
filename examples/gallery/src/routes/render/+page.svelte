<script lang="ts">
	const renderRoutes = [
		{
			component: 'chat',
			path: '/render/chat',
			query: 'theme=light',
			states: ['demo']
		},
		{
			component: 'composer',
			path: '/render/composer',
			query: 'theme=light&state=idle',
			states: ['idle', 'expanded', 'submitting', 'attachments']
		},
		{
			component: 'input',
			path: '/render/input',
			query: 'theme=light',
			states: ['default', 'chat']
		},
		{
			component: 'markdown',
			path: '/render/markdown',
			query: 'theme=light&state=block',
			states: ['block', 'inline']
		},
		{
			component: 'message',
			path: '/render/message',
			query: 'theme=light&state=custom',
			states: ['assistant', 'attachments', 'custom']
		},
		{
			component: 'task-card',
			path: '/render/task-card',
			query: 'theme=light&state=running',
			states: ['running', 'success', 'failed']
		},
		{
			component: 'thread',
			path: '/render/thread',
			query: 'theme=light&state=mapped',
			states: ['empty', 'mapped']
		}
	] as const;
</script>

<div class="gallery-render theme-light" data-component-root data-component="index" data-theme="light">
	<div class="gallery-render__docs">
		<h1 class="gallery-render__docs-title">Component render routes</h1>
		<p class="gallery-render__docs-copy">
			Each route renders a single capture surface with no gallery sidebar or header chrome. Use the
			<code>theme</code> query param for light or dark mode and the <code>state</code> query param for
			component variants where applicable.
		</p>

		<div class="gallery-list">
			{#each renderRoutes as route (route.component)}
				<a class="gallery-list__item" href={`${route.path}?${route.query}`}>
					<div>
						<h2 class="gallery-list__item-title">{route.component}</h2>
						<p class="gallery-list__item-copy">States: {route.states.join(', ')}</p>
					</div>
					<span class="gallery-pill">Open render</span>
				</a>
			{/each}
		</div>
	</div>
</div>
