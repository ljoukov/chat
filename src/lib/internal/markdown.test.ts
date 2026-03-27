import { describe, expect, it } from 'vitest';
import { renderChatMarkdown, renderChatMarkdownInline } from './markdown.js';

describe('renderChatMarkdown', () => {
	it('renders markdown tables', () => {
		const html = renderChatMarkdown(['| A | B |', '| --- | --- |', '| 1 | 2 |'].join('\n'));
		expect(html).toContain('<table>');
		expect(html).toContain('<td>2</td>');
	});

	it('renders inline math markers', () => {
		const html = renderChatMarkdown('Use \\(x^2 + y^2\\) to describe the curve.');
		expect(html).toContain('katex');
	});
});

describe('renderChatMarkdownInline', () => {
	it('trims inline output', () => {
		expect(renderChatMarkdownInline('`const x = 1;`')).toBe('<p><code>const x = 1;</code></p>');
	});
});
