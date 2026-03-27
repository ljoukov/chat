export type ChatRole = 'assistant' | 'system' | 'user';

export type ChatAttachmentKind = 'file' | 'image';
export type ChatAttachmentStatus = 'failed' | 'ready' | 'uploading';

export type ChatTaskStatus =
	| 'draft'
	| 'failed'
	| 'queued'
	| 'ready'
	| 'running'
	| 'stopped'
	| 'success';

export type ChatPartStatusTone = 'critical' | 'muted' | 'primary';

export type ChatAttachment = {
	alt?: string;
	badge?: string;
	contentType?: string;
	detail?: string;
	error?: string;
	href?: string;
	id: string;
	kind?: ChatAttachmentKind;
	name: string;
	sizeBytes?: number;
	sizeLabel?: string;
	src?: string;
	status?: ChatAttachmentStatus;
};

export type ChatTaskCardAction = {
	disabled?: boolean;
	href?: string;
	id?: string;
	label: string;
	onClick?: () => void;
	tone?: 'default' | 'primary';
};

export type ChatTaskCardProgress = {
	label?: string;
	value: number;
};

export type ChatTaskCardStat = {
	label: string;
	value: string;
};

export type ChatTaskCardData = {
	accent?: 'cool' | 'danger' | 'default' | 'success' | 'warm';
	actions?: ChatTaskCardAction[];
	eyebrow?: string;
	id?: string;
	meta?: string;
	progress?: ChatTaskCardProgress | null;
	startedAt?: Date | number | string | null;
	stats?: ChatTaskCardStat[];
	status: ChatTaskStatus;
	statusLabel?: string;
	subtitle?: string | null;
	summary?: string | null;
	title: string;
	warning?: string | null;
};

export type ChatTextPart = {
	text: string;
	type: 'text';
};

export type ChatMarkdownPart = {
	markdown: string;
	type: 'markdown';
};

export type ChatThinkingPart = {
	collapsed?: boolean;
	label?: string;
	markdown: string;
	type: 'thinking';
};

export type ChatStatusPart = {
	label: string;
	tone?: ChatPartStatusTone;
	type: 'status';
};

export type ChatTaskCardPart = {
	task: ChatTaskCardData;
	type: 'task';
};

export type ChatCustomPart<T = unknown> = {
	data: T;
	key: string;
	type: 'custom';
};

export type ChatMessagePart =
	| ChatCustomPart
	| ChatMarkdownPart
	| ChatStatusPart
	| ChatTaskCardPart
	| ChatTextPart
	| ChatThinkingPart;

export type ChatMessageData = {
	attachments?: ChatAttachment[];
	id: string;
	label?: string;
	parts: ChatMessagePart[];
	role: ChatRole;
};

export type ChatSuggestion = {
	id?: string;
	label: string;
};

export type ChatComposerAction = {
	ariaLabel: string;
	disabled?: boolean;
	icon?: 'attach' | 'camera' | 'mic';
	label?: string;
	onClick?: () => void;
};
