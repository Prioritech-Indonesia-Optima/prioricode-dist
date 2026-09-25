import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { viteSingleFile } from "vite-plugin-singlefile"

// Builds the one self-contained artifact GitHub Pages serves at the domain
// root: repo-root index.html. Everything (JS, CSS, fonts) is inlined, so the
// page never references generated asset paths and no other repo files are
// touched. emptyOutDir is false because the output directory IS the repo root.
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
  build: {
    outDir: "..",
    emptyOutDir: false,
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
  },
})
