---
title: "Installation"
description: "Install, update, and remove PrioriCode — installer script, binaries, npm, Nix, Docker, and the self-updater."
---

One binary, no runtime to babysit. PrioriCode ships a native executable for every platform it builds, plus a self-updater that keeps it fresh.

## Recommended: the installer script

::: code-group

```bash [macOS & Linux]
curl -fsSL https://github.com/Prioritech-Indonesia-Optima/prioricode/raw/main/install | bash
```

```powershell [Windows (PowerShell)]
irm https://github.com/Prioritech-Indonesia-Optima/prioricode/raw/main/install.ps1 | iex
```

:::

The script detects your OS, architecture, and CPU — it picks the `baseline` build on x64 machines without AVX2 and the `musl` build on Alpine — downloads the matching archive from [GitHub Releases](https://github.com/Prioritech-Indonesia-Optima/prioricode/releases), verifies it against `SHA256SUMS.txt`, and adds the install directory to your shell's `PATH` (the line is tagged `# prioricode`, so it's easy to find and remove later).

:::info
Remove PrioriCode versions older than `0.1.x` before installing.
:::

### Installer knobs

| Setting | How |
| --- | --- |
| Pin a version | `install -v 0.1.48` or `VERSION=v0.1.48 curl … \| bash`; PowerShell: `-Version` |
| Use a pre-downloaded binary | `install -b ./path/to/prioricode` |
| Custom install dir | `PRIORICODE_INSTALL_DIR=/usr/local/bin` |
| Alternative bin dir | `XDG_BIN_DIR=$HOME/.local/bin` |
| Don't touch PATH | `--no-modify-path` |
| Skip clipboard tooling | `--no-clipboard` / `PRIORICODE_NO_CLIPBOARD=1` |

Install directory priority on macOS/Linux: `$PRIORICODE_INSTALL_DIR` → `$XDG_BIN_DIR` → `$HOME/bin` → `$HOME/.prioricode/bin`. On Windows: `$env:PRIORICODE_INSTALL_DIR`, else `%USERPROFILE%\.prioricode\bin`.

## Other ways to install

#### npm

```bash
    npm install -g prioricode-ai
    ```

    The npm launcher runs a postinstall script that fetches the platform binary (`prioricode-ai` depends on per-platform packages like `prioricode-linux-x64`). If `--ignore-scripts` blocks the postinstall, run `node postinstall.mjs` inside the installed package or reinstall without the flag.

    :::info
npm publishing runs in the release pipeline only when registry credentials are configured, so the package can lag a
      GitHub release. If npm 404s, use the installer script — it is always current.
:::

#### Nix

```bash
nix run github:Prioritech-Indonesia-Optima/prioricode
```

The repo ships a flake at its root.

#### Docker

```bash
docker run -it --rm -v "$PWD:/workspace" -w /workspace \
  ghcr.io/prioritech-indonesia-optima/prioricode
```

Images are tagged per version and per release channel. Mount your project so the agent can see it — and bring credentials with you via environment variables.

#### Manual binary

Download `prioricode-<os>-<arch>[.zip|.tar.gz]` straight from the [releases page](https://github.com/Prioritech-Indonesia-Optima/prioricode/releases), unzip, place it anywhere on your `PATH`. Targets: darwin (arm64, x64, x64-baseline), linux (arm64, x64, x64-baseline, plus `-musl` variants), windows (arm64, x64, x64-baseline). Check the download against `SHA256SUMS.txt` in the same release.

Arch Linux users: the AUR package `prioricode-bin` tracks releases.

## Where things live

PrioriCode keeps its state in standard XDG directories (`~/.local/share/prioricode`, `~/.config/prioricode`, and friends). The database, logs, plans, and credentials all sit under those roots — see [configuration files](../configure/files.md) for the full map.

## Staying current

`prioricode` checks for updates shortly after the TUI starts. Behavior is controlled by the `autoupdate` config key:

| Value | Behavior |
| --- | --- |
| `true` (default) | Patch releases update silently; minor/major bumps prompt in the TUI footer. |
| `"notify"` | Never auto-applies; always asks first. |
| `false` | Quiet. Set `PRIORICODE_DISABLE_AUTOUPDATE=1` for the same effect with extra steps. |

Only patch versions auto-apply — a minor or major bump is your decision, because those can change behavior.

## Upgrading and downgrading by hand

```bash
prioricode upgrade            # latest
prioricode upgrade 0.1.48     # or v0.1.48 — exact pin
```

The updater detects how you installed (curl, npm, pnpm, bun, yarn, Homebrew, Scoop, Chocolatey) and uses the same mechanism; override with `--method curl|npm|pnpm|bun|brew|choco|scoop`. After a script-based upgrade it verifies `prioricode --version` actually reports the target before declaring victory. Re-running the installer with `-v` does the same job from scratch.

## Uninstalling

```bash
prioricode uninstall              # interactive; confirm each step
prioricode uninstall --dry-run    # see what would happen, change nothing
prioricode uninstall --force --keep-config   # nuke data, keep prioricode.json
```

The command removes the app directories (data, cache, config, state — opt out per-family with `--keep-config` / `--keep-data`), cleans the `# prioricode` PATH lines it added to your shell rc files, and uninstalls via whichever package manager owns the binary. If you installed a raw binary by hand, delete it yourself.

## Shell completion

```bash
prioricode completion > ~/.local/share/bash-completion/completions/prioricode
```

Prints a completion script for your shell (`$SHELL`). Redirect it wherever your shell looks — zsh, bash, and fish all take a file.

## Related

- [Providers & models](providers.md) — Next step after install: teach PrioriCode which AI to talk to.
  - [Quickstart](../quickstart.md) — The two-minute tour of the whole setup.
  - [Config files](../configure/files.md) — Where `prioricode.json` is found and how files merge.
  - [CLI reference](../reference/cli.md) — Every command and flag, one table.
