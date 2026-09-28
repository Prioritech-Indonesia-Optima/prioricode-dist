import { useEffect, useRef, useState, type ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"
import { ascii, tone } from "./brand"
import { wordmark } from "./wordmark"
import { Starfield } from "./Starfield"
import markBlack from "../../brand/mark-black.png"
import markWhite from "../../brand/mark-white.png"
import blackLockup from "../../black-logo/Asset 16.png"
import whiteLockup from "../../white-logo/Asset 10.png"

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

function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const el = barRef.current
      if (!el) return
      const doc = document.documentElement
      const max = doc.scrollHeight - doc.clientHeight
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      el.style.transform = `scaleX(${p})`
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])
  return (
    <div className="scroll-progress" aria-hidden="true">
      <div ref={barRef} />
    </div>
  )
}

/* ------------------------------------------------------------- brand art -- */

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
    <pre className="wordmark" aria-hidden="true" style={reduced ? { animation: "none" } : undefined}>
      {wordmark.join("\n")}
    </pre>
  )
}

/* ---------------------------------------------------------- typed cycle -- */

const PHRASES = ["reads your codebase.", "runs your tools.", "ships your code.", "asks before touching prod."]

function CyclingLine({ reduced }: { reduced: boolean }) {
  const [text, setText] = useState(reduced ? PHRASES[0] : "")
  const state = useRef({ phrase: 0, len: 0, mode: "type" as "type" | "hold" | "del" })
  useEffect(() => {
    if (reduced) return
    let timer: ReturnType<typeof setTimeout>
    const tick = () => {
      const s = state.current
      const full = PHRASES[s.phrase]
      if (s.mode === "type") {
        s.len++
        if (s.len >= full.length) {
          s.mode = "hold"
          timer = setTimeout(tick, 2300)
        } else {
          timer = setTimeout(tick, 42 + Math.random() * 46)
        }
      } else if (s.mode === "hold") {
        s.mode = "del"
        timer = setTimeout(tick, 0)
      } else {
        s.len--
        if (s.len <= 0) {
          s.phrase = (s.phrase + 1) % PHRASES.length
          s.mode = "type"
          timer = setTimeout(tick, 320)
        } else {
          timer = setTimeout(tick, 18)
        }
      }
      setText(full.slice(0, s.len))
    }
    timer = setTimeout(tick, 900)
    return () => clearTimeout(timer)
  }, [reduced])
  return (
    <p className="mt-3 min-h-[1.7em] text-[clamp(0.95rem,2.4vw,1.15rem)] text-[var(--ink-muted)]" aria-hidden="true">
      <span className="t-prompt">&gt; </span>
      it {text}
      {!reduced && <span className="caret" />}
    </p>
  )
}

/* -------------------------------------------------------- live terminal -- */

type TermLine = { kind: "cmd" | "prompt" | "dim" | "ok" | "done"; text: string }
const SESSION: TermLine[] = [
  { kind: "cmd", text: "prioricode" },
  { kind: "dim", text: "build agent · tab for plan · /help" },
  { kind: "prompt", text: "refactor the auth middleware to JWT — keep tests green" },
  { kind: "dim", text: "◆ search  src/                8 files" },
  { kind: "dim", text: "◆ read    src/middleware/auth.ts" },
  { kind: "dim", text: "◆ edit    src/middleware/auth.ts     +24 −11" },
  { kind: "dim", text: "◆ bash    bun test middleware" },
  { kind: "ok", text: "✓ 14 passed" },
  { kind: "done", text: "done in 38s · review the diff? [y/n]" },
]

function LiveTerminal({ reduced }: { reduced: boolean }) {
  const [li, setLi] = useState(reduced ? SESSION.length : 0)
  const [ci, setCis] = useState(0)
  useEffect(() => {
    if (reduced) return
    let timer: ReturnType<typeof setTimeout>
    if (li >= SESSION.length) {
      timer = setTimeout(() => {
        setLi(0)
        setCis(0)
      }, 7000)
    } else {
      const line = SESSION[li]
      const typed = line.kind === "cmd" || line.kind === "prompt"
      if (typed && ci < line.text.length) {
        timer = setTimeout(() => setCis(ci + 1), line.kind === "cmd" ? 70 : 26 + Math.random() * 30)
      } else {
        timer = setTimeout(() => {
          setCis(0)
          setLi(li + 1)
        }, typed ? 420 : 260 + Math.random() * 260)
      }
    }
    return () => clearTimeout(timer)
  }, [li, ci, reduced])
  const shown = reduced ? SESSION : SESSION.slice(0, Math.min(li + 1, SESSION.length))
  return (
    <div className="term mx-auto max-w-3xl">
      <div className="term-bar">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
        <span className="ml-2 text-[0.68rem] text-[var(--ink-faint)]">prioricode — build agent</span>
      </div>
      <div className="term-body">
        {shown.map((line, i) => {
          const isCurrent = i === li && !reduced
          const typed = line.kind === "cmd" || line.kind === "prompt"
          const text = typed && isCurrent ? line.text.slice(0, ci) : line.text
          const cls =
            line.kind === "dim"
              ? "t-dim"
              : line.kind === "ok"
                ? "t-ok"
                : line.kind === "done"
                  ? "t-ok"
                  : "text-[var(--ink)]"
          return (
            <div key={i} className={cls}>
              {line.kind === "cmd" && <span className="t-prompt">$ </span>}
              {line.kind === "prompt" && <span className="t-prompt">❯ </span>}
              {text}
              {typed && isCurrent && <span className="caret" />}
              {line.kind === "done" && (ci === 0 || reduced) && <span className="caret" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ----------------------------------------------------------- fact strip -- */
/* Static, not a looping marquee — "motion is punctuation, not decoration". */

const FACTS = [
  "terminal-native",
  "build ⇄ plan agents",
  "cross-session coordination",
  "model-agnostic",
  "bring your own keys",
  "open source",
  "x64 · arm · baseline",
  "made in jakarta",
  "progress. precision. priority.",
]

function StarSep() {
  return (
    <svg viewBox="0 0 16 16" className="mx-1 inline-block h-2.5 w-2.5 align-middle text-[var(--gold)]" aria-hidden="true">
      <path fill="currentColor" d="M8 0q0 6 8 8q-8 0-8 8q0-8-8-8q8 0 8-8Z" />
    </svg>
  )
}

function Facts() {
  return (
    <div className="facts" aria-label="Project facts">
      {FACTS.map((item) => (
        <span className="fact" key={item}>
          <StarSep />
          {item}
        </span>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------- widgets -- */

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
            {t === "sh" ? "macos & linux" : "windows"}
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
          {copied ? "copied" : "copy"}
        </button>
      </div>
      <p className="mt-2 text-[0.72rem] text-[var(--ink-faint)]">
        installs the latest release — x64 & arm. pin a version with{" "}
        <code className="text-[var(--gold)]">bash -s -- --version X.Y.Z</code>.
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

/* ------------------------------------------------------------- features -- */
/* Per AGENTS.md identity: features are SHOWN OPERATING, never icon-cards.
   Each capability is a dry line plus the real artifact — a command, a key, a
   config line, a coordination log. Terminal material, not marketing. */

const PROOFS: { title: string; body: string; art: string[] }[] = [
  {
    title: "lives in your shell",
    body: "No IDE to open, no tab to lose. It runs where you already work — macOS, Linux, Windows, x64 and ARM.",
    art: ["~/code $ prioricode", "build agent · tab for plan · /help"],
  },
  {
    title: "two agents, one Tab",
    body: "build ships it. plan reads the room first. flip mid-thought — no mode anxiety, no restart.",
    art: ["[Tab]  build ⇄ plan", "plan: read-only until you say go"],
  },
  {
    title: "a room full of agents",
    body: "Several sessions, one repo. They announce themselves, claim files, and pass notes — nobody stomps on a diff.",
    art: ["ses_a12f  claimed  src/auth.ts", "ses_b3e7  waiting   → not blocked"],
  },
  {
    title: "bring your own brain",
    body: "Anthropic, OpenAI, Google, or the 7B humming on your desk. Providers and models switch per session.",
    art: ["model = anthropic/claude-opus-4-5", "your keys · your context · no lock-in"],
  },
  {
    title: "nothing hidden",
    body: "The agent, the tools, the context engine — all readable, all forkable. Audit the last prompt if you want.",
    art: ["git clone github.com/.../prioricode", "MIT-style · yours to read and ship"],
  },
  {
    title: "progress. precision. priority.",
    body: "Built by Prioritech in Jakarta, shipped daily, in the open. The star in the mark isn't decoration.",
    art: ["// today's release is already out", "// tomorrow's is compiling"],
  },
]

const FAQS: { q: string; a: ReactNode }[] = [
  {
    q: "what is PrioriCode, exactly",
    a: "An open source AI coding agent that lives in your terminal. It reads your codebase, edits files, runs your tests and builds, and keeps going until the work is verified — one conversation at a time.",
  },
  {
    q: "which models does it run on",
    a: (
      <>
        Whichever you point it at. Anthropic, OpenAI, Google, local endpoints — switch providers and models per session. The agent is free;{" "}
        <a href="https://prioritech.co.id">your keys are yours</a>.
      </>
    ),
  },
  {
    q: "what are build and plan",
    a: (
      <>
        Two agents, one <kbd className="text-[var(--gold)]">Tab</kbd> key. <strong className="text-[var(--ink)]">build</strong> has full
        access and ships work. <strong className="text-[var(--ink)]">plan</strong> is read-only: it explores, explains, and drafts a plan
        before anything gets touched. Serious change? plan first.
      </>
    ),
  },
  {
    q: "can several agents work on one repo",
    a: "Yes — that's the point of the coordination channel. Concurrent sessions share presence, claim files before editing, and message each other. It's a room, not a race.",
  },
  {
    q: "which platforms",
    a: (
      <>
        macOS and Linux via one bash command, Windows via PowerShell. x64 and ARM, baseline builds included. The one-liners are up top; binaries live on{" "}
        <a href={`${GITHUB}/releases`}>GitHub releases</a>.
      </>
    ),
  },
  {
    q: "is it free",
    a: (
      <>
        Free and open source — agent, tools, context engine, all of it on{" "}
        <a href={GITHUB}>GitHub</a>. Read it, fork it, ship it. The star is a promise, not a paywall.
      </>
    ),
  },
]

/* ------------------------------------------------------------------ app -- */

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

      <ScrollProgress />

      <div className="backdrop">
        <Starfield />
      </div>

      <header className="site-header">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
          <a className="brandlink flex items-center gap-2.5 font-bold tracking-tight" href="/">
            <img
              src={theme === "dark" ? markWhite : markBlack}
              alt=""
              aria-hidden="true"
              className="h-7 w-7 shrink-0"
            />
            <span>
              Priori<em className="text-[var(--gold)] not-italic font-extrabold">Code</em>
            </span>
          </a>
          <nav className="flex items-center gap-1.5 text-[0.78rem] flex-wrap">
            <a className="navlink px-2 py-2" href={DOCS}>
              docs
            </a>
            <a className="navlink px-2 py-2" href={`${GITHUB}/releases`}>
              releases
            </a>
            <a className="navlink px-2 py-2" href={GITHUB}>
              github
            </a>
            <a className="navlink hidden px-2 py-2 sm:inline" href="https://prioritech.co.id">
              prioritech
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

      <main>
        {/* ------------------------------------------------------------ hero */}
        <section className="relative mx-auto flex min-h-[calc(100vh-56px)] max-w-6xl flex-col justify-center px-5 py-10 sm:py-14">
          <div className="relative">
            <div className="hero-glow" aria-hidden="true" />
            <Wordmark reduced={reduced} />
          </div>
          <div className="mt-10 grid items-start gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="min-w-0">
              <p className="kicker">open source · jakarta · progress. precision. priority.</p>
              <h2 className="mt-4 text-[clamp(1.5rem,4vw,2.3rem)] font-bold leading-[1.15] tracking-tight">
                Your terminal just got <span className="text-[var(--gold)]">ambitious.</span>
              </h2>
              <CyclingLine reduced={reduced} />
              <p className="mt-4 max-w-prose text-[0.88rem] leading-relaxed text-[var(--ink-muted)]">
                PrioriCode is the open source AI coding agent by{" "}
                <a className="text-[var(--gold)] hover:underline underline-offset-4" href="https://prioritech.co.id">
                  Prioritech
                </a>
                . One command in, and your shell gets a partner that reads the repo, writes the diff, and proves it
                with tests.
              </p>
              <div className="mt-7">
                <Install />
              </div>
              <div className="mt-6 flex flex-wrap gap-2.5">
                <a className="btn primary" href={`${GITHUB}/releases/latest`}>
                  <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                    <path d="M8 1a.75.75 0 0 1 .75.75v6.44l1.97-1.97a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 1.06-1.06l1.97 1.97V1.75A.75.75 0 0 1 8 1ZM2 13.25A.75.75 0 0 1 2.75 12.5h10.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" />
                  </svg>
                  download latest
                </a>
                <a className="btn" href={DOCS}>
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4" aria-hidden="true">
                    <path d="M2.5 2.5h4.2c1.4 0 1.8 1 1.8 2.2V13c0-1 .5-1.7 1.7-1.7h3.3V2.5H8.9" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2.5 2.5v9.5c0-.7.7-1.2 1.6-1.2h4.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  read the docs
                </a>
                <a className="btn" href={GITHUB}>
                  <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.53.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .75-.24 2.48.92a6.9 6.9 0 0 1 2.27-.3c.77 0 1.54.2 2.27.6 1.72-1.16 2.48-.92 2.48-.92.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
                  </svg>
                  star on github
                </a>
              </div>
            </div>
            <div className="hidden items-center justify-center lg:flex" aria-hidden="true">
              <div>
                <AsciiLogo />
                <p className="kicker mt-4 text-center">the mark, as your terminal draws it</p>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------- ticker */}
        <Facts />

        {/* -------------------------------------------------------- session */}
        <section className="mx-auto max-w-6xl px-5 py-14" aria-label="PrioriCode in action">
          <motion.div {...fade()}>
            <p className="kicker text-center mb-6">a session, start to ship</p>
            <LiveTerminal reduced={reduced} />
          </motion.div>
        </section>

        {/* -------------------------------------------------------- features */}
        <section id="features" className="mx-auto max-w-6xl px-5 py-14" aria-label="What it does">
          <motion.div {...fade()}>
            <p className="kicker mb-4">what it does</p>
            <h2 className="max-w-2xl text-[clamp(1.25rem,3vw,1.7rem)] font-bold tracking-tight">
              An agent you can read, <span className="text-[var(--gold)]">not just trust.</span>
            </h2>
          </motion.div>
          <div className="spec mt-8">
            {PROOFS.map((p) => (
              <motion.div key={p.title} {...fade()} className="spec-row">
                <div className="spec-lead">
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                </div>
                <div className="spec-art" aria-hidden="true">
                  {p.art.map((line, j) => (
                    <div key={j} className={j === 0 ? "spec-art-main" : "spec-art-dim"}>
                      {line}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------------------ docs */}
        <section className="mx-auto max-w-6xl px-5 py-14" aria-label="Documentation">
          <motion.div {...fade()} className="card grid gap-6 p-7 sm:grid-cols-[1.4fr_1fr] sm:items-center sm:p-9">
            <div>
              <p className="kicker mb-3">docs</p>
              <h2 className="text-[clamp(1.15rem,3vw,1.5rem)] font-bold tracking-tight">
                The docs live <span className="text-[var(--gold)]">right here.</span>
              </h2>
              <p className="mt-2.5 text-[0.83rem] leading-relaxed text-[var(--ink-muted)]">
                Quickstart, agents, configuration, permission rules, the SDK — on this site. No account, no cookie
                wall, and search works offline. Two minutes from zero to your first shipped change.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5 sm:justify-end">
              <a className="btn primary" href={DOCS}>
                open the docs
              </a>
              <a className="btn" href={`${DOCS}quickstart.html`}>
                quickstart
              </a>
            </div>
          </motion.div>
        </section>

        {/* ---------------------------------------------------------- brand */}
        <section className="mx-auto max-w-6xl px-5 py-14" aria-label="Official brand mark">
          <motion.div {...fade()}>
            <p className="kicker text-center mb-6">the official mark</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <motion.figure {...fade(0.06)} className="card p-6">
                <img
                  src={blackLockup}
                  alt="Prioritech Indonesia Optima — official black logo on a light background"
                  className="mx-auto max-h-28 w-auto max-w-full"
                  loading="lazy"
                />
                <figcaption className="mt-4 text-center text-[0.72rem] text-[var(--ink-faint)]">
                  black · on light
                </figcaption>
              </motion.figure>
              <motion.figure {...fade(0.12)} className="card p-6">
                <div className="rounded-[10px] bg-[var(--bg-deep)] p-4">
                  <img
                    src={whiteLockup}
                    alt="Prioritech Indonesia Optima — official white logo on a dark background"
                    className="mx-auto max-h-24 w-auto max-w-full"
                    loading="lazy"
                  />
                </div>
                <figcaption className="mt-4 text-center text-[0.72rem] text-[var(--ink-faint)]">
                  white · on dark
                </figcaption>
              </motion.figure>
            </div>
          </motion.div>
        </section>

        {/* ------------------------------------------------------------- faq */}
        <section id="faq" className="mx-auto max-w-6xl px-5 py-14" aria-label="Frequently asked questions">
          <p className="kicker text-center mb-4">faq</p>
          <motion.h2 {...fade()} className="text-center text-[clamp(1.25rem,3vw,1.7rem)] font-bold tracking-tight">
            Questions, answered like a developer.
          </motion.h2>
          <div className="mx-auto mt-8 grid max-w-3xl gap-3">
            {FAQS.map((f, i) => (
              <motion.details key={f.q} {...fade(0.04 * i)} className="faq" open={i === 0 ? true : undefined}>
                <summary>
                  {f.q}
                  <svg
                    viewBox="0 0 16 16"
                    className="chev h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
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
            © {new Date().getFullYear()} PT Prioritech Indonesia Optima · Jakarta ·{" "}
            <span className="text-[var(--ink-muted)]">
              progress. precision. <span className="text-[var(--gold)]">priority.</span>
            </span>{" "}
            ·{" "}
            <a className="text-[var(--ink-muted)] hover:text-[var(--gold)] transition-colors" href={DOCS}>
              docs
            </a>{" "}
            ·{" "}
            <a className="text-[var(--ink-muted)] hover:text-[var(--gold)] transition-colors" href="https://prioritech.co.id">
              prioritech.co.id
            </a>
          </span>
          <Version />
        </div>
      </footer>
    </>
  )
}
