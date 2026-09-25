---
title: Quickstart
description: Install PrioriCode, connect a provider, and ship your first change.
---

# Quickstart

Get from zero to a working agent in about two minutes.

## 1. Install

::: code-group

```bash [macOS & Linux]
curl -fsSL https://code.prioritech.co.id/install | bash
```

```powershell [Windows]
irm https://code.prioritech.co.id/install.ps1 | iex
```

:::

::: info Remove old versions first
Remove PrioriCode versions older than `0.1.x` before installing. The script respects
`PRIORICODE_INSTALL_DIR`, then `$XDG_BIN_DIR`, then `$HOME/bin`.
:::

Verify the install:

```bash
prioricode --version
```

## 2. Connect a provider

```bash
prioricode providers login
```

Pick a provider and follow the prompts. PrioriCode also reads standard environment variables
(`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, ...) if you prefer to skip the login flow.

## 3. Run

Open any project and start the agent:

```bash
cd my-project
prioricode
```

The TUI opens with the Prioritech mark. Ask it anything — "fix the failing tests", "add retry
logic to the HTTP client" — and it will read your codebase, propose changes, and run tools with
your approval.

::: tip
Use `/help` inside the TUI to see available commands, and `Tab` to switch between the
**build** and **plan** agents.
:::

## 4. Keep going

- [TypeScript SDK](/sdk) — embed the agent in your own apps and CI pipelines.
- [GitHub](https://github.com/Prioritech-Indonesia-Optima/prioricode) — star the repo, file issues, read the source.
- [Releases](https://github.com/Prioritech-Indonesia-Optima/prioricode/releases) — grab a binary directly.
