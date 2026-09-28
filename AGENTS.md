# prioricode-dist — Agent Guide

This repo **is** the live site at `https://code.prioritech.co.id`. GitHub Pages
deploys the `main` branch from the repo root: pushing here **publishes**.
Build+edge propagation takes 1–3 min plus up to `max-age=600` Cloudflare
staleness; verify with cache-busting curls, not a cached browser tab.

## Frontend / view-surface rule (mandatory)

Anything that changes how a page **looks, feels, moves, or is interacted with**
— landing page, docs theme, 404, brand artifacts, components, colors, typography,
layout, animation, responsive behavior, accessibility — MUST consult the
**UI/UX Pro Max** design bible before writing code.

**The bible is the cloned repo `ui-ux-pro-max-skill/`** (cloned from
`github.com/nextlevelbuilder/ui-ux-pro-max-skill`). It is the source of truth for
view-layer decisions: 192 reasoning rules, 79 UI styles, 192 product palettes, 74
font pairings, 119 UX guidelines, 105 icons, 17 GSAP presets, 25 chart types, and
22 tech stacks.

Always run the search tool by its full path from the repo root (do not assume a CWD):

- **New page / system-wide visual direction** (design-system generation):
  `python3 ui-ux-pro-max-skill/src/ui-ux-pro-max/scripts/search.py "<product_type> <industry> <2–5 keywords>" --design-system`
- **Targeted concern** (style, color, typography, UX, GSAP, icons, stack):
  `python3 ui-ux-pro-max-skill/src/ui-ux-pro-max/scripts/search.py "<query>" --domain <style|color|typography|ux|gsap|icons|chart|landing|react|web|google-fonts>`
- **Known implementation stack**: `... search.py "<query>" --stack <react|nextjs|html-tailwind|...>`
- **Design dials** (optional, with `--design-system`): `--variance <1-10> --motion <1-10> --density <1-10>`

The vendored quick-reference skill at `.prioricode/skills/ui-ux-pro-max/SKILL.md`
(companions: `ui-styling`, `design-system`, `brand`, `design`, `banner-design`,
`slides`) mirrors the same data and is the fast local entry point; the cloned
`ui-ux-pro-max-skill/` repo is the full bible to consult when the vendored copy is
stale or you need the latest rules.

The pre-delivery checklist (contrast 4.5:1, visible focus, 44px touch targets,
`prefers-reduced-motion`, reflow at 375/768/1024/1440, no emoji icons,
`cursor-pointer` on clickables) is this repo's **definition of done** for UI.

## Layout — source vs generated

| Path          | Kind       | Notes                                                            |
| ------------- | ---------- | ---------------------------------------------------------------- |
| `index.html`  | GENERATED  | single-file landing build output — **never hand-edit**           |
| `landing/`    | source     | React 19 + Vite 7 + Tailwind 4 app; builds into `../index.html`  |
| `docs/`       | GENERATED  | VitePress build output — **never hand-edit**                     |
| `docs-src/`   | source     | VitePress markdown content (`base: '/docs/'`)                    |
| `brand/`      | source     | canonical brand artifacts, mirrored from `prioricode/branding/`  |
| `black-logo/`, `white-logo/` | source | official Prioritech logo exports (dark-on-light / light-on-dark lockups) — reference material for future work |
| `404.html`    | source     | branded not-found page                                           |
| `install`, `install.ps1` | source (mirrored) | installers served at the domain root — see runbook       |
| `CNAME`       | keep       | the custom domain; do not touch                                  |
| `.nojekyll`   | keep       | stops Pages' Jekyll pass from stripping `_*` dirs the builds use |
| `.prioricode/skills/` | vendored | third-party skill bundle (MIT) — refresh only, don't edit  |
| `ui-ux-pro-max-skill/` | reference | the UI/UX Pro Max design **bible** (cloned, read-only) — consult for every view-layer change |

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

## Design identity — "Warm Night Terminal"

The site's own vibe. Every frontend change must fit it:

1. **Warm night, not cold black.** Layered charcoals (`#131211 → #2d2c2c`), cream ink
   (`#f6f5f0`) — never pure white/black. Gold (`#F9B110`) is the *only* accent and it is
   sacred: stars, CTAs, key highlights. Nothing else gets gold.
2. **The star is the protagonist.** The Prioritech mark is a shooting star (4-point star +
   arcing swoosh tail). The canvas starfield (`landing/src/Starfield.tsx`) is the living
   logo: quiet ambient drift, rare falling stars, and a slow "hero" star rising along the
   swoosh vector trailing sparks. Motion is punctuation, not decoration.
3. **Terminal as material.** Monospace everywhere (JetBrains Mono), `//` comment kickers,
   lowercase section titles, hairline TUI-style frames, `>` prompts, blinking caret, gold
   `::selection`. The site must feel like the CLI's sibling, not its marketing dept.
4. **Motion as ritual (one-time, then stillness).** Mirror the TUI home screen: reveals
   play once on scroll-in, the wordmark glints once, the demo terminal types once and
   holds. No looping gradients, no bouncing/pulsing elements, no shimmer while idle.
   `prefers-reduced-motion` renders a composed static frame — always.
5. **Voice: dry, confident, commit-message short.** Imperative sentences. Indonesian pride
   ("progress. precision. priority."). Light terminal humor, zero corporate filler.
   No emoji icons (SVG only), no exclamation marks in headlines.
6. **Features are shown operating, never as cards.** The feature showcase is the
   scrollytelling section (`landing/src/Scrolly.tsx`): a sticky terminal device that
   morphs state per chapter while the narrative scrolls beside it. Do not replace it
   with icon-card grids — that's the AI-slop pattern this repo exists to avoid.

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
