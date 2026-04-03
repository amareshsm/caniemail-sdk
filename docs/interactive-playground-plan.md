# Interactive Playground & Browser Compatibility — Feasibility Analysis

A deep-dive analysis of what it takes to run the `caniemail` package in a browser environment and build an interactive web playground on top of it.

---

## Table of Contents

- [The Core Question](#the-core-question)
- [Current Package Architecture](#current-package-architecture)
- [Blocker Analysis: What Prevents Browser Usage Today](#blocker-analysis-what-prevents-browser-usage-today)
  - [Blocker 1: `require()` in json.cts (Critical)](#blocker-1-require-in-jsoncts-critical)
  - [Blocker 2: Module Format — NodeNext (Moderate)](#blocker-2-module-format--nodenext-moderate)
  - [Blocker 3: `.cts` Extension (Moderate)](#blocker-3-cts-extension-moderate)
- [Dependency Browser Compatibility Audit](#dependency-browser-compatibility-audit)
- [Bundle Size Analysis](#bundle-size-analysis)
- [Solution: Making `caniemail` Browser-Compatible](#solution-making-caniemail-browser-compatible)
  - [Approach A: Bundler-Only (Minimal Changes)](#approach-a-bundler-only-minimal-changes)
  - [Approach B: Dual Build — Node + Browser (Recommended)](#approach-b-dual-build--node--browser-recommended)
  - [Approach C: Universal ESM (Ideal, Breaking Change)](#approach-c-universal-esm-ideal-breaking-change)
- [Recommended Approach: Approach B (Dual Build)](#recommended-approach-approach-b-dual-build)
- [Implementation Plan: Browser Build](#implementation-plan-browser-build)
- [Interactive Playground Architecture](#interactive-playground-architecture)
  - [Option 1: Static SPA (Recommended)](#option-1-static-spa-recommended)
  - [Option 2: Server-Side with API](#option-2-server-side-with-api)
  - [Option 3: WebAssembly](#option-3-webassembly)
- [Playground Feature Set](#playground-feature-set)
- [Playground UI Design](#playground-ui-design)
- [Tech Stack Recommendation](#tech-stack-recommendation)
- [Implementation Roadmap](#implementation-roadmap)
- [Risk Assessment](#risk-assessment)

---

## The Core Question

> _"This library should support the browser environment, right? It should have UMD or ESM output format, then only we can do the interactive playground?"_

**Short answer: Yes — but the good news is it's very feasible.** The core logic is pure computation (parsing strings, comparing data) with no I/O or filesystem access. There is **one critical blocker** and a couple of moderate ones, all fixable without major rewrites.

---

## Current Package Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    caniemail (current)                       │
│                                                             │
│  Module Format:  ESM ("type": "module")                     │
│  TS Target:      ESNext                                     │
│  TS Module:      NodeNext                                   │
│  Output:         dist/*.js + dist/*.d.ts                    │
│  Data:           data/caniemail.json (627 KB raw)           │
│                                                             │
│  ⚠️  json.cts uses require() — Node.js CJS only            │
│  ⚠️  tsconfig uses "module": "NodeNext"                     │
│  ✅ No fs/path/os/child_process imports in src/             │
│  ✅ All dependencies are pure JS (no native modules)        │
└─────────────────────────────────────────────────────────────┘
```

---

## Blocker Analysis: What Prevents Browser Usage Today

### Blocker 1: `require()` in `json.cts` (Critical) 🔴

**File:** `src/json.cts`

```typescript
// Line 78 — THE critical blocker
export const caniEmailJson = require('../data/caniemail.json') as CanIEmailJson;
```

**Why it exists:** The comment in the file explains:

> _"This is due to Node v20 and Node v22 diverging on `with 'json'` and `assert 'json'` on importing JSON"_

**Why it blocks browser usage:**

- `require()` is a **Node.js-only** CJS function. It does not exist in browsers.
- The `.cts` extension compiles to `.cjs`, which uses CommonJS module format.
- Bundlers like Vite, Rollup, or esbuild **can** resolve `require()` for JSON files during build time, but the file extension and module format create friction.

**Impact:** This is the **single most important blocker**. Without fixing this, the package cannot run in any browser context — not even with a bundler without custom configuration.

**Fix complexity:** ⭐ Low — multiple straightforward solutions exist (detailed in the Solutions section).

---

### Blocker 2: Module Format — `NodeNext` (Moderate) 🟡

**File:** `tsconfig.json`

```json
{
  "module": "NodeNext",
  "moduleResolution": "NodeNext"
}
```

**Why it's a problem:**

- `NodeNext` emits `.js` files with Node.js-specific module resolution (e.g., `./clients.js` extensions in imports).
- While modern bundlers (Vite, webpack, esbuild) handle `.js` extensions fine, the `NodeNext` resolution strategy means TypeScript **requires** `.js` extensions in imports and resolves `.cts` → `.cjs` files differently.
- A browser-targeted build ideally uses `"module": "ESNext"` or `"ES2022"` with `"moduleResolution": "bundler"`.

**Impact:** Not a hard blocker for bundled environments, but prevents direct `<script type="module">` usage in browsers.

**Fix complexity:** ⭐ Low — add a separate `tsconfig.browser.json`.

---

### Blocker 3: `.cts` Extension (Moderate) 🟡

**File:** `src/json.cts`

The `.cts` extension forces TypeScript to treat this file as CommonJS. This means:

- It compiles to `json.cjs` in the output
- Other ESM files import it, creating a mixed ESM/CJS boundary
- Bundlers handle this, but it adds complexity

**Fix complexity:** ⭐ Low — rename to `.ts` and change the JSON loading approach.

---

## Dependency Browser Compatibility Audit

Every dependency has been audited for browser compatibility:

| Dependency         | Browser Safe? | Notes                                                                                                                                                                                                 |
| ------------------ | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@adobe/css-tools` | ✅ **Yes**    | Pure JS CSS parser/stringifier. Zero dependencies. Originally a fork of the `css` npm package which was always browser-compatible. No Node.js APIs.                                                   |
| `binary-search`    | ✅ **Yes**    | Tiny pure-JS binary search. Zero dependencies. No Node.js APIs. Works anywhere.                                                                                                                       |
| `css-what`         | ✅ **Yes**    | Pure JS CSS selector parser. Zero dependencies. Used by cheerio which works in browsers.                                                                                                              |
| `domhandler`       | ✅ **Yes**    | Pure JS DOM tree builder. Zero dependencies. Types-only package for tree structure.                                                                                                                   |
| `dot-prop`         | ✅ **Yes**    | Pure JS nested property access. Zero dependencies. ESM-only, works in browsers.                                                                                                                       |
| `htmlparser2`      | ✅ **Yes**    | Pure JS HTML/XML parser. Explicitly works in browsers — used by cheerio which has a browser bundle. The only Node.js-specific part is `WritableStream` (a separate sub-import not used by caniemail). |
| `micromatch`       | ✅ **Yes**    | Pure JS glob matching. Uses regex internally. No filesystem access. No Node.js APIs in the core matching logic. Depends on `braces` and `picomatch` which are also pure JS.                           |
| `onetime`          | ✅ **Yes**    | Pure JS. Zero dependencies. Wraps a function to only execute once.                                                                                                                                    |
| `split-lines`      | ✅ **Yes**    | Pure JS string splitting. Zero dependencies.                                                                                                                                                          |
| `style-to-object`  | ✅ **Yes**    | Pure JS inline style parser. Depends on `inline-style-parser` which is pure JS.                                                                                                                       |

### Verdict: **ALL dependencies are browser-compatible** ✅

This is excellent news. There are **zero dependency blockers**. The entire dependency tree is pure JavaScript computation — no native modules, no Node.js APIs, no filesystem access.

---

## Bundle Size Analysis

| Component                             | Raw Size    | Gzipped     | Notes                         |
| ------------------------------------- | ----------- | ----------- | ----------------------------- |
| `caniemail.json` (data)               | 627 KB      | **62 KB**   | The largest component by far  |
| `@adobe/css-tools`                    | ~46 KB      | ~12 KB      | CSS parser                    |
| `htmlparser2` + `domhandler`          | ~45 KB      | ~13 KB      | HTML parser                   |
| `micromatch` + `picomatch` + `braces` | ~52 KB      | ~14 KB      | Glob matching                 |
| `css-what`                            | ~18 KB      | ~5 KB       | CSS selector parser           |
| Other deps (dot-prop, onetime, etc.)  | ~15 KB      | ~4 KB       | Small utilities               |
| `caniemail` source code               | ~25 KB      | ~6 KB       | The library itself            |
| **Estimated Total Bundle**            | **~828 KB** | **~116 KB** | Very reasonable for a web app |

**Analysis:** A ~116 KB gzipped bundle is well within acceptable range for a web application. The data file (62 KB gzipped) dominates, but this is the core value of the package. For comparison:

- React + ReactDOM = ~44 KB gzipped
- Monaco Editor (VS Code) = ~2.5 MB gzipped
- CodeMirror 6 = ~150 KB gzipped

The playground with a code editor + caniemail would be **roughly 250–300 KB gzipped** — perfectly acceptable.

---

## Solution: Making `caniemail` Browser-Compatible

### Approach A: Bundler-Only (Minimal Changes)

**Strategy:** Keep the package as-is, but document that browser usage requires a bundler (Vite, webpack, esbuild) with JSON import support.

**Changes required:**

- Replace `require()` in `json.cts` → static import with `assert`/`with` syntax, OR
- Just inline the JSON or use a dynamic `import()`

**Pros:**

- Minimal code changes
- No additional build complexity
- Works with any modern bundler

**Cons:**

- Cannot be used via `<script>` tag or CDN directly
- Users must configure their bundler to handle JSON imports
- The `.cts` → `.cjs` boundary still exists

**Verdict:** Quick fix, but limiting.

---

### Approach B: Dual Build — Node + Browser (Recommended) ⭐

**Strategy:** Keep the existing Node.js build intact, and add a **second browser build** using a bundler (e.g., tsup, Rollup, or esbuild) that produces a self-contained ESM bundle with the JSON data inlined.

**Changes required:**

1. **Refactor `json.cts`** → `json.ts` with a swappable data source
2. **Add browser build config** (tsup/rollup) that bundles everything into a single ESM file
3. **Add `browser` and/or `exports` conditions** to `package.json`

**package.json changes:**

```jsonc
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "browser": "./dist/browser/index.mjs", // NEW
      "default": "./dist/index.js"
    },
    "./caniemail.json": "./data/caniemail.json",
    "./package.json": "./package.json"
  }
}
```

**Pros:**

- ✅ Zero breaking changes for existing Node.js users
- ✅ Bundlers automatically pick the `browser` export
- ✅ Can also produce a UMD/IIFE build for `<script>` tag usage
- ✅ Can produce a CDN-ready build for unpkg/jsDelivr
- ✅ The playground can import from the browser build directly

**Cons:**

- Two build steps to maintain
- Slightly more complex CI/release process

**Verdict:** Best balance of compatibility and maintainability. **Recommended.**

---

### Approach C: Universal ESM (Ideal, Breaking Change)

**Strategy:** Rewrite the package to be purely ESM with no CJS, no `require()`, and use top-level `import` for JSON (with bundler-compatible approach).

**Changes required:**

1. Delete `json.cts` entirely
2. Create `json.ts`:
   ```typescript
   import data from '../data/caniemail.json' with { type: 'json' };

   export const caniEmailJson = data as CanIEmailJson;
   ```
3. Change tsconfig to `"module": "ES2022"` + `"moduleResolution": "bundler"`
4. Single build that works everywhere

**Pros:**

- Cleanest architecture
- Single build output
- Future-proof (import attributes are Stage 4)

**Cons:**

- ⚠️ **Breaking change**: Requires Node.js 22+ (import attributes with `with`)
- Current package supports Node 20.19+, this would raise the minimum
- Some bundler versions may not support `with { type: 'json' }` yet

**Verdict:** Ideal long-term, but premature today due to Node.js 20 support requirement.

---

## Recommended Approach: Approach B (Dual Build)

Here's the detailed implementation:

### Step 1: Refactor JSON Loading

Replace `src/json.cts`:

```typescript
// src/json.ts (NEW — replaces json.cts)

export type SupportType = string;

export interface RawFeatureStats { /* ... same interfaces ... */ }
export interface RawFeatureData { /* ... same interfaces ... */ }
export interface CanIEmailJson { /* ... same interfaces ... */ }

// Default: will be replaced at build time for browser, or loaded via require for Node
let _data: CanIEmailJson;

// For Node.js: loaded synchronously at startup
// For Browser: data is inlined by the bundler
export function setData(data: CanIEmailJson) {
  _data = data;
}

export function getData(): CanIEmailJson {
  if (!_data) {
    // Node.js fallback: dynamic require
    // This branch is dead-code-eliminated in browser builds
    if (typeof globalThis.process !== 'undefined' && globalThis.process.versions?.node) {
      const { createRequire } = await import('node:module');
      const require = createRequire(import.meta.url);
      _data = require('../data/caniemail.json');
    } else {
      throw new Error(
        'caniemail: Data not loaded. In browser environments, import from "caniemail/browser" ' +
        'or call setData() with the caniemail.json data before using the library.'
      );
    }
  }
  return _data;
}

// Keep backward-compatible named export
export const caniEmailJson: CanIEmailJson = new Proxy({} as CanIEmailJson, {
  get(_, prop) {
    return getData()[prop as keyof CanIEmailJson];
  }
});
```

**Alternative simpler approach** (recommended for practical implementation):

Keep two entry points:

```typescript
// src/json.ts (Node.js entry — replaces json.cts)
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
export const caniEmailJson = require('../data/caniemail.json') as CanIEmailJson;
```

```typescript
// src/json.browser.ts (Browser entry — NEW)
import data from '../data/caniemail.json';

export const caniEmailJson = data as CanIEmailJson;
```

Then configure the bundler to swap `json.ts` → `json.browser.ts` for browser builds via aliases.

### Step 2: Add Browser Build with tsup

```typescript
// tsup.config.ts (NEW)
import { defineConfig } from 'tsup';

export default defineConfig([
  // Browser ESM bundle
  {
    entry: { 'browser/index': 'src/index.ts' },
    format: ['esm'],
    platform: 'browser',
    target: 'es2022',
    bundle: true,
    minify: true,
    sourcemap: true,
    dts: true,
    loader: { '.json': 'json' },
    // Swap Node.js JSON loader with browser-compatible one
    alias: {
      './json.js': './json.browser.js'
    },
    outDir: 'dist'
  },
  // Browser IIFE/UMD for <script> tag usage
  {
    entry: { 'browser/caniemail': 'src/index.ts' },
    format: ['iife'],
    platform: 'browser',
    target: 'es2020',
    globalName: 'CanIEmail',
    bundle: true,
    minify: true,
    sourcemap: true,
    loader: { '.json': 'json' },
    alias: {
      './json.js': './json.browser.js'
    },
    outDir: 'dist'
  }
]);
```

### Step 3: Update `package.json` Exports

```jsonc
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "browser": "./dist/browser/index.mjs",
      "default": "./dist/index.js"
    },
    "./browser": {
      "types": "./dist/browser/index.d.mts",
      "default": "./dist/browser/index.mjs"
    },
    "./caniemail.json": "./data/caniemail.json",
    "./package.json": "./package.json"
  },
  // For older bundlers that check the "browser" field
  "browser": {
    "./dist/index.js": "./dist/browser/index.mjs"
  }
}
```

### Step 4: CDN Usage

After publishing, the package would work via CDN:

```html
<!-- ESM via CDN -->
<script type="module">
  import { caniemail } from 'https://esm.sh/caniemail';
  // or
  import { caniemail } from 'https://cdn.jsdelivr.net/npm/caniemail/dist/browser/index.mjs';
</script>

<!-- IIFE via script tag -->
<script src="https://cdn.jsdelivr.net/npm/caniemail/dist/browser/caniemail.global.js"></script>
<script>
  const result = CanIEmail.caniemail({ clients: ['gmail.*'], html: '<div>Hello</div>' });
</script>
```

---

## Interactive Playground Architecture

### Option 1: Static SPA (Recommended) ⭐

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser (Client-Side Only)                │
│                                                             │
│  ┌─────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │  Code Editor │  │  caniemail SDK   │  │  Results UI  │  │
│  │  (CodeMirror │→ │  (browser build) │→ │  (React/     │  │
│  │   or Monaco) │  │  runs entirely   │  │   Svelte)    │  │
│  │             │  │  in the browser  │  │              │  │
│  └─────────────┘  └──────────────────┘  └──────────────┘  │
│                                                             │
│  No server needed. Deploy to GitHub Pages / Vercel / etc.  │
└─────────────────────────────────────────────────────────────┘
```

**How it works:**

1. User types/pastes HTML in the code editor
2. On every keystroke (debounced ~300ms), call `caniemail()` with the HTML
3. Display results instantly — errors, warnings, compatibility score
4. **Everything runs in the browser. No network requests. No server.**

**Pros:**

- Zero server cost (deploy to GitHub Pages for free)
- Instant results (no network latency)
- Works offline
- Privacy-friendly (code never leaves the browser)
- Simplest to maintain

**Cons:**

- Initial download includes the ~116 KB bundle (one-time)
- Cannot do server-side screenshot rendering

**Verdict:** **Best choice.** The library is perfect for this — pure computation, no I/O.

---

### Option 2: Server-Side with API

```
┌──────────────┐    HTTP/WS     ┌──────────────────┐
│  Browser UI  │ ──────────────→│  Node.js Server   │
│  (editor +   │                │  (caniemail SDK   │
│   results)   │←───────────────│   runs here)      │
└──────────────┘    JSON        └──────────────────┘
```

**When to use:** Only if you want to add features that require a server:

- Storing/sharing email templates (need a database)
- Screenshot previews via email rendering (need Puppeteer/Playwright)
- Authentication, rate limiting, analytics

**Verdict:** Unnecessary for a basic playground. Overkill.

---

### Option 3: WebAssembly

Not applicable. The library is already pure JavaScript. WASM would add complexity with zero benefit.

---

## Playground Feature Set

### Core Features (MVP)

| Feature                 | Description                                                              |
| ----------------------- | ------------------------------------------------------------------------ |
| **HTML Editor**         | Syntax-highlighted, auto-completing HTML editor (CodeMirror 6 or Monaco) |
| **CSS Editor**          | Optional separate CSS input panel                                        |
| **Client Selector**     | Checkboxes / multi-select with glob support for email clients            |
| **Live Results**        | Real-time errors and warnings as you type                                |
| **Inline Diagnostics**  | Squiggly underlines in the editor at the exact positions of issues       |
| **Issue Panel**         | Sortable list of all issues with severity, client, and feature title     |
| **Compatibility Score** | Overall score gauge (once scoring feature is implemented)                |
| **Share URL**           | Encode HTML + client selection in URL hash for sharing                   |

### Enhanced Features (Post-MVP)

| Feature                  | Description                                             |
| ------------------------ | ------------------------------------------------------- |
| **Template Gallery**     | Pre-built email templates to explore and learn from     |
| **Side-by-Side Preview** | Rendered HTML preview next to the editor                |
| **Per-Client View**      | Select a client and see exactly what breaks             |
| **Export Report**        | Download results as JSON, Markdown, or PDF              |
| **Dark Mode**            | Theme toggle for the playground UI                      |
| **Feature Browser**      | Browse all caniemail features with search and filtering |
| **Diff Mode**            | Paste two emails and compare compatibility              |
| **URL Import**           | Fetch an email from a URL and analyze it                |

---

## Playground UI Design

```
┌──────────────────────────────────────────────────────────────────────┐
│  🔍 Can I Email — Interactive Playground           [Share] [GitHub]  │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Clients: [gmail.* ×] [outlook.* ×] [apple-mail.* ×] [+ Add]       │
│                                                                      │
├────────────────────────────────┬─────────────────────────────────────┤
│                                │                                     │
│  HTML Editor                   │  Results                            │
│  ┌──────────────────────────┐  │  ┌────────────────────────────────┐│
│  │ 1  <!doctype html>       │  │  │  Score: 86.3%  Grade: B       ││
│  │ 2  <html>                │  │  │  ████████████████░░░░          ││
│  │ 3    <head>              │  │  │                                ││
│  │ 4      <style>           │  │  │  ❌ Errors (5)                ││
│  │ 5        .card {         │  │  │  ├─ display: flex              ││
│  │ 6          display: flex;│~~│  │  │  outlook.windows            ││
│  │ 7          gap: 16px;    │~~│  │  ├─ gap                       ││
│  │ 8          border-radius:│~~│  │  │  outlook.windows            ││
│  │ 9        }               │  │  │  └─ border-radius             ││
│  │10      </style>          │  │  │     outlook.windows            ││
│  │11    </head>             │  │  │                                ││
│  │12    <body>              │  │  │  ⚠️ Warnings (2)              ││
│  │13      <div class="card">│  │  │  ├─ @media                    ││
│  │14      </div>            │  │  │  │  gmail.desktop-webmail      ││
│  │15    </body>             │  │  │  └─ background-color           ││
│  │16  </html>               │  │  │     gmail.mobile-webmail       ││
│  └──────────────────────────┘  │  └────────────────────────────────┘│
│                                │                                     │
│  ~~ = inline error markers     │  [View as JSON] [Export Markdown]   │
│                                │                                     │
├────────────────────────────────┴─────────────────────────────────────┤
│  Features detected: 12 | Clients checked: 8 | Time: 3ms            │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack Recommendation

| Layer           | Choice                                                                                                 | Why                                                                          |
| --------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| **Framework**   | [Astro](https://astro.build/) + [React](https://react.dev/) (islands)                                  | Static-first, zero JS where not needed, islands for interactive parts        |
| **Code Editor** | [CodeMirror 6](https://codemirror.net/)                                                                | Lightweight (~150 KB gzip), mobile-friendly, extensible, built for embedding |
| **Styling**     | [Tailwind CSS](https://tailwindcss.com/)                                                               | Utility-first, small bundle, great DX                                        |
| **State**       | [Zustand](https://github.com/pmndrs/zustand) or [nanostores](https://github.com/nanostores/nanostores) | Minimal state management for editor ↔ results sync                          |
| **Build**       | [Vite](https://vitejs.dev/) (via Astro)                                                                | Fast dev server, optimized builds, JSON import support out of the box        |
| **Hosting**     | [GitHub Pages](https://pages.github.com/) or [Vercel](https://vercel.com/)                             | Free, fast CDN, auto-deploy from git                                         |
| **URL Sharing** | `lz-string`                                                                                            | Compress HTML into URL-safe hash for shareable links                         |

**Alternative minimal stack:** If a full framework is too heavy, a vanilla TypeScript + CodeMirror 6 + Vite setup would also work perfectly. The playground is simple enough to not need React.

---

## Implementation Roadmap

### Phase 0: Browser Build for `caniemail` (Week 1) — PREREQUISITE

| Task                             | File                                 | Description                                                             |
| -------------------------------- | ------------------------------------ | ----------------------------------------------------------------------- |
| Refactor `json.cts` → dual entry | `src/json.ts`, `src/json.browser.ts` | Separate Node.js and browser JSON loading                               |
| Add tsup/rollup browser build    | `tsup.config.ts`                     | Produce `dist/browser/index.mjs` and `dist/browser/caniemail.global.js` |
| Update package.json exports      | `package.json`                       | Add `browser` condition, `./browser` subpath                            |
| Test browser build               | `test/browser.test.ts`               | Verify the bundled output works (e.g., via Playwright or happy-dom)     |
| Verify CDN usage                 | Manual test                          | Test with esm.sh, jsdelivr, unpkg                                       |
| Update README                    | `README.md`                          | Document browser usage                                                  |

### Phase 1: Playground MVP (Weeks 2–3)

| Task                              | Description                                            |
| --------------------------------- | ------------------------------------------------------ |
| Scaffold Astro/Vite project       | Create `playground/` directory in the repo             |
| Integrate CodeMirror 6            | HTML editor with syntax highlighting                   |
| Wire up `caniemail` browser build | Import and call on editor change                       |
| Build results panel               | Error/warning list with client grouping                |
| Client selector UI                | Multi-select with glob input support                   |
| Inline diagnostics                | Mark errors in the editor using CodeMirror decorations |
| Responsive layout                 | Mobile-friendly side-by-side → stacked layout          |
| Deploy to GitHub Pages            | CI/CD with GitHub Actions                              |

### Phase 2: Enhanced Features (Weeks 4–5)

| Task                      | Description                                         |
| ------------------------- | --------------------------------------------------- |
| Share via URL             | Encode state in URL hash with lz-string compression |
| Template gallery          | 5–10 pre-built email templates to explore           |
| Compatibility score gauge | Visual score display (once scoring is implemented)  |
| Per-client breakdown      | Click a client to see its specific issues           |
| Export results            | JSON + Markdown download buttons                    |
| Dark mode                 | Theme toggle with system preference detection       |

### Phase 3: Polish & Launch (Week 6)

| Task                     | Description                                         |
| ------------------------ | --------------------------------------------------- |
| SEO & meta tags          | Open Graph, Twitter cards for shared links          |
| Analytics                | Privacy-friendly analytics (Plausible/Fathom)       |
| Performance optimization | Lazy-load CodeMirror, code-split templates          |
| Documentation            | How to embed, how to contribute templates           |
| Launch                   | Announce on GitHub, social media, email communities |

---

## Risk Assessment

| Risk                                       | Likelihood | Impact | Mitigation                                                                       |
| ------------------------------------------ | ---------- | ------ | -------------------------------------------------------------------------------- |
| `micromatch` has hidden Node.js dependency | Low        | High   | Already audited — `picomatch` core is pure regex. Test with browser build early. |
| Bundle size too large                      | Low        | Medium | 116 KB gzip is fine. Can lazy-load `caniemail.json` if needed.                   |
| `htmlparser2` streaming API not available  | N/A        | None   | `caniemail` uses `parseDocument()`, not `WritableStream`. No issue.              |
| CodeMirror integration complexity          | Medium     | Low    | Well-documented, extensive examples available.                                   |
| Breaking change to `json.cts`              | Low        | Medium | Approach B (dual build) avoids any breaking changes.                             |
| `caniemail.json` data becomes stale        | Medium     | Medium | Add "last updated" indicator. Link to update script.                             |
| Performance on large emails                | Low        | Low    | `caniemail` is already fast (< 50ms for typical emails). Debounce input.         |

---

## Summary

| Question                           | Answer                                                                    |
| ---------------------------------- | ------------------------------------------------------------------------- |
| **Is browser support feasible?**   | ✅ **Yes, absolutely.**                                                   |
| **How much work?**                 | ~1 week for browser build, ~3 weeks for playground MVP                    |
| **Any hard blockers?**             | One: `require()` in `json.cts`. Easy to fix.                              |
| **Are dependencies browser-safe?** | ✅ All 10 dependencies are pure JS, zero Node.js APIs.                    |
| **Estimated bundle size?**         | ~116 KB gzipped (library + data + deps). Very reasonable.                 |
| **Best approach?**                 | Dual build (Approach B): keep Node.js build, add browser bundle via tsup. |
| **Best playground architecture?**  | Static SPA: everything runs client-side, deploy to GitHub Pages for free. |
| **Breaking changes needed?**       | **None** — browser support is additive.                                   |
