import type {
	ChatCustomPart,
	ChatMarkdownPart,
	ChatStatusPart,
	ChatTaskCardData,
	ChatTaskCardPart,
	ChatTextPart,
	ChatThinkingPart
} from './types.js';

export function textPart(text: string): ChatTextPart {
	return { type: 'text', text };
}

export function markdownPart(markdown: string): ChatMarkdownPart {
	return { type: 'markdown', markdown };
}

export function thinkingPart(markdown: string, label = 'Thinking'): ChatThinkingPart {
	return { type: 'thinking', markdown, label };
}

export function statusPart(
	label: string,
	tone: ChatStatusPart['tone'] = 'muted'
): ChatStatusPart {
	return { type: 'status', label, tone };
}

export function taskPart(task: ChatTaskCardData): ChatTaskCardPart {
	return { type: 'task', task };
}

export function customPart<T>(key: string, data: T): ChatCustomPart<T> {
	return { type: 'custom', key, data };
}
