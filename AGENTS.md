# prioricode-dist — Agent Guide

This repo **is** the live site at `https://code.prioritech.co.id`. GitHub Pages
deploys the `main` branch from the repo root: pushing here **publishes**.
Build+edge propagation takes 1–3 min plus up to `max-age=600` Cloudflare
staleness; verify with cache-busting curls, not a cached browser tab.

## Frontend / view-surface rule (mandatory)

Anything that changes how a page **looks, feels, moves, or is interacted with**
— landing page, docs theme, 404, brand artifacts, components, colors, typography,
layout, animation, responsive behavior, accessibility — MUST use the vendored
**UI/UX Pro Max** design skill before writing code:

- Entry point: `.prioricode/skills/ui-ux-pro-max/SKILL.md`
  (companions in `.prioricode/skills/`: `ui-styling`, `design-system`, `brand`,
  `design`, `banner-design`, `slides`).
- Design-system generation (new page / visual direction):
  `python3 .prioricode/skills/ui-ux-pro-max/scripts/search.py "<intent, 2–5 terms>" --design-system`
- Targeted concern: `... search.py "<query>" --domain <style|color|typography|ux|gsap|icons|stack>`
- If skill docs reference `${CLAUDE_PLUGIN_ROOT}/.claude/skills/`, the vendored
  equivalent is this repo's `.prioricode/skills/` — always invoke scripts by
  their full path from the repo root.
- The skill's pre-delivery checklist (contrast 4.5:1, visible focus, 44px touch
  targets, `prefers-reduced-motion`, reflow at 375/768/1024/1440, no emoji icons,
  `cursor-pointer` on clickables) is this repo's **definition of done** for UI.

## Layout — source vs generated

| Path          | Kind       | Notes                                                            |
| ------------- | ---------- | ---------------------------------------------------------------- |
| `index.html`  | GENERATED  | single-file landing build output — **never hand-edit**           |
| `landing/`    | source     | React 19 + Vite 7 + Tailwind 4 app; builds into `../index.html`  |
| `docs/`       | GENERATED  | VitePress build output — **never hand-edit**                     |
| `docs-src/`   | source     | VitePress markdown content (`base: '/docs/'`)                    |
| `brand/`      | source     | canonical brand artifacts, mirrored from `prioricode/branding/`  |
| `404.html`    | source     | branded not-found page                                           |
| `install`, `install.ps1` | source (mirrored) | installers served at the domain root — see runbook       |
| `CNAME`       | keep       | the custom domain; do not touch                                  |
| `.nojekyll`   | keep       | stops Pages' Jekyll pass from stripping `_*` dirs the builds use |
| `.prioricode/skills/` | vendored | third-party skill bundle (MIT) — refresh only, don't edit  |

## Update runbook

Commit source and its generated output in the **same commit**.

1. **Landing:** edit `landing/src/**`, then `cd landing && bun install && bun
   run build` → rewrites `index.html`. Preview: `python3 -m http.server` at the
   repo root.
2. **Docs:** edit `docs-src/**`, then `cd docs-src && bun install && bun run
   build` → rewrites `docs/`.
3. **Installers:** the source of truth is the `prioricode` repo at its **latest
   release tag**, not the working tree:
   `TAG=$(gh release view --json tagName --jq .tagName -R Prioritech-Indonesia-Optima/prioricode)`
   `git -C ../ show "$TAG:install" > install` and `"$TAG:install.ps1" > install.ps1`,
   byte-exact. The main repo's `installer-drift` CI compares the served files
   against the tag — if this repo is behind, that check stays red.
4. **Brand assets:** mirror from `prioricode/branding/` +
   `prioricode/packages/docs/favicon.svg`.
5. **Block wordmark:** `landing/src/wordmark.ts` mirrors the `big` array in
   `prioricode/packages/tui/src/logo.ts` (CLI source of truth). Re-mirror when
   the TUI art changes; keep the provenance comment.

## Hard constraints

- `/install` and `/install.ps1` must stay byte-served at the domain root: the
  CLI's upgrade fallback and every published one-liner hardcode
  `https://code.prioritech.co.id/install(.ps1)`.
- The install command on the landing page must contain the literal URLs
  `https://code.prioritech.co.id/install` and `https://code.prioritech.co.id/install.ps1`.
- Locally this clone lives **inside** the `prioricode` worktree at
  `prioricode/prioricode-dist/` (gitignored there). Never run `git clean -fdx`
  from the parent repo — it deletes this clone.
- Pushing `main` here releases the public site: landing and docs builds must
  pass and be previewed locally first.
