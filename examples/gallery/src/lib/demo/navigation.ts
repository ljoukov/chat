export type DemoNavItem = {
	caption: string;
	href: string;
	label: string;
};

export const demoNavigation: DemoNavItem[] = [
	{
		href: '/',
		label: 'Overview',
		caption: 'Routes and render surfaces'
	},
	{
		href: '/chat',
		label: 'Chat',
		caption: 'Live thread demo'
	},
	{
		href: '/composer',
		label: 'Composer',
		caption: 'Spark-style input shell'
	},
	{
		href: '/input',
		label: 'Input',
		caption: 'Autosize textarea'
	},
	{
		href: '/markdown',
		label: 'Markdown',
		caption: 'Rich text rendering'
	},
	{
		href: '/message',
		label: 'Message',
		caption: 'Attachments and message parts'
	},
	{
		href: '/task-card',
		label: 'Task card',
		caption: 'Run state card'
	},
	{
		href: '/thread',
		label: 'Thread',
		caption: 'Full transcript surface'
	}
] as const;

export function findDemoNavItem(pathname: string): DemoNavItem | null {
	for (const item of demoNavigation) {
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
