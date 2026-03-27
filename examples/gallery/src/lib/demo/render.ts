export type RenderTheme = 'dark' | 'light';

export function resolveRenderTheme(searchParams: URLSearchParams): RenderTheme {
	return searchParams.get('theme') === 'dark' ? 'dark' : 'light';
}
