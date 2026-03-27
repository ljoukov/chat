<script lang="ts">
	import { resolve } from '$app/paths';

	const renderRoutes = [
		{
			component: 'chat',
			path: '/render/chat',
			query: 'theme=light',
			states: ['demo']
		},
		{
			component: 'input',
			path: '/render/input',
			query: 'theme=light',
			states: ['default', 'chat']
		},
		{
			component: 'composer',
			path: '/render/composer',
			query: 'theme=light',
			states: ['idle', 'expanded', 'submitting']
		},
		{
			component: 'task-card',
			path: '/render/task-card',
			query: 'theme=light',
			states: ['running', 'success', 'failed']
		},
		{
			component: 'thread',
			path: '/render/thread',
			query: 'theme=light&state=mapped',
			states: ['empty', 'mapped']
		},
		{
			component: 'message',
			path: '/render/message',
			query: 'theme=light&state=custom',
			states: ['assistant', 'attachments', 'custom']
		},
		{
			component: 'markdown',
			path: '/render/markdown',
			query: 'theme=light&state=block',
			states: ['block', 'inline']
		}
	] as const;

	const renderRouteLinks = renderRoutes.map((route) => ({
		...route,
		href: `${resolve(route.path)}?${route.query}`
	}));
</script>

<svelte:head>
	<title>@ljoukov/chat · Render Routes</title>
</svelte:head>

<div class="gallery-render theme-light" data-component-root data-component="index" data-theme="light">
	<div class="gallery-surface grid w-full max-w-4xl gap-5 p-6">
		<div class="grid gap-3">
			<h1 class="text-2xl font-semibold tracking-tight">Component render routes</h1>
			<p class="text-sm leading-6 text-muted-foreground">
				These routes render only the component showcase surface. Use them for docs screenshots and
				visual review. Pass <code>theme=light</code> or <code>theme=dark</code>; routes with focused
				variants also accept <code>state</code>.
			</p>
		</div>

		<div class="gallery-list">
			{#each renderRouteLinks as route (route.component)}
				<a class="gallery-list__item" href={route.href}>
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
