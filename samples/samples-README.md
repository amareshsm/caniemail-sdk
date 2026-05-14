# 📧 Sample Emails

Standalone HTML files demonstrating different email compatibility scenarios.
Open any file in your browser to preview, then run it through `canIEmailScore` to check the score.

---

## Quick Test

```js
import { readFileSync } from 'fs';
import { canIEmailScore } from 'caniemail-sdk';

const html = readFileSync('./samples/01-happy-table-based.html', 'utf8');

const result = canIEmailScore({
  clients: ['apple-mail.*', 'gmail.*', 'outlook.*', 'yahoo.*'],
  html,
});

console.log(`Score: ${result.score.toFixed(1)}% ${result.grade} — ${result.label}`);

// See what broke
for (const f of result.featureDetails.filter(f => !f.isPartialOnly)) {
  console.log(`  ❌ ${f.title} (${f.severity}) — in ${Object.keys(f.supportByClient).length} clients`);
}
```

---

## Files

| File | Flow | Score | Grade | What it tests |
|------|------|-------|-------|---------------|
| [`01-happy-table-based.html`](./01-happy-table-based.html) | ✅ Happy | ~87% | B | Classic table layout, inline styles, universally safe CSS |
| [`02-happy-transactional.html`](./02-happy-transactional.html) | ✅ Happy | ~86% | B | Minimal transactional email (order confirm, OTP, password reset) |
| [`03-partial-marketing.html`](./03-partial-marketing.html) | ⚠️ Partial | ~79% | C | Marketing email with `@media`, `border-radius`, gradients |
| [`04-partial-dark-mode.html`](./04-partial-dark-mode.html) | ⚠️ Partial | ~79% | C | Dark mode with `prefers-color-scheme`, graceful fallback |
| [`05-partial-flex-grid.html`](./05-partial-flex-grid.html) | ⚠️ Partial | ~74% | C | `display:flex` + `display:grid` layout (breaks in Outlook) |
| [`06-unhappy-interactive.html`](./06-unhappy-interactive.html) | ❌ Unhappy | ~76% | C | CSS-only interactivity: `@keyframes`, `:checked`, radio hack |
| [`07-broken-modern-css.html`](./07-broken-modern-css.html) | ❌ Broken | ~65% | D | Everything modern: `conic-gradient`, `<video>`, `<details>`, `aspect-ratio`, CSS vars |

---

## What the Annotations Mean

Every file has comments explaining **why** each feature causes issues:

```html
<!-- ❌ display:grid — NOT supported in Outlook, Yahoo, Gmail Android -->
<!-- ⚠️ border-radius — stripped by Outlook on Windows (renders as square) -->
<!-- ✅ table-based layout — works in ALL clients including Outlook 2003+ -->
```

| Icon | Meaning |
|------|---------|
| ✅ | Fully supported in all tested clients |
| ⚠️ | Partial — works in some clients, silently ignored/stripped in others |
| ❌ | Error — causes layout breakage in major clients |

---

## Score Breakdown by Email Client

Based on running with `clients: ['apple-mail.*', 'gmail.*', 'outlook.*', 'yahoo.*']`:

### Why Outlook scores so low on modern emails

Outlook on Windows uses **Microsoft Word's rendering engine** (not a browser engine).
It strips: flexbox, grid, animations, gradients, border-radius, CSS variables, `<video>`, `<details>`.

### Why Apple Mail scores high on everything

Apple Mail uses **WebKit**, so it supports nearly all modern CSS including:
`display:flex`, `display:grid`, `@keyframes`, `conic-gradient`, `aspect-ratio`, dark mode.

---

## Preset Scores

Run with different presets to see audience-specific scores:

```js
import { canIEmailScore } from 'caniemail-sdk';

const html = readFileSync('./samples/05-partial-flex-grid.html', 'utf8');

for (const preset of ['global', 'enterprise', 'consumer', 'mobile-first']) {
  const r = canIEmailScore({
    clients: ['apple-mail.*', 'gmail.*', 'outlook.*', 'yahoo.*', 'samsung-email.*'],
    html,
    scoring: { preset },
  });
  console.log(`${preset.padEnd(14)} → ${r.score.toFixed(1)}% ${r.grade}`);
}
```

Expected output:
```
global         → 73.1% C
enterprise     → 72.8% C   ← Outlook-heavy: flex/grid hurts most here
consumer       → 76.1% C   ← Gmail/Apple: flex partially works
mobile-first   → 76.2% C
```

---

## Learning Sequence

Go through the samples in order to understand the degradation curve:

1. **Start with `01`** — understand the "gold standard" table email
2. **Compare with `07`** — see how 22 points are lost by using modern CSS
3. **Study `03` and `04`** — learn how to add modern features safely with fallbacks
4. **Study `05` and `06`** — understand exactly what breaks in Outlook and why
5. **Use `02`** as a template for any system/transactional email you send
