import {
	customPart,
	markdownPart,
	statusPart,
	taskPart,
	textPart,
	thinkingPart,
	type ChatAttachment,
	type ChatMessageData,
	type ChatMessagePart
} from '@ljoukov/chat';

function makeImage(label: string, start: string, end: string): string {
	const svg = `
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480">
			<defs>
				<linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
					<stop offset="0%" stop-color="${start}" />
					<stop offset="100%" stop-color="${end}" />
				</linearGradient>
			</defs>
			<rect width="640" height="480" rx="48" fill="url(#g)" />
			<circle cx="140" cy="110" r="88" fill="rgba(255,255,255,0.12)" />
			<circle cx="510" cy="370" r="128" fill="rgba(255,255,255,0.10)" />
			<text x="52" y="410" fill="white" font-size="44" font-family="ui-sans-serif, system-ui" font-weight="700">${label}</text>
		</svg>
	`.trim();
	return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const sampleImageAttachment: ChatAttachment = {
	alt: 'Mocked screenshot attachment',
	id: 'attachment-image',
	kind: 'image',
	name: 'layout-preview.png',
	sizeLabel: '1.8 MB',
	status: 'ready',
	src: makeImage('Layout preview', '#0f172a', '#7c3aed')
};

export const sampleFileAttachment: ChatAttachment = {
	badge: 'PDF',
	detail: 'Client brief',
	id: 'attachment-file',
	kind: 'file',
	name: 'briefing-pack.pdf',
	sizeLabel: '240 KB',
	status: 'ready'
};

export const sampleUploadingImageAttachment: ChatAttachment = {
	...sampleImageAttachment,
	id: 'attachment-image-uploading',
	name: 'camera-capture.jpg',
	status: 'uploading'
};

export const sampleFailedFileAttachment: ChatAttachment = {
	...sampleFileAttachment,
	detail: 'Retry required',
	error: 'Upload failed. Retry or remove this file.',
	id: 'attachment-file-failed',
	name: 'scan-annotated.pdf',
	status: 'failed'
};

export const emptySuggestions = [
	{ label: 'Summarise this brief and leave a handoff note.' },
	{ label: 'Render a task card for the current run.' },
	{ label: 'Show an embedded custom status card.' }
];

export function placeholderMessage(id: string): ChatMessageData {
	return {
		id,
		role: 'assistant',
		parts: [statusPart('Thinking...')]
	};
}

export function buildAssistantParts(prompt: string): ChatMessagePart[] {
	const normalized = prompt.toLowerCase();

	if (normalized.includes('agent') || normalized.includes('custom')) {
		return [
			thinkingPart(
				'Choosing an embedded card instead of plain markdown so the live state stays visible in-thread.'
			),
			customPart('agent-status', {
				progress: 72,
				stage: 'Collecting the final evidence bundle',
				summary:
					'The agent has already normalised the brief and is now reconciling the open blockers.',
				title: 'Analysis agent',
				updates: [
					'Attached context pack',
					'Generated a condensed plan',
					'Waiting on one unresolved owner'
				]
			}),
			markdownPart(
				'This card is rendered through the `customPart` snippet prop, so app-specific surfaces can live inside the library thread without changing the base package.'
			)
		];
	}

	if (normalized.includes('task') || normalized.includes('report')) {
		return [
			thinkingPart(
				'Laying out the status card first so the result reads like an operating surface, not just chat text.'
			),
			taskPart({
				actions: [{ href: '#', label: 'Open run', tone: 'primary' }],
				eyebrow: 'Task card',
				meta: 'Live run',
				progress: { label: 'Stage 2 of 4 complete', value: 58 },
				startedAt: new Date(Date.now() - 5 * 60 * 1000),
				stats: [
					{ label: 'Files', value: '3 attached' },
					{ label: 'Next', value: 'Draft summary' }
				],
				status: 'running',
				subtitle: 'The run is still collecting context before it writes the final note.',
				summary:
					'A generic task card can carry launch state, progress, and actions without pulling app-specific domain types into the library.',
				title: 'Brief synthesis'
			}),
			markdownPart('Use this when the response should stay actionable after the first answer lands.')
		];
	}

	if (normalized.includes('table')) {
		return [
			markdownPart(
				[
					'| Step | Owner | Status |',
					'| --- | --- | --- |',
					'| Confirm input shape | Platform | In progress |',
					'| Lock QA sign-off | Ops | Not started |',
					'| Schedule dry run | Delivery | Ready |'
				].join('\n')
			)
		];
	}

	return [
		thinkingPart('Keeping the answer concise and operational, then finishing with the next action.'),
		markdownPart(
			[
				'### Handoff note',
				'',
				'The brief is clear enough to proceed. The two things still worth tightening are owner clarity and the date of the dry run.',
				'',
				'- Keep the transcript focused on the decision, not the raw conversation.',
				'- If the result has long-running state, add a task card instead of burying it in prose.',
				'- Use the `customPart` hook when the app needs a richer card or preview component.'
			].join('\n')
		)
	];
}

export function makeUserMessage(
	id: string,
	text: string,
	attachments: ChatAttachment[] = []
): ChatMessageData {
	return {
		attachments,
		id,
		role: 'user',
		parts: [textPart(text)]
	};
}
