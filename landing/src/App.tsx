import { useEffect, useState, type ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"
import { ascii, Mark, tone } from "./brand"
import { wordmark } from "./wordmark"

const GITHUB = "https://github.com/Prioritech-Indonesia-Optima/prioricode"
const DOCS = "/docs/"
const COMMANDS = {
  sh: "curl -fsSL https://code.prioritech.co.id/install | bash",
  ps: "irm https://code.prioritech.co.id/install.ps1 | iex",
} as const

function useTheme() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme ?? "dark")
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem("prioricode-theme", theme)
    } catch {}
  }, [theme])
  return [theme, () => setTheme((t) => (t === "dark" ? "light" : "dark"))] as const
}

function AsciiLogo() {
  return (
    <pre className="ascii" aria-hidden="true">
      {ascii.map((row, y) => (
        <span className="ascii-row" key={y}>
          {Array.from(row).map((char, x) => (
            <span key={x} className={char === " " ? "c-space" : `c-${tone(char)}`}>
              {char}
            </span>
          ))}
          {"\n"}
        </span>
      ))}
    </pre>
  )
}

function Wordmark({ reduced }: { reduced: boolean }) {
  return (
    <div className="relative">
      <pre className="wordmark" aria-hidden="true" style={reduced ? { animation: "none" } : undefined}>
        {wordmark.join("\n")}
      </pre>
    </div>
  )
}

function Install() {
  const [target, setTarget] = useState<"sh" | "ps">(() =>
    /win/i.test(navigator.userAgent + " " + (navigator as { platform?: string }).platform) ? "ps" : "sh",
  )
  const [copied, setCopied] = useState(false)
  return (
    <div id="install">
      <div className="flex gap-2 flex-wrap" role="tablist" aria-label="Choose your platform">
        {(["sh", "ps"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={target === t}
            onClick={() => {
              setTarget(t)
              setCopied(false)
            }}
            className={
              "min-h-11 rounded-lg border px-4 text-[0.78rem] cursor-pointer transition-colors " +
              (target === t
                ? "border-[var(--gold)] bg-[var(--gold-soft)] text-[var(--ink)]"
                : "border-[var(--line)] bg-[var(--surface)] text-[var(--ink-muted)] hover:border-[var(--line-strong)]")
            }
          >
            {t === "sh" ? "macOS & Linux" : "Windows"}
          </button>
        ))}
      </div>
      <div className="mt-3 flex min-w-0 items-center gap-3 overflow-x-auto rounded-[10px] border border-[var(--line)] bg-[var(--bg-deep)] px-4 py-3 hover:border-[var(--line-strong)]">
        <span className="select-none text-[var(--gold)]">{target === "sh" ? "$" : ">"}</span>
        <code className="whitespace-pre text-[0.8rem]">{COMMANDS[target]}</code>
        <button
          className={
            "ml-auto min-h-9 shrink-0 rounded-md border px-3 text-[0.65rem] uppercase tracking-wider cursor-pointer transition-colors " +
            (copied
              ? "border-[var(--gold)] text-[var(--gold)]"
              : "border-[var(--line)] bg-[var(--surface-raised)] text-[var(--ink-muted)] hover:border-[var(--line-strong)] hover:text-[var(--ink)]")
          }
          aria-label="Copy install command"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(COMMANDS[target])
              setCopied(true)
              setTimeout(() => setCopied(false), 1600)
            } catch {}
          }}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="mt-2 text-[0.72rem] text-[var(--ink-faint)]">
        Installs the latest release for your platform (x64 & ARM). Pin a version with{" "}
        <code className="text-[var(--gold)]">-- --version X.Y.Z</code>.
      </p>
    </div>
  )
}

function Version() {
  const [tag, setTag] = useState<string | null>(null)
  useEffect(() => {
    fetch(`${GITHUB.replace("github.com", "api.github.com/repos")}/releases/latest`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.tag_name && setTag(String(d.tag_name).replace(/^v/, "")))
      .catch(() => {})
  }, [])
  if (!tag) return null
  return (
    <a
      href={`${GITHUB}/releases/latest`}
      className="text-[0.68rem] text-[var(--gold)] rounded-full border border-[color-mix(in_srgb,var(--gold)_40%,transparent)] px-2.5 py-1 hover:border-[var(--gold)] transition-colors"
    >
      v{tag}
    </a>
  )
}

const FEATURES: { title: string; body: string; icon: ReactNode }[] = [
  {
    title: "Terminal-native",
    body: "Runs where you work. No context switch, no IDE lock-in — just a conversation that writes real code.",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1.5" y="2.5" width="13" height="11" rx="2" />
        <path d="M4 6l2.5 2L4 10M8.5 10.5H12" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Two agents, one Tab",
    body: "Switch between build (full access) and plan (read-only analysis & exploration) mid-session with Tab.",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 5.5h9l-2.2-2.2M14 10.5H5l2.2 2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Cross-session coordination",
    body: "Run several agents on one project. They share presence, notes, and claims through a durable channel — no stomping.",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="3.5" cy="3.5" r="1.7" />
        <circle cx="12.5" cy="3.5" r="1.7" />
        <circle cx="8" cy="12.5" r="1.7" />
        <path d="M4.6 4.9 7 10.6M11.4 4.9 9 10.6M5.2 3.5h5.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Model-agnostic",
    body: "Switch providers and models per session. Your agent, your keys, no lock-in to any single lab.",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="8" cy="8" r="6.5" />
        <path d="M1.5 8h13M8 1.5c1.8 2 2.7 4.2 2.7 6.5S9.8 12.5 8 14.5C6.2 12.5 5.3 10.3 5.3 8 5.3 5.7 6.2 3.5 8 1.5Z" />
      </svg>
    ),
  },
  {
    title: "Open source",
    body: "Fully transparent agent, tools, and context engine. Read it, fork it, ship it — auditable to the last prompt.",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M8 1.5 2 4.5v4c0 3 2.5 5.3 6 6 3.5-.7 6-3 6-6v-4L8 1.5Z" strokeLinejoin="round" />
        <path d="M5.5 8 7.2 9.7 10.8 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Built in Jakarta",
    body: "Crafted by Prioritech Indonesia Optima — progress, precision, priority. Shipped daily, in the open.",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M8 14.5s5.5-4.6 5.5-8A5.5 5.5 0 0 0 2.5 6.5c0 3.4 5.5 8 5.5 8Z" strokeLinejoin="round" />
        <circle cx="8" cy="6.5" r="2" />
      </svg>
    ),
  },
]

const TERM_LINES: { cls: string; text: string }[] = [
  { cls: "", text: "$ prioricode" },
  { cls: "t-dim", text: "build agent · press Tab for plan mode" },
  { cls: "", text: "❯ refactor the auth middleware to JWT — keep tests green" },
  { cls: "t-dim", text: "◆ search  src/                 8 files" },
  { cls: "t-dim", text: "◆ read    src/middleware/auth.ts" },
  { cls: "t-dim", text: "◆ edit    src/middleware/auth.ts     +24 −11" },
  { cls: "t-dim", text: "◆ bash    bun test middleware" },
  { cls: "t-ok", text: "✓ 14 passed — done in 38s · review the diff? [y/n]" },
]

const FAQS: { q: string; a: ReactNode }[] = [
  {
    q: "What exactly is PrioriCode?",
    a: "An open source AI coding agent that lives in your terminal. It reads your codebase, edits files, runs your tools (tests, builds, git) and works until the task is verified — install it with one command.",
  },
  {
    q: "Which models does it use?",
    a: "Whichever you want. Providers and models are switchable per session, with your own keys — no lock-in to any single lab.",
  },
  {
    q: "What are build and plan agents?",
    a: (
      <>
        Two built-in agents you switch between with <kbd className="text-[var(--gold)]">Tab</kbd>:{" "}
        <strong className="text-[var(--ink)]">build</strong> has full access for development work,{" "}
        <strong className="text-[var(--ink)]">plan</strong> is read-only for analysis and code exploration.
      </>
    ),
  },
  {
    q: "Can several agents work on one project at once?",
    a: "Yes — concurrent sessions coordinate through a durable cross-process channel: presence, file claims, and message passing so parallel agents don't collide.",
  },
  {
    q: "Which platforms are supported?",
    a: (
      <>
        macOS and Linux via the bash installer, Windows via PowerShell — x64 and ARM, baseline builds included. Grab it with the one-liners above, then{" "}
        <a href={DOCS}>get started</a>.
      </>
    ),
  },
  {
    q: "Is it free?",
    a: "Yes. PrioriCode is free and open source — the agent, tools, and context engine are all readable on GitHub. Bring your own model keys.",
  },
]

export function App() {
  const [theme, flip] = useTheme()
  const reduced = !!useReducedMotion()
  const fade = (delay = 0) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-60px" },
          transition: { duration: 0.5, delay, ease: [0.2, 0.7, 0.2, 1] as const },
        }

  return (
    <>
      <h1 className="sr-only">PrioriCode — the open source AI coding agent by Prioritech</h1>

      <div className="backdrop" aria-hidden="true">
        <svg className="comet" viewBox="0 0 1200 900" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="cometGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#f9b110" stopOpacity="0" />
              <stop offset="0.55" stopColor="#f9b110" stopOpacity="0.5" />
              <stop offset="1" stopColor="#ffc94a" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          <path className="trail" d="M-40 60 C 380 140, 620 260, 830 520 C 880 585, 915 640, 940 700" />
          <path
            className="spark"
            d="M940 668 L948 692 L972 700 L948 708 L940 732 L932 708 L908 700 L932 692 Z"
          />
        </svg>
      </div>

      <header className="site-header">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
          <a className="brandlink flex items-center gap-2.5 font-bold tracking-tight" href="/">
            <Mark className="h-6 w-6" />
            <span>
              Priori<em className="text-[var(--gold)] not-italic font-extrabold">Code</em>
            </span>
          </a>
          <nav className="flex items-center gap-1.5 text-[0.78rem] flex-wrap">
            <a className="navlink px-2 py-2" href={DOCS}>
              Docs
            </a>
            <a className="navlink px-2 py-2" href={`${GITHUB}/releases`}>
              Releases
            </a>
            <a className="navlink px-2 py-2" href={GITHUB}>
              GitHub
            </a>
            <a className="navlink hidden px-2 py-2 sm:inline" href="https://prioritech.co.id">
              Prioritech
            </a>
            <button
              className="grid h-11 w-11 place-items-center rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--ink-muted)] hover:border-[var(--line-strong)] hover:text-[var(--ink)] cursor-pointer"
              onClick={flip}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? (
                <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                  <circle cx="8" cy="8" r="3.4" />
                  <path
                    d="M8 0.8v2M8 13.2v2M0.8 8h2M13.2 8h2M2.9 2.9l1.4 1.4M11.7 11.7l1.4 1.4M13.1 2.9l-1.4 1.4M4.3 11.7l-1.4 1.4"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                  <path d="M13.9 9.9A6.1 6.1 0 0 1 6.1 2.1a6.1 6.1 0 1 0 7.8 7.8Z" />
                </svg>
              )}
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5">
        {/* ------------------------------------------------------------ hero */}
        <section className="pt-10 pb-14 sm:pt-16">
          <Wordmark reduced={reduced} />
          <div className="mt-10 grid items-start gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-[0.68rem] uppercase tracking-[0.14em] text-[var(--ink-muted)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" aria-hidden="true" />
                Open source · Built in Jakarta
              </span>
              <p className="mt-4 text-[clamp(1.5rem,4vw,2.3rem)] font-bold leading-[1.15] tracking-tight">
                Code at the speed of a{" "}
                <span className="text-[var(--gold)]">shooting star.</span>
              </p>
              <p className="mt-4 max-w-prose text-[0.88rem] leading-relaxed text-[var(--ink-muted)]">
                PrioriCode is the open source AI coding agent by{" "}
                <a className="text-[var(--gold)] hover:underline underline-offset-4" href="https://prioritech.co.id">
                  Prioritech
                </a>
                . One command installs it into your terminal — it reads your codebase, runs your tools, and ships
                your code.
              </p>
              <div className="mt-7">
                <Install />
              </div>
              <div className="mt-6 flex flex-wrap gap-2.5">
                <a className="btn primary" href={`${GITHUB}/releases/latest`}>
                  <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                    <path d="M8 1a.75.75 0 0 1 .75.75v6.44l1.97-1.97a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 1.06-1.06l1.97 1.97V1.75A.75.75 0 0 1 8 1ZM2 13.25A.75.75 0 0 1 2.75 12.5h10.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" />
                  </svg>
                  Download latest
                </a>
                <a className="btn" href={DOCS}>
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4" aria-hidden="true">
                    <path d="M2.5 2.5h4.2c1.4 0 1.8 1 1.8 2.2V13c0-1 .5-1.7 1.7-1.7h3.3V2.5H8.9" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2.5 2.5v9.5c0-.7.7-1.2 1.6-1.2h4.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Read the docs
                </a>
                <a className="btn" href={GITHUB}>
                  <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.53.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .75-.24 2.48.92a6.9 6.9 0 0 1 2.27-.3c.77 0 1.54.2 2.27.6 1.72-1.16 2.48-.92 2.48-.92.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
                  </svg>
                  Star on GitHub
                </a>
              </div>
            </div>
            <div className="hidden items-center justify-center lg:flex" aria-hidden="true">
              <AsciiLogo />
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------- terminal */}
        <section className="py-14" aria-label="PrioriCode in action">
          <motion.div {...fade()}>
            <div className="term mx-auto max-w-3xl">
              <div className="term-bar">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
                <span className="ml-2 text-[0.68rem] text-[var(--ink-faint)]">prioricode — build agent</span>
              </div>
              <div className="term-body">
                {TERM_LINES.map((line, i) => (
                  <div key={i} className={line.cls + (line.cls === "" ? " text-[var(--ink)]" : "")}>
                    {line.text}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* -------------------------------------------------------- features */}
        <section id="features" className="py-14" aria-label="Features">
          <motion.h2 {...fade()} className="text-center text-[clamp(1.25rem,3vw,1.7rem)] font-bold tracking-tight">
            Everything you expect from an agent.{" "}
            <span className="text-[var(--gold)]">Nothing you have to trust blindly.</span>
          </motion.h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} {...fade(0.05 * (i % 3))} className="card p-5">
                <div className="icon">{f.icon}</div>
                <h3 className="mt-3.5 text-[0.92rem] font-bold">{f.title}</h3>
                <p className="mt-1.5 text-[0.78rem] leading-relaxed text-[var(--ink-muted)]">{f.body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------------------ docs */}
        <section className="py-14" aria-label="Documentation">
          <motion.div {...fade()} className="card grid gap-6 p-7 sm:grid-cols-[1.4fr_1fr] sm:items-center sm:p-9">
            <div>
              <h2 className="text-[clamp(1.15rem,3vw,1.5rem)] font-bold tracking-tight">
                Docs that start at <span className="text-[var(--gold)]">one command</span>
              </h2>
              <p className="mt-2.5 text-[0.83rem] leading-relaxed text-[var(--ink-muted)]">
                Quickstart, agents and tools, configuration, permission rules, and the SDK reference — all served
                from this site, with offline search.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5 sm:justify-end">
              <a className="btn primary" href={DOCS}>
                Open the docs
              </a>
              <a className="btn" href={`${DOCS}quickstart.html`}>
                Quickstart
              </a>
            </div>
          </motion.div>
        </section>

        {/* ------------------------------------------------------------- faq */}
        <section id="faq" className="py-14" aria-label="Frequently asked questions">
          <motion.h2 {...fade()} className="text-center text-[clamp(1.25rem,3vw,1.7rem)] font-bold tracking-tight">
            Questions, answered fast.
          </motion.h2>
          <div className="mx-auto mt-8 grid max-w-3xl gap-3">
            {FAQS.map((f, i) => (
              <motion.details key={f.q} {...fade(0.04 * i)} className="faq" open={i === 0 ? true : undefined}>
                <summary>
                  {f.q}
                  <svg viewBox="0 0 16 16" className="chev h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M8 3v10M3 8h10" strokeLinecap="round" />
                  </svg>
                </summary>
                <div className="faq-body">{f.a}</div>
              </motion.details>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--line)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-7 text-[0.72rem] text-[var(--ink-faint)]">
          <span>
            © {new Date().getFullYear()} PT Prioritech Indonesia Optima ·{" "}
            <a className="text-[var(--ink-muted)] hover:text-[var(--gold)] transition-colors" href="https://prioritech.co.id">
              prioritech.co.id
            </a>{" "}
            ·{" "}
            <a className="text-[var(--ink-muted)] hover:text-[var(--gold)] transition-colors" href={DOCS}>
              docs
            </a>
          </span>
          <Version />
        </div>
      </footer>
    </>
  )
}
