---
title: "Quickstart"
description: "Install PrioriCode, connect a provider, and ship your first change in about two minutes."
---

Two minutes, four steps, one shipped change. Longer version: see [installation](getting-started/install.md) and [providers](getting-started/providers.md).

## 1. Install

::: code-group

```bash [macOS & Linux]
curl -fsSL https://github.com/Prioritech-Indonesia-Optima/prioricode/raw/main/install | bash
```

```powershell [Windows]
irm https://github.com/Prioritech-Indonesia-Optima/prioricode/raw/main/install.ps1 | iex
```

:::

Verify the install:

```bash
prioricode --version
```

:::info
Remove PrioriCode versions older than `0.1.x` before installing. The script respects `PRIORICODE_INSTALL_DIR`, then
  `$XDG_BIN_DIR`, then `$HOME/bin`. Nix, Docker, and manual options are on the [installation page](getting-started/install.md).
:::

## 2. Connect a provider

```bash
prioricode providers login
```

Pick a provider and follow the prompts — some support full OAuth (ChatGPT plans, GitHub Copilot, xAI), the rest take an API key. PrioriCode also reads standard environment variables (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`, …) if you'd rather skip the login flow. See [providers & models](getting-started/providers.md).

## 3. Open a session

```bash
cd my-project
prioricode
```

The TUI opens. Ask it anything — "fix the failing tests", "add retry logic to the HTTP client" — and it will read your codebase, propose changes, and run commands, asking for permission as it goes.

The first time it wants to edit a file you'll see a permission panel with the diff: **Allow once**, **Allow always**, or **Reject**. Your call, every time, until you say otherwise.

## 4. Learn three moves

That's enough to be productive. Everything below is optional, but it's where PrioriCode stops being a chatbot and starts being a coworker:

| Move | Keys | What it does |
| --- | --- | --- |
| Switch agent | `tab` / `shift+tab`, or `/agents` | Cycle between `build` (full access), `plan` (read-only), and `auto` (unattended). |
| Change model | `<leader>m` (leader is `ctrl+x`), `f2` | Pick a model, or cycle your recently used ones. |
| Everything else | `ctrl+p`, `/help` | The command palette lists every command; `/help` shows keybindings. |

:::tip
Type `@` in the prompt to attach files from your project (with line ranges: `@src/api.ts#10-42`), and start an
  empty prompt with `!` to run a plain shell command without involving the model.
:::

## Keep going

- [The terminal UI](using/tui.md) — Sessions, attachments, shell mode, and the queue — the full TUI tour.
  - [Teach it your project](using/context.md) — `AGENTS.md`, instructions, and rules so the agent already knows your conventions.
  - [Permissions](using/permissions.md) — Decide exactly what the agent may touch — per tool, per pattern, per session.
  - [Agents](using/agents.md) — Built-in modes and custom agents, including subagents that fan out work.
  - [Configuration](configure/files.md) — One `prioricode.json` (or `.jsonc`) to rule them all — plus themes in `tui.json`.
  - [TypeScript SDK](sdk.md) — Embed the agent in your own apps and CI pipelines.
