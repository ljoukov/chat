<script lang="ts">
	import PanelLeftIcon from '@lucide/svelte/icons/panel-left';
	import { page } from '$app/state';
	import { ModeWatcher } from 'mode-watcher';
	import ThemeToggle from '$lib/demo/theme-toggle.svelte';
	import { demoNavigation, findDemoNavItem } from '$lib/demo/navigation.js';

	let { children } = $props();
	let sidebarOpen = $state(true);

	function isActive(href: string): boolean {
		if (href === '/') {
			return page.url.pathname === '/';
		}

		return page.url.pathname === href || page.url.pathname.startsWith(`${href}/`);
	}

	const breadcrumbItems = $derived.by(() => {
		const current = findDemoNavItem(page.url.pathname);
		if (!current) {
			return ['@ljoukov/chat'];
		}

		if (current.group === 'Demo') {
			return ['@ljoukov/chat', current.label];
		}

		return ['@ljoukov/chat', current.group, current.label];
	});

	function toggleSidebar(): void {
		sidebarOpen = !sidebarOpen;
	}
</script>

<svelte:head>
	<title>@ljoukov/chat Demo</title>
	<meta
		name="description"
		content="Unified demo app for @ljoukov/chat with live chat flows and route-based component documentation."
	/>
</svelte:head>

<ModeWatcher defaultMode="system" disableTransitions />

<div class={`gallery-app ${sidebarOpen ? '' : 'is-sidebar-collapsed'}`}>
	<aside class="gallery-sidebar">
		<div class="gallery-sidebar__header">
			<div class="gallery-sidebar__header-main">
				<div class="gallery-brand">
					<div class="gallery-brand__eyebrow">Demo app</div>
					<h1 class="gallery-brand__title">@ljoukov/chat</h1>
					<p class="gallery-brand__copy">Live demo and component docs.</p>
				</div>

				<ThemeToggle />
			</div>
		</div>

		<div class="gallery-sidebar__content">
			<nav class="gallery-nav" aria-label="Demo navigation">
				{#each demoNavigation as group (group.label)}
					<section class="gallery-nav__group">
						<h2 class="gallery-nav__group-label">{group.label}</h2>
						<div class="gallery-nav__group-items">
							{#each group.items as item (item.href)}
								<a
									class={`gallery-nav__link ${isActive(item.href) ? 'is-active' : ''}`}
									href={item.href}
								>
									<span class="gallery-nav__title">{item.label}</span>
									<span class="gallery-nav__caption">{item.caption}</span>
								</a>
							{/each}
						</div>
					</section>
				{/each}
			</nav>
		</div>
	</aside>

	<main class="gallery-main">
		<div class="gallery-main__bar">
			<div class="gallery-bar__start">
				<button
					type="button"
					class="gallery-sidebar-trigger"
					aria-label={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
					aria-pressed={sidebarOpen}
					onclick={toggleSidebar}
				>
					<PanelLeftIcon class="gallery-sidebar-trigger__icon" aria-hidden="true" />
					<span class="sr-only">{sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}</span>
				</button>

				<div class="gallery-breadcrumbs" aria-label="Breadcrumb">
					{#each breadcrumbItems as item, index (item)}
						{#if index > 0}
							<span class="gallery-breadcrumbs__separator">/</span>
						{/if}
						<span class={`gallery-breadcrumbs__item ${index === breadcrumbItems.length - 1 ? 'is-current' : ''}`}>
							{item}
						</span>
					{/each}
				</div>
			</div>
		</div>

		<div class="gallery-main__content">{@render children()}</div>
	</main>
</div>
