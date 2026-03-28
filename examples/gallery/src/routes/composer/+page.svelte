<script lang="ts">
	import { ChatComposer } from '@ljoukov/chat';
	import {
		sampleFailedFileAttachment,
		sampleFileAttachment,
		sampleImageAttachment,
		sampleUploadingImageAttachment
	} from '$lib/demo/chat-demo.js';

	let idleDraft = $state('Turn the brief into a concise launch checklist.');
	let expandedDraft = $state(
		'Draft the note in three parts:\n\n1. Key blockers\n2. Recommended owner\n3. Next milestone'
	);
	let readyAttachments = $state([{ ...sampleImageAttachment }, { ...sampleFileAttachment }]);
	let uploadAttachments = $state([{ ...sampleUploadingImageAttachment }, { ...sampleFailedFileAttachment }]);
</script>

<svelte:head>
	<title>@ljoukov/chat · ChatComposer</title>
</svelte:head>

<div class="gallery-page max-w-[58rem]">
	<header class="gallery-page__intro">
		<div class="gallery-page__eyebrow">Composer</div>
		<h1 class="gallery-page__title">Spark-style composer shells with attachments and action chrome.</h1>
		<p class="gallery-page__description">
			The composer surface now follows Spark’s structure more closely: draft attachments live inside the
			shell, the leading control opens an attachment menu, and multiline growth stays predictable.
		</p>
	</header>

	<section class="gallery-grid gallery-grid--two xl:items-start">
		<div class="gallery-stage">
			<div class="gallery-stage__header">
				<div>
					<p class="gallery-stage__title">Draft states</p>
					<p class="gallery-stage__copy">
						The same shell handles a default attached draft and a multiline note without changing the
						component contract.
					</p>
				</div>
			</div>

			<div class="grid gap-4">
				<div class="gallery-frame grid gap-4">
					<div class="gallery-note">
						<strong>Attached draft</strong>
						<br />
						Ready attachments render above the field while the shell stays compact and send-ready.
					</div>
					<div class="mx-auto w-full max-w-[25rem]">
						<ChatComposer
							bind:value={idleDraft}
							attachments={readyAttachments}
							submitMode="enter"
							attachAction={{ ariaLabel: 'Attach', icon: 'attach', label: 'Add photos & files' }}
							cameraAction={{ ariaLabel: 'Take photo', icon: 'camera' }}
							micAction={{ ariaLabel: 'Voice note', icon: 'mic' }}
							onRemoveAttachment={(attachment) => {
								readyAttachments = readyAttachments.filter((entry) => entry.id !== attachment.id);
							}}
						/>
					</div>
				</div>

				<div class="gallery-frame grid gap-4">
					<div class="gallery-note">
						<strong>Expanded draft</strong>
						<br />
						When the textarea grows, the action row drops below the field instead of stretching the
						shell.
					</div>
					<div class="mx-auto w-full max-w-[25rem]">
						<ChatComposer
							bind:value={expandedDraft}
							submitMode="modEnter"
							attachAction={{ ariaLabel: 'Attach', icon: 'attach', label: 'Add photos & files' }}
							cameraAction={{ ariaLabel: 'Take photo', icon: 'camera' }}
							micAction={{ ariaLabel: 'Voice note', icon: 'mic' }}
						/>
					</div>
				</div>
			</div>
		</div>

		<div class="gallery-stage">
			<div class="gallery-stage__header">
				<div>
					<p class="gallery-stage__title">Runtime states</p>
					<p class="gallery-stage__copy">
						Upload feedback and compact in-flight states stay within the same public component.
					</p>
				</div>
			</div>

			<div class="grid gap-4">
				<div class="gallery-frame grid gap-4">
					<div class="gallery-note">
						<strong>Upload feedback</strong>
						<br />
						Uploading and failed attachments keep retry and remove affordances inside the shell.
					</div>
					<div class="mx-auto w-full max-w-[25rem]">
						<ChatComposer
							value="Summarise the screenshots and keep the upload note."
							attachments={uploadAttachments}
							attachmentError="One image failed to upload. Retry or remove it before sending."
							submitMode="enter"
							attachAction={{ ariaLabel: 'Attach', icon: 'attach', label: 'Add photos & files' }}
							cameraAction={{ ariaLabel: 'Take photo', icon: 'camera' }}
							micAction={{ ariaLabel: 'Voice note', icon: 'mic' }}
							onRemoveAttachment={(attachment) => {
								uploadAttachments = uploadAttachments.filter((entry) => entry.id !== attachment.id);
							}}
							onRetryAttachment={(attachment) => {
								uploadAttachments = uploadAttachments.map((entry) =>
									entry.id === attachment.id ? { ...entry, status: 'uploading', error: undefined } : entry
								);
							}}
						/>
					</div>
				</div>

				<div class="gallery-frame grid gap-4">
					<div class="gallery-note">
						<strong>Compact spinner shell</strong>
						<br />
						The send control can collapse into a small in-flight affordance while the request is
						running.
					</div>
					<div class="mx-auto flex min-h-48 w-full max-w-[25rem] items-end justify-end rounded-2xl border bg-muted/25 p-4">
						<ChatComposer value="" showSubmitSpinner compactSubmitSpinner submitReady={false} />
					</div>
				</div>
			</div>
		</div>
	</section>
</div>
