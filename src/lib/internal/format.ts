function isFiniteNumber(value: unknown): value is number {
	return typeof value === 'number' && Number.isFinite(value);
}

export function formatBytes(value?: number): string | null {
	if (!isFiniteNumber(value) || value < 0) {
		return null;
	}
	if (value < 1024) {
		return `${value.toString()} B`;
	}
	const units = ['KB', 'MB', 'GB', 'TB'];
	let size = value / 1024;
	let unitIndex = 0;
	while (size >= 1024 && unitIndex < units.length - 1) {
		size /= 1024;
		unitIndex += 1;
	}
	const rounded = size >= 10 ? Math.round(size) : Math.round(size * 10) / 10;
	return `${rounded.toString()} ${units[unitIndex]}`;
}

export function toDate(value?: Date | number | string | null): Date | null {
	if (value instanceof Date) {
		return Number.isNaN(value.getTime()) ? null : value;
	}
	if (typeof value === 'number' || typeof value === 'string') {
		const parsed = new Date(value);
		return Number.isNaN(parsed.getTime()) ? null : parsed;
	}
	return null;
}

export function formatRelativeTime(
	value?: Date | number | string | null,
	options: { now?: Date | number | string | null } = {}
): string | null {
	const target = toDate(value);
	if (!target) {
		return null;
	}
	const now = toDate(options.now ?? Date.now()) ?? new Date();
	const deltaMs = target.getTime() - now.getTime();
	const deltaAbs = Math.abs(deltaMs);

	if (deltaAbs < 5_000) {
		return 'just now';
	}

	const units = [
		{ unit: 'year', ms: 365 * 24 * 60 * 60 * 1_000 },
		{ unit: 'month', ms: 30 * 24 * 60 * 60 * 1_000 },
		{ unit: 'day', ms: 24 * 60 * 60 * 1_000 },
		{ unit: 'hour', ms: 60 * 60 * 1_000 },
		{ unit: 'minute', ms: 60 * 1_000 },
		{ unit: 'second', ms: 1_000 }
	] as const;

	const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

	for (const entry of units) {
		if (deltaAbs < entry.ms) {
			continue;
		}
		const amount = Math.round(deltaMs / entry.ms);
		return formatter.format(amount, entry.unit);
	}

	return formatter.format(Math.round(deltaMs / 1_000), 'second');
}
