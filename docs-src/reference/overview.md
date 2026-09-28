---
title: "Reference"
description: "Single-source tables for everything enumerable in PrioriCode: CLI, slash commands, keybinds, config keys, environment variables, tools, providers."
---

Concept pages explain; these pages enumerate. Every flag, key, default, and name lives in exactly one table — linked from wherever it's mentioned. When a default changes, a single row changes.

- [CLI commands](cli.md) — Every command, subcommand, flag, and default of the `prioricode` binary.
  - [Slash commands](slash-commands.md) — Every `/command` in the TUI, with aliases and scope.
  - [Keybindings](keybinds.md) — Every bindable id with its default chord; override syntax.
  - [Config keys](config.md) — `prioricode.json` and `tui.json` — every key, type, and default.
  - [Environment variables](environment-variables.md) — Every `PRIORICODE_*` switch and the third-party vars honored.
  - [Agent tools](tools.md) — The tools the model can call — parameters, caps, gates.
  - [Providers](providers.md) — Auth routes and env vars for known providers.

:::info
Tables describe the **latest release** of the tracked line (`v0.1`). Experimental entries carry an explicit marker; their existence is source-verified but their behavior may move between releases. See [docs versioning](../support/versions.md).
:::
