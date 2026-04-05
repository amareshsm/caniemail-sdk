# caniemail-tool ChangeLog

## v2.0.0

_2026-04-05_

### Breaking Changes

- Package renamed from `caniemail` to `caniemail-tool`
- Requires Node.js ≥20.19.0

### New Features

- **Browser support** — dual ESM + IIFE builds via tsup; works in Vite, webpack, esbuild, and `<script>` CDN tags with JSON data inlined into bundle
- **`canIEmailScore()`** — weighted compatibility scoring system producing a 0–100% score with letter grade (A+→F), per-client breakdowns, feature severity classification, usage multiplier, and partial-only dampening
- **Scoring presets** — `global`, `enterprise`, `consumer`, `mobile-first` audience profiles
- **Interactive playground** — React + Vite app for live email compatibility testing

### Updates

- `v1.0.1` → `v1.0.5`: caniemail.json data updates (upstream)

## v1.0.0

_2025-04-28_

### Breaking Changes

- feat!: v1.0.0 (#2)

### Updates

- Manual run publish (52d6591)
- readme (356f4b2)
- reset (4917d32)
- test (01d3562)
- github identity (777ed57)
- pull latest tag from npm (e67c9cb)
- Merge branch 'main' of github.com:useparcel/caniemail into main (b497aea)
- fixed git command (d40d5df)
- Update npm-publish.yml (dbd6c85)
- Update npm-publish.yml (1667421)
- Create npm-publish.yml (f20a295)
- init (a937936)
