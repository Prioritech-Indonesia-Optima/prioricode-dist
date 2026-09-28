import { defineConfig } from "vitepress"
import { banner, sidebar } from "./sidebar.generated.mjs"

// The docs are served at https://code.prioritech.co.id/docs/ — `base` and
// `outDir` must stay in lockstep (AGENTS.md runbook).
export default defineConfig({
  base: "/docs/",
  srcDir: ".",
  outDir: "../docs",
  title: "PrioriCode Docs",
  description: "Documentation for PrioriCode — the open source AI coding agent by Prioritech.",
  lang: "en-US",
  appearance: "dark",
  lastUpdated: false,
  editLink: undefined,
  cleanUrls: false,
  head: [
    ["link", { rel: "icon", type: "image/png", href: "/brand/mark-black.png" }],
    ["meta", { name: "theme-color", content: "#1a1917" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:title", content: "PrioriCode Docs" }],
    [
      "meta",
      {
        property: "og:description",
        content: "Install and master PrioriCode, the open source AI coding agent by Prioritech.",
      },
    ],
  ],
  vite: {
    server: { host: true },
  },
  themeConfig: {
    logo: { light: "/mark-black.png", dark: "/mark-white.png" },
    siteTitle: "PrioriCode",
    nav: [
      { text: "What is PrioriCode?", link: "/" },
      { text: "Quickstart", link: "/quickstart" },
      { text: "SDK", link: "/sdk" },
      { text: "← Site", link: "https://code.prioritech.co.id/" },
    ],
    sidebar,
    banner,
    socialLinks: [{ icon: "github", link: "https://github.com/Prioritech-Indonesia-Optima/prioricode" }],
    search: { provider: "local", options: { translations: { button: { buttonText: "Search docs" } } } },
    footer: {
      message: "Released under the Prioritech open source license.",
      copyright: "© PT Prioritech Indonesia Optima — Jakarta",
    },
    outline: { label: "On this page" },
    docFooter: { prev: "Previous", next: "Next" },
  },
})
