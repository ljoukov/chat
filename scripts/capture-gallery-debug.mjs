import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium } from "playwright";

const defaultBaseUrl = "http://127.0.0.1:4173";
const defaultOutputDir = path.resolve(".tmp/gallery-debug");
const defaultPaths = ["/", "/chat", "/composer", "/input"];
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

function normalizeRoute(route) {
  if (!route || route === "/") {
    return "/";
  }

  return route.startsWith("/") ? route : `/${route}`;
}

function fileNameForRoute(route) {
  if (route === "/") {
    return "root.png";
  }

  return `${route.slice(1).replaceAll("/", "--").replaceAll(/[?&=]/g, "-")}.png`;
}

const baseUrl = readFlag(
  "--base-url",
  process.env.GALLERY_BASE_URL ?? defaultBaseUrl,
).replace(/\/$/, "");
const colorScheme = readFlag("--color-scheme", "light");
const outputDir = path.resolve(readFlag("--output-dir", defaultOutputDir));
const routes = args
  .filter((arg, index) => {
    if (arg.startsWith("--")) {
      return false;
    }

    const previous = args[index - 1];
    return (
      previous !== "--base-url" &&
      previous !== "--output-dir" &&
      previous !== "--color-scheme"
    );
  })
  .map(normalizeRoute);

const captureRoutes = routes.length > 0 ? routes : defaultPaths;

const overlayCss = `
	html::before {
		content: '';
		position: fixed;
		inset: 0;
		pointer-events: none;
		z-index: 2147483647;
		background-image:
			linear-gradient(to right, rgba(220, 38, 38, 0.16) 1px, transparent 1px),
			linear-gradient(to bottom, rgba(220, 38, 38, 0.16) 1px, transparent 1px),
			linear-gradient(to right, rgba(37, 99, 235, 0.34) 1px, transparent 1px),
			linear-gradient(to bottom, rgba(37, 99, 235, 0.34) 1px, transparent 1px);
		background-size: 8px 8px, 8px 8px, 40px 40px, 40px 40px;
	}

	body::before {
		content: '8px minor / 40px major';
		position: fixed;
		top: 12px;
		right: 12px;
		z-index: 2147483647;
		pointer-events: none;
		padding: 6px 10px;
		border-radius: 999px;
		background: rgba(15, 23, 42, 0.88);
		color: white;
		font: 600 12px/1.2 ui-monospace, SFMono-Regular, Menlo, monospace;
		letter-spacing: 0.04em;
	}
`;

await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
let failed = false;

try {
  for (const route of captureRoutes) {
    const context = await browser.newContext({
      colorScheme: colorScheme === "dark" ? "dark" : "light",
      deviceScaleFactor: 2,
      reducedMotion: "reduce",
      viewport: { width: 1512, height: 1100 },
    });
    const page = await context.newPage();
    const issues = [];

    page.on("console", (message) => {
      if (message.type() === "error") {
        issues.push(`console: ${message.text()}`);
      }
    });
    page.on("pageerror", (error) => {
      issues.push(`pageerror: ${error.message}`);
    });

    const url = `${baseUrl}${route}`;
    await page.goto(url, { waitUntil: "networkidle" });
    await page.addStyleTag({ content: overlayCss });

    const outputPath = path.join(outputDir, fileNameForRoute(route));
    await page.screenshot({
      animations: "disabled",
      fullPage: true,
      path: outputPath,
    });

    console.log(`${route} -> ${outputPath}`);

    if (issues.length > 0) {
      failed = true;
      for (const issue of issues) {
        console.error(`${route}: ${issue}`);
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
