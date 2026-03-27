import {
	markdownPart,
	taskPart,
	textPart,
	thinkingPart,
	type ChatMessageData,
	type ChatTaskCardData
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
			<rect width="640" height="480" fill="url(#g)" rx="48" />
			<circle cx="510" cy="92" r="78" fill="rgba(255,255,255,0.15)" />
			<circle cx="164" cy="384" r="118" fill="rgba(255,255,255,0.10)" />
			<text x="48" y="420" fill="white" font-size="46" font-family="ui-sans-serif, system-ui" font-weight="700">${label}</text>
		</svg>
	`.trim();
	return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const annotatedImage = makeImage('Annotated brief', '#0f172a', '#2563eb');
const sketchImage = makeImage('Wireframe', '#1f2937', '#ea580c');

export const taskCards: ChatTaskCardData[] = [
	{
		actions: [{ href: '#inputs', label: 'Open composer' }],
		eyebrow: 'Run card',
		meta: 'Queued 1m ago',
		progress: { label: 'Waiting for the workspace to warm up', value: 18 },
		startedAt: new Date(Date.now() - 60 * 1000),
		status: 'queued',
		stats: [
			{ label: 'Files', value: '1 brief' },
			{ label: 'Queue', value: 'Position 2' }
		],
		subtitle: 'Workspace bootstrap and context capture',
		summary: 'Preparing the run, attaching the source brief, and writing the first draft outline.',
		title: 'Quarterly review brief'
	},
	{
		actions: [{ href: '#thread', label: 'Open transcript', tone: 'primary' }],
		eyebrow: 'Run card',
		meta: '63% complete',
		progress: { label: '3 of 5 stages complete', value: 63 },
		startedAt: new Date(Date.now() - 11 * 60 * 1000),
		stats: [
			{ label: 'Files', value: '6 attached' },
			{ label: 'Tokens', value: '42k context' }
		],
		status: 'running',
		subtitle: 'Summarise findings, then draft follow-up actions',
		summary: 'The agent is working through the evidence pack and producing a final handoff note.',
		title: 'Migration readiness audit'
	},
	{
		accent: 'success',
		actions: [{ href: '#inputs', label: 'Copy import' }],
		eyebrow: 'Run card',
		meta: 'Ready',
		stats: [
			{ label: 'Marks', value: '8/10' },
			{ label: 'Notes', value: '2 follow-ups' }
		],
		status: 'success',
		subtitle: 'Problem 8 - uploaded references only',
		summary: 'The run finished with a scored report, a short transcript summary, and a clear next-step checklist.',
		title: 'Grading summary'
	}
];

export const heroMessages: ChatMessageData[] = [
	{
		id: 'hero-user',
		role: 'user',
		attachments: [
			{
				id: 'hero-brief',
				kind: 'file',
				name: 'migration-brief.pdf',
				badge: 'PDF',
				detail: 'Strategy memo'
			}
		],
		parts: [textPart('Pull the decision points out of the brief and turn them into a clean launch checklist.')]
	},
	{
		id: 'hero-assistant',
		role: 'assistant',
		parts: [
			thinkingPart('Grouping the brief into launch risk, owner, and evidence buckets before drafting the final note.'),
			taskPart(taskCards[1]),
			markdownPart(
				[
					'### Launch frame',
					'',
					'- Reduce ambiguity first: the rollout note should call out owner, deadline, and blocker in the same sentence.',
					'- Keep the assistant output grounded in attachments, then let your app map those outputs into follow-up cards.',
					'- Render markdown, status cards, and attachments in the same thread so context never fragments.'
				].join('\n')
			)
		]
	}
];

export const threadMessages: ChatMessageData[] = [
	{
		id: 'thread-user-1',
		role: 'user',
		attachments: [
			{
				id: 'thread-file-1',
				kind: 'file',
				name: 'client-kickoff.md',
				badge: 'MD',
				detail: 'Shared agenda'
			},
			{
				id: 'thread-image-1',
				kind: 'image',
				name: 'whiteboard.png',
				src: annotatedImage,
				alt: 'Annotated whiteboard from the kickoff'
			}
		],
		parts: [
			textPart('Summarise the kickoff, highlight the blockers, and leave me with a crisp next-step table.')
		]
	},
	{
		id: 'thread-assistant-1',
		role: 'assistant',
		parts: [
			thinkingPart('Pulling out dependencies first so the summary reads like an operating note, not a transcript.'),
			markdownPart(
				[
					'### What matters',
					'',
					'The call surfaced **three real blockers**: access to the data export, unclear owner for QA sign-off, and a missing dry-run date.',
					'',
					'| Next step | Owner | Why it matters |',
					'| --- | --- | --- |',
					'| Confirm export shape | Platform | Blocks the rest of the migration prep. |',
					'| Lock QA sign-off owner | Ops | Prevents late ambiguity before launch. |',
					'| Schedule the dry run | Delivery | Gives the team one rehearsal before cutover. |'
				].join('\n')
			)
		]
	},
	{
		id: 'thread-user-2',
		role: 'user',
		parts: [textPart('Wrap that into a task card and call out the highest-risk dependency.')]
	},
	{
		id: 'thread-assistant-2',
		role: 'assistant',
		attachments: [
			{
				id: 'thread-image-2',
				kind: 'image',
				name: 'task-board.png',
				src: sketchImage,
				alt: 'Task board sketch'
			}
		],
		parts: [
			taskPart({
				actions: [{ href: '#status-cards', label: 'View states', tone: 'primary' }],
				eyebrow: 'Status card',
				meta: 'High risk',
				progress: { label: 'Owner locked, dry run pending', value: 52 },
				startedAt: new Date(Date.now() - 8 * 60 * 1000),
				stats: [
					{ label: 'Risk', value: 'Export format' },
					{ label: 'ETA', value: '2 days' }
				],
				status: 'running',
				subtitle: 'The export contract still needs a committed owner.',
				summary: 'This is the dependency most likely to block downstream planning, because every other task assumes a stable data shape.',
				title: 'Migration tracker'
			}),
			markdownPart('The card stays inside the thread, so the user can move from chat copy to structured status without switching surfaces.')
		]
	}
];

export const taskCardStates: ChatTaskCardData[] = [
	{
		status: 'draft',
		title: 'Draft plan',
		eyebrow: 'Task card',
		meta: 'Needs review',
		subtitle: 'The task is prepared but has not started yet.',
		summary: 'Use this state before a run is accepted or queued.'
	},
	{
		status: 'queued',
		title: 'Workspace bootstrap',
		eyebrow: 'Task card',
		meta: 'Queued',
		progress: { value: 16, label: 'Waiting for an execution slot' },
		startedAt: new Date(Date.now() - 2 * 60 * 1000),
		stats: [
			{ label: 'Queue', value: 'Position 2' },
			{ label: 'Files', value: '1 brief' }
		],
		subtitle: 'The run is accepted and waiting to begin.',
		summary: 'Queued cards keep the created request and its progress in the transcript.'
	},
	{
		status: 'running',
		title: 'Brief synthesis',
		eyebrow: 'Task card',
		meta: 'In progress',
		progress: { value: 58, label: 'Stage 2 of 4 complete' },
		startedAt: new Date(Date.now() - 7 * 60 * 1000),
		stats: [
			{ label: 'Files', value: '3 attached' },
			{ label: 'Next', value: 'Draft summary' }
		],
		subtitle: 'The run is collecting evidence before it writes the note.',
		summary: 'Running cards can show age, progress, stats, and actions.'
	},
	{
		status: 'ready',
		title: 'Handoff bundle',
		eyebrow: 'Task card',
		meta: 'Ready',
		stats: [
			{ label: 'Artifacts', value: '4 items' },
			{ label: 'Owner', value: 'Ops' }
		],
		subtitle: 'The output is ready to review or publish.',
		summary: 'Ready is useful when a downstream human action is now required.'
	},
	{
		status: 'success',
		title: 'Launch checklist',
		eyebrow: 'Task card',
		meta: 'Complete',
		stats: [
			{ label: 'Checks', value: '8 passed' },
			{ label: 'Follow-ups', value: '2' }
		],
		actions: [{ label: 'Open summary', href: '#', tone: 'primary' }],
		subtitle: 'The run finished successfully with a clean summary.',
		summary: 'Success can stay in-thread as a durable status artifact.'
	},
	{
		status: 'failed',
		title: 'Attachment import',
		eyebrow: 'Task card',
		meta: 'Failed',
		warning: 'The PDF could not be parsed because the upload expired.',
		actions: [{ label: 'Retry', href: '#', tone: 'primary' }],
		subtitle: 'The task stopped before it could produce a result.',
		summary: 'Failure cards should keep the user near the source request and error.'
	},
	{
		status: 'stopped',
		title: 'Draft follow-up',
		eyebrow: 'Task card',
		meta: 'Stopped',
		stats: [
			{ label: 'Progress', value: '2 of 4' },
			{ label: 'Reason', value: 'User cancelled' }
		],
		subtitle: 'The run was intentionally stopped before completion.',
		summary: 'Stopped is distinct from failed when cancellation is user-driven.'
	}
];

export const markdownShowcase = [
	'### Launch checklist',
	'',
	'The renderer supports **lists**, tables, code blocks, inline code like `npm run verify`, and maths.',
	'',
	'> Keep status close to the answer so the chat surface stays operational.',
	'',
	'- Confirm the owner',
	'- Lock the dry-run date',
	'- Attach the final brief',
	'',
	'| Step | Owner | Status |',
	'| --- | --- | --- |',
	'| Confirm export shape | Platform | In progress |',
	'| Lock QA sign-off | Ops | Pending |',
	'| Schedule dry run | Delivery | Ready |',
	'',
	'```ts',
	"const nextMessage = { role: 'assistant', parts: [taskPart(runCard)] };",
	'```',
	'',
	'Inline maths: $E = mc^2$',
	'',
	'Display maths:',
	'',
	'$$',
	'\\int_0^1 x^2 \\, dx = \\frac{1}{3}',
	'$$'
].join('\n');

export const inlineMarkdownShowcase =
	'Keep `taskPart()` in the thread and render $\\alpha + \\beta$ inline with the reply.';
