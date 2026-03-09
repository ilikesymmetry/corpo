---
id: p3-t11
phase: 3
title: Viewer — SPA client
status: todo
---

# Viewer — SPA client

Build the viewer as a single-page app that talks to the corpo server API.
The client owns all parsing, rendering, local state, and thread management.
The server is treated as dumb storage.

See [Viewer Architecture](../.corpo/files/c7a9b2e1f5d34c8a9b3e7f1d2c6b5a4e.md)
and [Server API](../.corpo/files/d8b4f3e2a1c54f9bb2e8c1d6f3e5b7a2.md).

## Scope

1. Initialize Vite + React + TypeScript project in `viewer/` with `npm create vite@latest viewer -- --template react-ts`.

2. Install dependencies:
   ```
   npm install tailwindcss@next @tailwindcss/vite @tailwindcss/typography
   npm install markdown-it highlight.js gray-matter wouter
   npm install -D @types/markdown-it
   ```

3. Configure `vite.config.ts` with the Tailwind plugin and the `/api` dev proxy so Vite forwards API calls to the running `corpo serve` process on `localhost:3000`:
   ```ts
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'
   import tailwindcss from '@tailwindcss/vite'

   export default defineConfig({
     plugins: [react(), tailwindcss()],
     server: {
       proxy: {
         '/api': 'http://localhost:3000'
       }
     }
   })
   ```
   The proxy is dev-only. In production the API server and the SPA share an origin, so no proxy is needed.

4. Create `src/lib/api.ts` — typed fetch wrappers for all six endpoints:
   - `getNavigation(): Promise<{ navigation: Node[] }>`
   - `getFile(id: string): Promise<string>` — returns raw `text/plain`
   - `putNavigation(navigation: Node[]): Promise<void>`
   - `postFile(raw: string): Promise<{ id: string }>`
   - `commitFile(id: string, raw: string): Promise<void>`
   - `deleteFile(id: string): Promise<void>`

   Where `Node = string | { group: string; children: Node[] }`.

5. Create `src/lib/parse.ts` — gray-matter wrapper:
   ```ts
   import matter from 'gray-matter'
   export function parseFile(raw: string) {
     const { data, content } = matter(raw)
     return { data, content }
     // data.title, data.description, data.sidebarTitle, data.threads
     // content = Markdown body with thread anchors still present
   }
   ```

6. Create `src/lib/markdown.ts` — markdown-it instance configured with highlight.js for syntax highlighting and heading anchor IDs:
   - Import `MarkdownIt` and `hljs` from `highlight.js/lib/core`
   - Load languages on demand: register a language the first time it is encountered in a fence
   - Set `highlight` option on the markdown-it instance to call `hljs.highlight`
   - Enable the `linkify` and heading ID options

7. Create `src/components/MarkdownRenderer.tsx` — accepts a `content` string (post-frontmatter body), runs it through the markdown-it instance from `markdown.ts`, and renders the result inside:
   ```tsx
   <div
     className="prose dark:prose-invert max-w-none"
     dangerouslySetInnerHTML={{ __html: html }}
   />
   ```
   Thread anchor replacement happens here before passing `content` to markdown-it (see p3-t12).

8. Create `src/hooks/useNavigation.ts` — calls `getNavigation()` on mount, returns `{ navigation, loading, error }`.

9. Create `src/hooks/useFile.ts` — accepts a file `id`, calls `getFile(id)` when `id` changes, parses the result with `parseFile`, and returns `{ raw, data, content, loading, error }`.

10. Create `src/components/Sidebar.tsx` — recursive component that renders the navigation tree returned by `useNavigation`:
    - String nodes are rendered as links to `/{id}`; the display label is resolved from fetched file frontmatter (`sidebarTitle` → `title`), falling back to the raw ID while loading
    - Group nodes render a collapsible section with a toggle button; collapsed by default
    - Active file ID is highlighted

11. Create `src/components/FileView.tsx` — renders the currently loaded file:
    - Displays `data.title` as `<h1>` and `data.description` as a subtitle (never raw YAML)
    - Passes `content` to `MarkdownRenderer`
    - Sets `document.title` to `data.title` via `useEffect`

12. Create `src/App.tsx` — wouter Router with two routes:
    ```tsx
    <Router>
      <Route path="/" component={RootRedirect} />
      <Route path="/:id" component={FileView} />
    </Router>
    ```
    `RootRedirect` reads the first file ID from navigation and calls `useLocation` to redirect.

13. Wire up dark/light mode toggle — detect `prefers-color-scheme` as the default, allow manual override stored in `localStorage`. Toggle button in the sidebar header or top bar.

14. Test checklist:
    - Run `corpo serve` in one terminal, `npm run dev` in `viewer/` in another
    - Sidebar loads and shows navigation tree
    - Clicking a file ID in the sidebar navigates to `/{id}` and renders the file
    - Code blocks have syntax highlighting
    - Dark mode toggle works

## Done when

- [ ] Fetches corpus config and renders sidebar on load
- [ ] Sidebar labels follow resolution order (`sidebarTitle` → `title`)
- [ ] Navigation groups are collapsible
- [ ] Navigating to `/{id}` fetches and renders the file
- [ ] `title` and `description` displayed cleanly (not as raw YAML)
- [ ] Markdown body renders: tables, code blocks with syntax highlighting,
      heading anchor links
- [ ] Thread anchors stripped from rendered output; inline indicators shown
- [ ] Page `<title>` set from `title` frontmatter
- [ ] Content edits applied to local state without committing
- [ ] Save commits the full modified file via `PUT /api/files/:id/commit`
- [ ] Dark and light mode
- [ ] No external CDN dependencies
