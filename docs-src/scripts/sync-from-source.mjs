#!/usr/bin/env node
// Syncs the PrioriCode documentation from the canonical authoring source
// (the `prioricode` monorepo at packages/docs, Mintlify MDX) into VitePress
// markdown for code.prioritech.co.id/docs. Single source of truth stays in
// packages/docs; this script is the mechanical translation layer.
//
// Usage:  bun scripts/sync-from-source.mjs [--source <path-to-packages/docs>]
// Then:   cd docs-src && bun run build   (regenerates ../docs)
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))
const argv = process.argv
const srcArg = argv.indexOf("--source")
const SOURCE = path.resolve(
  srcArg > -1 ? argv[srcArg + 1] : path.join(here, "..", "..", "..", "packages", "docs"),
)
const OUT = path.resolve(here, "..")

if (!fs.existsSync(path.join(SOURCE, "docs.json"))) {
  console.error(`docs source not found at ${SOURCE} — pass --source <packages/docs>`)
  process.exit(1)
}

const read = (p) => fs.readFileSync(p, "utf8")
const write = (p, s) => {
  fs.mkdirSync(path.dirname(p), { recursive: true })
  fs.writeFileSync(p, s)
}

const site = JSON.parse(read(path.join(SOURCE, "docs.json")))
const version = site.navigation.versions.find((v) => v.default === true) ?? site.navigation.versions[0]

const mdxFiles = []
const walk = (d) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name)
    if (e.isDirectory()) walk(p)
    else if (e.name.endsWith(".mdx")) mdxFiles.push(p)
  }
}
walk(SOURCE)

const titles = {}
for (const f of mdxFiles) {
  const m = read(f).match(/^---\n([\s\S]*?)\n---/)
  const t = m && /title:\s*"?([^"\n]+?)"?\s*$/m.exec(m[1])
  titles[path.relative(SOURCE, f).replace(/\.mdx$/, "").split(path.sep).join("/")] = t
    ? t[1].trim()
    : path.basename(f, ".mdx")
}

// Mintlify root-relative link -> VitePress relative link from `fromFile` (a source-relative path)
// Mintlify root-relative link -> VitePress relative link, from `fromFile` (source-relative path)
const linkRel = (fromFile, href) => {
  const clean = href.replace(/^\//, "")
  const [p, frag] = clean.split("#")
  const anchor = frag ? "#" + frag : ""
  if (path.extname(p)) return "/" + p + anchor // asset served from public/
  const target = p === "" ? "index" : p.replace(/\.mdx$/, "")
  const segments = target.split("/")
  const file = segments.pop() + ".md"
  const dirT = segments.join("/")
  const fd = path.posix.dirname(fromFile) === "." ? "" : path.posix.dirname(fromFile)
  const relDir = path.posix.relative("/" + fd, "/" + dirT)
  const rel = relDir === "" ? file : relDir + "/" + file
  return rel + anchor
}

const linkify = (fromFile, text) =>
  text.replace(/\]\(\/([A-Za-z0-9\-_.\/#]*)\)/g, (_all, inner) => "](" + linkRel(fromFile, "/" + inner) + ")")

const expandInlineFences = (t) =>
  t.replace(/^[ \t]*```(\S+) (.+?) ```[ \t]*$/gm, (_a, lang, code) => "```" + lang + "\n" + code + "\n```")

const dedent = (s) => {
  const lines = s.split("\n")
  const indents = lines.filter((l) => l.trim()).map((l) => l.match(/^\s*/)[0].length)
  const min = indents.length ? Math.min(...indents) : 0
  return lines.map((l) => l.slice(min)).join("\n").trim()
}

function tabify(body) {
  const tabs = []
  const re = /<Tab title="([^"]+)">([\s\S]*?)<\/Tab>/g
  let m
  while ((m = re.exec(body))) tabs.push([m[1], dedent(m[2])])
  const onlyFences = (b) => /^```[^\n]*\n[\s\S]*?\n```(\n\n```[^\n]*\n[\s\S]*?\n```)*$/.test(b)
  if (tabs.length && tabs.every(([, b]) => onlyFences(b))) {
    const parts = tabs.map(([title, b]) => b.replace(/^```(\S+)$/gm, "```$1 [" + title + "]"))
    return ["::: code-group", "", parts.join("\n\n"), "", ":::"].join("\n")
  }
  return tabs.map(([title, b]) => "#### " + title + "\n\n" + b).join("\n\n")
}

const convert = (rel, raw) => {
  const fm = raw.match(/^---\n([\s\S]*?)\n---/)
  let t = fm ? raw.slice(fm[0].length) : raw
  t = expandInlineFences(t)

  for (const [tag, kind] of [
    ["Note", "info"],
    ["Tip", "tip"],
    ["Warning", "warning"],
  ]) {
    t = t.replace(new RegExp("<" + tag + ">([\\s\\S]*?)</" + tag + ">", "g"), (_a, b) => ":::" + kind + "\n" + b.trim() + "\n:::")
  }

  t = t.replace(/<Tabs>([\s\S]*?)<\/Tabs>/g, (_a, b) => tabify(b.trim()))

  const card = (_a, title, href, body) => `- [${title}](${linkRel(rel, href)}) — ${body.trim().replace(/\s*\n\s*/g, " ")}`
  t = t.replace(/<Card title="([^"]+)"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/Card>/g, card)
  t = t.replace(/<CardGroup cols=\{\d+\}>\n([\s\S]*?)<\/CardGroup>/g, (_a, b) => b.trim())

  t = t.replace(/<code>([\s\S]*?)<\/code>/g, "`$1`")
  t = t.replace(/<div className[\s\S]*?<\/div>\n?/g, "")
  t = t.replace(/<img[^>]*>\n?/g, "")

  t = linkify(rel, t)
  t = t.replace(/\n{3,}/g, "\n\n")

  return (fm ? fm[0] + "\n\n" : "") + t.trim() + "\n"
}

const synced = []
for (const f of mdxFiles) {
  const rel = path.relative(SOURCE, f).split(path.sep).join("/")
  if (rel === "index.mdx") continue // docs-src/index.md is the hand-maintained VitePress home
  const out = rel.replace(/\.mdx$/, ".md")
  write(path.join(OUT, out), convert(rel, read(f)))
  synced.push(out)
}

// sidebar + banner from docs.json -> generated module consumed by config.mts
const sections = []
for (const tab of version.tabs) {
  const groups = tab.groups ?? []
  for (const group of groups) {
    const label = tab.tab === "Documentation" ? group.group : groups.length === 1 ? tab.tab : `${tab.tab} — ${group.group}`
    sections.push({
      text: label,
      collapsed: false,
      items: (group.pages ?? []).map((p) => ({ text: titles[p] ?? p, link: "/" + (p === "index" ? "" : p) })),
    })
  }
}
const bannerContent = (site.banner?.content ?? "").replace(/\[([^\]]+)\]\((\/[^)]+)\)/g, "$1")
write(
  path.join(OUT, ".vitepress", "sidebar.generated.mjs"),
  "// GENERATED by scripts/sync-from-source.mjs — do not hand-edit.\n" +
    "// Source: prioricode/packages/docs docs.json (" +
    version.version +
    ", tag: " +
    (version.tag ?? "latest") +
    ")\n" +
    "export const sidebar = " +
    JSON.stringify(sections, null, 2) +
    "\n\nexport const banner = { content: " +
    JSON.stringify(bannerContent) +
    ", dismissible: " +
    (site.banner?.dismissible === false ? "false" : "true") +
    " }\n",
)

// openapi spec so /openapi.json links resolve on this host too
const spec = path.resolve(SOURCE, "..", "sdk", "openapi.json")
if (fs.existsSync(spec)) fs.copyFileSync(spec, path.join(OUT, "public", "openapi.json"))

console.log("synced " + synced.length + " pages from " + SOURCE)
