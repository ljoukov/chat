import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';

const defaultBaseUrl = 'http://127.0.0.1:4173';
const defaultOutputDir = path.resolve('docs/screenshots');

const args = process.argv.slice(2);

function readFlag(name, fallback) {
	const inline = args.find((arg) => arg.startsWith(`${name}=`));
	if (inline) {
		return inline.slice(name.length + 1);
	}

	const index = args.indexOf(name);
	if (index >= 0) {
		return args[index + 1] ?? fallback;
	}

	return fallback;
}

const shouldClean = args.includes('--clean');
const baseUrl = readFlag('--base-url', process.env.SCREENSHOT_BASE_URL ?? defaultBaseUrl).replace(
	/\/$/,
	''
);
const outputDir = path.resolve(readFlag('--output-dir', defaultOutputDir));

const captures = [
	{
		file: 'render-chat-light.png',
		colorScheme: 'light',
		pathname: '/render/chat?theme=light',
		selector: '[data-screenshot-target="chat-demo"]'
	},
	{
		file: 'render-chat-dark.png',
		colorScheme: 'dark',
		pathname: '/render/chat?theme=dark',
		selector: '[data-screenshot-target="chat-demo"]'
	},
	{
		file: 'render-composer-light.png',
		colorScheme: 'light',
		pathname: '/render/composer?theme=light&state=attachments',
		selector: '[data-screenshot-target="chat-composer"]'
	},
	{
		file: 'render-composer-dark.png',
		colorScheme: 'dark',
		pathname: '/render/composer?theme=dark&state=attachments',
		selector: '[data-screenshot-target="chat-composer"]'
	},
	{
		file: 'render-input-light.png',
		colorScheme: 'light',
		pathname: '/render/input?theme=light&state=multiline',
		selector: '[data-screenshot-target="chat-input"]'
	},
	{
		file: 'render-input-dark.png',
		colorScheme: 'dark',
		pathname: '/render/input?theme=dark&state=multiline',
		selector: '[data-screenshot-target="chat-input"]'
	},
	{
		file: 'render-message-light.png',
		colorScheme: 'light',
		pathname: '/render/message?theme=light&state=assistant',
		selector: '[data-screenshot-target="chat-message"]'
	},
	{
		file: 'render-message-dark.png',
		colorScheme: 'dark',
		pathname: '/render/message?theme=dark&state=assistant',
		selector: '[data-screenshot-target="chat-message"]'
	},
	{
		file: 'render-task-card-light.png',
		colorScheme: 'light',
		pathname: '/render/task-card?theme=light&state=running',
		selector: '[data-screenshot-target="chat-task-card"]'
	},
	{
		file: 'render-task-card-dark.png',
		colorScheme: 'dark',
		pathname: '/render/task-card?theme=dark&state=running',
		selector: '[data-screenshot-target="chat-task-card"]'
	},
	{
		file: 'render-markdown-light.png',
		colorScheme: 'light',
		pathname: '/render/markdown?theme=light&state=block',
		selector: '[data-screenshot-target="chat-markdown"]'
	},
	{
		file: 'render-markdown-dark.png',
		colorScheme: 'dark',
		pathname: '/render/markdown?theme=dark&state=block',
		selector: '[data-screenshot-target="chat-markdown"]'
	}
];

async function cleanDirectory() {
	try {
		const entries = await fs.readdir(outputDir);
		await Promise.all(entries.map((entry) => fs.rm(path.join(outputDir, entry), { force: true })));
	} catch (error) {
		if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
			return;
		}
		throw error;
	}
}

await fs.mkdir(outputDir, { recursive: true });

if (shouldClean) {
	await cleanDirectory();
}

const browser = await chromium.launch({ headless: true });
let failed = false;

try {
	for (const capture of captures) {
		const context = await browser.newContext({
			colorScheme: capture.colorScheme,
			deviceScaleFactor: 2,
			reducedMotion: 'reduce',
			viewport: { width: 1680, height: 1400 }
		});
		const page = await context.newPage();
		const issues = [];
		page.on('console', (message) => {
			if (message.type() === 'error') {
				issues.push(`console: ${message.text()}`);
			}
		});
		page.on('pageerror', (error) => {
			issues.push(`pageerror: ${error.message}`);
		});

		const url = `${baseUrl}${capture.pathname}`;
		await page.goto(url, { waitUntil: 'networkidle' });
		await page.locator('[data-render-ready="true"]').waitFor({ state: 'visible' });

		const target = page.locator(capture.selector);
		await target.waitFor({ state: 'visible' });
		const box = await target.boundingBox();
		if (!box) {
			throw new Error(`Missing bounding box for ${capture.selector} at ${url}`);
		}

		await target.screenshot({
			animations: 'disabled',
			path: path.join(outputDir, capture.file)
		});

		console.log(
			`${capture.file} ${Math.round(box.width)}x${Math.round(box.height)} ${capture.pathname}`
		);

		if (issues.length > 0) {
			failed = true;
			for (const issue of issues) {
				console.error(`${capture.file}: ${issue}`);
			}
		}

		await context.close();
	}
} finally {
	await browser.close();
}

if (failed) {
	process.exitCode = 1;
}
