export type DemoNavItem = {
	caption: string;
	group: string;
	href: string;
	label: string;
};

export type DemoNavGroup = {
	items: DemoNavItem[];
	label: string;
};

export const demoNavigation: DemoNavGroup[] = [
	{
		label: 'Demo',
		items: [
			{
				group: 'Demo',
				href: '/',
				label: 'Overview',
				caption: 'Landing and route map'
			},
			{
				group: 'Demo',
				href: '/chat',
				label: 'Chat In Action',
				caption: 'Live chat demo'
			}
		]
	},
	{
		label: 'Components',
		items: [
			{
				group: 'Components',
				href: '/components/input',
				label: 'ChatInput',
				caption: 'Autosize'
			},
			{
				group: 'Components',
				href: '/components/composer',
				label: 'ChatComposer',
				caption: 'Composer shell'
			},
			{
				group: 'Components',
				href: '/components/markdown',
				label: 'ChatMarkdown',
				caption: 'Markdown'
			},
			{
				group: 'Components',
				href: '/components/message',
				label: 'ChatMessage',
				caption: 'Messages'
			},
			{
				group: 'Components',
				href: '/components/task-card',
				label: 'ChatTaskCard',
				caption: 'Task cards'
			},
			{
				group: 'Components',
				href: '/components/thread',
				label: 'ChatView',
				caption: 'Threads'
			}
		]
	}
] as const;

export const flatDemoNavigation: DemoNavItem[] = demoNavigation.flatMap((group) => group.items);

export function findDemoNavItem(pathname: string): DemoNavItem | null {
	for (const item of flatDemoNavigation) {
		if (item.href === '/') {
			if (pathname === '/') {
				return item;
			}
			continue;
		}

		if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
			return item;
		}
	}

	return null;
}
