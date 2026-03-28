# AGENTS.md

## Documentation

- Keep `README.md` focused on using `@ljoukov/chat`: installation, public API, component behavior, and consumer-facing examples.
- Development workflow notes belong here in `AGENTS.md`, including screenshot capture steps, release steps, and this README-scope rule.

## Git Workflow

- In this repository, a user request to `push` means push the current work directly to `origin/main`.
- Do not create or push a feature branch, and do not open a pull request, unless the user explicitly asks for a branch or PR.
- If the current checkout is detached or not on `main`, push with `git push origin HEAD:main`.

## Screenshots

- Documentation screenshots must come from isolated `/render/*` routes, not from the gallery shell.
- Render exactly one component per screenshot target. Do not include the gallery sidebar, gallery header, route chrome, or unrelated helper UI in the captured image.
- Each render route should expose the component root through `data-screenshot-target="<name>"`.
- Run the gallery dev server in `tmux` so the Vite log stream stays visible while you audit and capture. `tmux capture-pane -pt <session>` is the first check when something looks wrong in the browser.
- Check browser console and page errors on the render routes before accepting screenshots. Screenshot capture is not valid if the surface is logging runtime errors.
- Use exact selector captures against `data-screenshot-target="<name>"`, not viewport or full-page screenshots. The standard path is `npm run docs:screenshots -- --base-url http://127.0.0.1:<port> --clean`.
- If a screenshot or page layout looks suspicious, make a review copy with a ruler/grid overlay before signing off on spacing or crop quality. The standard command is `npm run gallery:debug -- --base-url http://127.0.0.1:<port> / /chat /composer /input`, which saves full-page review copies under `.tmp/gallery-debug/`.
- Review saved images in a subagent and keep `view_image` out of the main thread context. The expected debug flow is: tmux logs first, browser console/page errors second, ruler-overlay review copy third, then subagent image inspection.
- Prefer `theme=light|dark` query params on render routes for capture variants. Use `state=<variant>` when a route supports multiple single-component states.
- Review the saved image files, not the live page, when validating screenshot quality.

## npm release

- npm publish is handled by GitHub Actions via `.github/workflows/publish.yml`.
- Releases are triggered by pushed tags matching `v*`, or by manually running the `Publish` workflow with a `tag` input.
- The tag must match `package.json` exactly. Example: version `0.1.0` must be published with tag `v0.1.0`.

### Standard release flow

1. Bump `package.json` and `package-lock.json`.
2. Run `npm run verify`.
3. Commit and push to `main`.
4. Create and push tag `vX.Y.Z`.

GitHub Actions publishes the package to npm after validating that the tag matches `package.json`.
