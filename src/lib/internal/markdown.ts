import hljs from 'highlight.js/lib/core';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import typescript from 'highlight.js/lib/languages/typescript';
import katex from 'katex';
import { marked, type TokenizerAndRendererExtension } from 'marked';
import markedKatex from 'marked-katex-extension';

hljs.registerLanguage('c', c);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('typescript', typescript);

const LANGUAGE_ALIASES = new Map<string, string>([
	['c', 'c'],
	['c++', 'cpp'],
	['cc', 'cpp'],
	['cpp', 'cpp'],
	['cxx', 'cpp'],
	['javascript', 'javascript'],
	['js', 'javascript'],
	['py', 'python'],
	['python', 'python'],
	['ts', 'typescript'],
	['typescript', 'typescript']
]);

const LANGUAGE_LABELS = new Map<string, string>([
	['c', 'c'],
	['cpp', 'c++'],
	['javascript', 'js'],
	['python', 'python'],
	['typescript', 'ts']
]);

const INLINE_PAREN_MATH_RULE = /^\\\(((?:\\.|[^\\\n])+?)\\\)/;
const INLINE_BRACKET_MATH_RULE = /^\\\[(((?:\\.|[^\\\n])+?))\\\]/;
const BLOCK_BRACKET_MATH_RULE = /^\\\[\n((?:\\[^]|[^\\])+?)\n\\\](?:\n|$)/;

type CodeSpanMath = {
	displayMode: boolean;
	expr: string;
};

type BackslashMathToken = {
	displayMode: boolean;
	raw: string;
	text: string;
	type: 'blockBackslashMath' | 'inlineBackslashMath';
};

function escapeHtml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

function isSafeUrl(href: string): boolean {
	const normalized = href.trim();
	if (
		normalized.startsWith('#') ||
		normalized.startsWith('/') ||
		normalized.startsWith('./') ||
		normalized.startsWith('../')
	) {
		return true;
	}
	try {
		const url = new URL(normalized);
		return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol);
	} catch {
		return false;
	}
}

function renderKatex(expr: string, displayMode: boolean): string {
	return katex.renderToString(expr, { displayMode, throwOnError: false });
}

function resolveLanguageLabel(raw: string, normalized: string): string {
	if (normalized && LANGUAGE_LABELS.has(normalized)) {
		return LANGUAGE_LABELS.get(normalized) ?? raw;
	}
	return raw || normalized || 'text';
}

function parseCodeSpanMath(value: string): CodeSpanMath | null {
	const trimmed = value.trim();
	if (trimmed.length < 3 || trimmed.includes('\n') || trimmed.includes('\r')) {
		return null;
	}

	if (trimmed.startsWith('$$') && trimmed.endsWith('$$') && trimmed.length > 4) {
		const expr = trimmed.slice(2, -2).trim();
		if (expr.length > 0 && !expr.includes('$')) {
			return { expr, displayMode: true };
		}
	}

	if (trimmed.startsWith('\\[') && trimmed.endsWith('\\]') && trimmed.length > 4) {
		const expr = trimmed.slice(2, -2).trim();
		if (expr.length > 0) {
			return { expr, displayMode: true };
		}
	}

	if (trimmed.startsWith('$') && trimmed.endsWith('$') && trimmed.length > 2) {
		const expr = trimmed.slice(1, -1).trim();
		if (expr.length > 0 && !expr.includes('$')) {
			return { expr, displayMode: false };
		}
	}

	if (trimmed.startsWith('\\(') && trimmed.endsWith('\\)') && trimmed.length > 4) {
		const expr = trimmed.slice(2, -2).trim();
		if (expr.length > 0) {
			return { expr, displayMode: false };
		}
	}

	return null;
}

function createInlineBackslashMathExtension(): TokenizerAndRendererExtension {
	return {
		name: 'inlineBackslashMath',
		level: 'inline',
		start(src) {
			const parenIndex = src.indexOf('\\(');
			const bracketIndex = src.indexOf('\\[');
			if (parenIndex === -1) {
				return bracketIndex === -1 ? undefined : bracketIndex;
			}
			if (bracketIndex === -1) {
				return parenIndex;
			}
			return Math.min(parenIndex, bracketIndex);
		},
		tokenizer(src) {
			const parenMatch = src.match(INLINE_PAREN_MATH_RULE);
			if (parenMatch) {
				const text = parenMatch[1]?.trim() ?? '';
				if (text.length > 0) {
					return {
						type: 'inlineBackslashMath',
						raw: parenMatch[0],
						text,
						displayMode: false
					} satisfies BackslashMathToken;
				}
			}

			const bracketMatch = src.match(INLINE_BRACKET_MATH_RULE);
			if (bracketMatch) {
				const text = bracketMatch[1]?.trim() ?? '';
				if (text.length > 0) {
					return {
						type: 'inlineBackslashMath',
						raw: bracketMatch[0],
						text,
						displayMode: true
					} satisfies BackslashMathToken;
				}
			}

			return undefined;
		},
		renderer(token) {
			const next = token as BackslashMathToken;
			return renderKatex(next.text, next.displayMode);
		}
	};
}

function createBlockBackslashMathExtension(): TokenizerAndRendererExtension {
	return {
		name: 'blockBackslashMath',
		level: 'block',
		tokenizer(src) {
			const match = src.match(BLOCK_BRACKET_MATH_RULE);
			if (!match) {
				return undefined;
			}
			const text = match[1]?.trim() ?? '';
			if (text.length === 0) {
				return undefined;
			}
			return {
				type: 'blockBackslashMath',
				raw: match[0],
				text,
				displayMode: true
			} satisfies BackslashMathToken;
		},
		renderer(token) {
			const next = token as BackslashMathToken;
			return `${renderKatex(next.text, true)}\n`;
		}
	};
}

function normalizeLatexLists(markdown: string): string {
	const lines = markdown.split(/\r?\n/u);
	const normalized: string[] = [];

	for (const line of lines) {
		const trimmed = line.trim();
		if (/^\\begin\{(enumerate|itemize)\}/u.test(trimmed)) {
			normalized.push('');
			continue;
		}
		if (/^\\end\{(enumerate|itemize)\}/u.test(trimmed)) {
			normalized.push('');
			continue;
		}
		const itemMatch = trimmed.match(/^\\item\s+(.*)$/u);
		if (itemMatch) {
			normalized.push(`- ${itemMatch[1] ?? ''}`);
			continue;
		}
		normalized.push(line);
	}

	return normalized.join('\n');
}

marked.setOptions({
	breaks: true,
	gfm: true
});

marked.use(
	markedKatex({
		nonStandard: true,
		throwOnError: false
	})
);

marked.use({
	extensions: [createInlineBackslashMathExtension(), createBlockBackslashMathExtension()]
});

const renderer = new marked.Renderer();

renderer.link = ({ href, text, title }) => {
	const safeHref = href && isSafeUrl(href) ? href : null;
	const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
	const rel = safeHref?.startsWith('http') ? ' rel="noreferrer"' : '';
	const target = safeHref?.startsWith('http') ? ' target="_blank"' : '';
	const inner = text || safeHref || '';

	if (!safeHref) {
		return `<span>${inner}</span>`;
	}

	return `<a href="${escapeHtml(safeHref)}"${titleAttr}${rel}${target}>${inner}</a>`;
};

renderer.image = ({ href, text, title }) => {
	const safeHref = href && isSafeUrl(href) ? href : null;
	if (!safeHref) {
		return '';
	}
	const alt = escapeHtml(text || '');
	const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
	return `<img src="${escapeHtml(safeHref)}" alt="${alt}" loading="lazy"${titleAttr}>`;
};

renderer.codespan = ({ text }) => {
	const code = typeof text === 'string' ? text : '';
	const math = parseCodeSpanMath(code);
	if (math) {
		return renderKatex(math.expr, math.displayMode);
	}
	return `<code>${escapeHtml(code)}</code>`;
};

renderer.code = ({ text, lang }) => {
	const code = typeof text === 'string' ? text : '';
	const rawLanguage = (lang ?? '').trim().split(/\s+/u)[0]?.toLowerCase() ?? '';
	const normalized = LANGUAGE_ALIASES.get(rawLanguage) ?? rawLanguage;
	const resolved = normalized && hljs.getLanguage(normalized) ? normalized : '';
	const label = resolveLanguageLabel(rawLanguage, normalized);
	const highlighted = resolved
		? hljs.highlight(code, { language: resolved }).value
		: escapeHtml(code);
	const languageClass = resolved ? `hljs language-${resolved}` : 'hljs language-text';

	return [
		'<div class="code-block">',
		'<div class="code-block__header">',
		`<span class="code-block__lang">${escapeHtml(label)}</span>`,
		'<button class="code-block__copy" type="button" data-code-copy aria-label="Copy code">',
		'<svg class="code-block__copy-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">',
		'<rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>',
		'<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>',
		'</svg>',
		'<span class="sr-only">Copy code</span>',
		'</button>',
		'</div>',
		`<pre><code class="${languageClass}">${highlighted}</code></pre>`,
		'</div>'
	].join('');
};

function renderMarkdown(value: string): string {
	return marked.parse(normalizeLatexLists(value), { renderer }) as string;
}

export function renderChatMarkdown(markdown: string): string {
	return renderMarkdown(markdown);
}

export function renderChatMarkdownInline(markdown: string): string {
	return renderMarkdown(markdown).trim();
}
