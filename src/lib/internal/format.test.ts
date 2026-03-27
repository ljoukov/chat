import { describe, expect, it } from 'vitest';
import { formatBytes, formatRelativeTime } from './format.js';

describe('formatBytes', () => {
	it('formats binary sizes into readable units', () => {
		expect(formatBytes(980)).toBe('980 B');
		expect(formatBytes(1_536)).toBe('1.5 KB');
		expect(formatBytes(5 * 1024 * 1024)).toBe('5 MB');
	});
});

describe('formatRelativeTime', () => {
	it('formats recent and older timestamps', () => {
		const now = new Date('2026-03-26T12:00:00.000Z');
		expect(formatRelativeTime('2026-03-26T11:59:58.500Z', { now })).toBe('just now');
		expect(formatRelativeTime('2026-03-26T11:55:00.000Z', { now })).toBe('5 minutes ago');
	});
});
