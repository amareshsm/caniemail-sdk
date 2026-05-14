# caniemail-sdk ChangeLog

## v1.0.1

_2026-05-14_

### Bug fixes

- **CSS property matching** — corrected `getMatchingPropertyTitles` in `src/css-titles.ts` to use exact array membership instead of JS's string-coercion-based `Array.prototype.includes` fallback. The previous behavior was inherited from upstream and caused two classes of incorrect results:
  - **False positives**: `line-height` was incorrectly matched against the "height property" feature; `font-weight` matched "font shorthand"; `padding-left` matched "padding"; `border-top-width` matched both "border" and "width property"; etc.
  - **False negatives**: `left`, `right`, `top`, `bottom` properties were silently undetected because the upstream's intentional `'left, right, top, bottom': ['left', 'right', 'top', 'bottom']` mapping was effectively dead code under the buggy comparator.

### Behavior changes (for consumers upgrading from 1.0.0)

- Some emails will report **fewer warnings** on sub-properties (`line-height`, `max-width`, `font-weight`, `padding-left`, `border-top-width`, etc.) — these were false positives.
- Some emails will report **new warnings** on `left`/`right`/`top`/`bottom` properties — these were previously missed.
- `canIEmailScore()` results may shift by a few percentage points for emails using positioning or sub-property declarations. Internal `FIXTURE_PERFECT_TABLE_EMAIL` test fixture moved from A (~91%) to B (~88.5%) as a result.

## v1.0.0

_2026-05-14_

### Initial release

`caniemail-sdk` is a fresh package — a fork and successor of [shellscape/caniemail](https://github.com/shellscape/caniemail). Email compatibility data is sourced from [caniemail.com](https://www.caniemail.com/).

### Features

- **HTML/CSS compatibility checking** — `caniemail()` lints email markup against feature support data for 32+ email clients
- **Browser + Node.js support** — dual ESM + IIFE builds; works in Node.js (≥20.19.0), modern bundlers (Vite, webpack, esbuild), and `<script>` CDN tags with JSON data inlined into the bundle
- **`canIEmailScore()`** — weighted compatibility scoring producing a 0–100% score with letter grade (A+→F), per-client breakdowns, feature severity classification, usage multiplier, and partial-only dampening
- **Scoring presets** — `global`, `enterprise`, `consumer`, `mobile-first` audience profiles
- **Interactive playground** — React + Vite app for live email compatibility testing with client preset filters, theme support, and real-time linting

### Requirements

- Node.js ≥20.19.0
- Any modern browser (ES2020+); no polyfills needed

---

## Pre-rename history (as `caniemail` / `caniemail-tool`)

Earlier releases under the previous package names are preserved here for transparency. The data and core API remained compatible across the rename to `caniemail-sdk`.

- Data updates from caniemail.com (upstream sync)
- Initial fork from [useparcel/caniemail](https://github.com/useparcel/caniemail)
