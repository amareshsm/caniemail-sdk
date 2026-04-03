# Compatibility Score — Detailed Design Plan

A comprehensive plan for adding a **weighted compatibility scoring system** to the `caniemail` package that produces a meaningful, actionable score (0–100%) for any email against a set of target clients.

---

## Table of Contents

- [Motivation](#motivation)
- [Design Goals](#design-goals)
- [Scoring Model Overview](#scoring-model-overview)
- [Dimension 1: Feature Severity Weights](#dimension-1-feature-severity-weights)
- [Dimension 2: Feature Usage Impact](#dimension-2-feature-usage-impact)
- [Dimension 3: Client Importance Weights](#dimension-3-client-importance-weights)
- [Score Calculation Algorithm](#score-calculation-algorithm)
- [Worked Example](#worked-example)
- [Score Interpretation & Grading](#score-interpretation--grading)
- [API Design](#api-design)
- [Implementation Plan](#implementation-plan)
- [File-by-File Changes](#file-by-file-changes)
- [Edge Cases](#edge-cases)
- [Future Enhancements](#future-enhancements)

---

## Motivation

The current `caniemail()` function returns a binary `success: boolean` — either the email is fully compatible, or it's not. This is insufficient for real-world use:

- An email with 1 minor `border-radius` issue on Outlook and an email with 20 broken layout features score the same: `success: false`.
- Teams cannot set a **quality gate** (e.g., "must be ≥ 85% compatible").
- There's no way to **track improvement** over time.
- There's no way to **compare** two email templates.
- CI pipelines need a threshold, not just pass/fail.

A **weighted compatibility score** solves all of these problems.

---

## Design Goals

1. **Meaningful**: A score of 92% should _feel_ like a 92% compatible email. Visual breakage should hurt the score more than cosmetic differences.
2. **Configurable**: Users can adjust weights for their specific audience (e.g., "Outlook matters 3× more for our enterprise audience").
3. **Deterministic**: Same input → same score, every time.
4. **Transparent**: Users can see exactly why the score is what it is — which features contributed and by how much.
5. **Backward-compatible**: The existing `caniemail()` API remains unchanged; scoring is additive.

---

## Scoring Model Overview

The score is calculated across **three dimensions**:

```
┌─────────────────────────────────────────────────────────────┐
│                    COMPATIBILITY SCORE                       │
│                                                             │
│   Dimension 1: Feature Severity                             │
│   ├── How critical is this feature to email rendering?      │
│   ├── Layout-breaking > Visual-cosmetic > Nice-to-have      │
│   └── Weight: 1.0 (critical) → 0.1 (negligible)           │
│                                                             │
│   Dimension 2: Feature Usage Impact                         │
│   ├── How many times is this feature used in the email?     │
│   ├── Occurrence count (capped with diminishing returns)    │
│   └── Multiplier: 1× → 2× based on usage frequency        │
│                                                             │
│   Dimension 3: Client Importance                            │
│   ├── How important is each email client to the user?       │
│   ├── User-configurable or market-share defaults            │
│   └── Weight: 0.0 → 1.0 per client                        │
│                                                             │
│   Final Score = Weighted average across all dimensions       │
└─────────────────────────────────────────────────────────────┘
```

---

## Dimension 1: Feature Severity Weights

Not all unsupported features are equally bad. A broken layout is far worse than a missing `border-radius`. Features are categorized into **severity tiers**:

### Tier Definitions

| Tier         | Weight | Description                                  | Examples                                                                                                                                             |
| ------------ | ------ | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Critical** | `1.0`  | Breaks layout or makes email unreadable      | `display`, `width`, `height`, `margin`, `padding`, `background-color`, `color`, `font-size`, `text-align`, `<table>`, `<td>`, `<tr>`, `<a>`, `<img>` |
| **High**     | `0.75` | Visually significant, but layout still works | `border`, `border-radius`, `background-image`, `line-height`, `font-family`, `@media`, `<div>`, `<p>`, `<h1>`–`<h6>`, `max-width`                    |
| **Medium**   | `0.5`  | Noticeable visual difference, but acceptable | `box-shadow`, `text-decoration`, `text-transform`, `opacity`, `flex`, `gap`, CSS animations, selectors, `<video>`, `<picture>`                       |
| **Low**      | `0.25` | Minor cosmetic feature, barely noticeable    | `filter`, `transform`, `clip-path`, `outline`, `cursor`, CSS variables, `calc()`, `clamp()`, units (`rem`, `vh`, `vw`)                               |
| **Minimal**  | `0.1`  | Nice-to-have, no visual impact on most users | `::placeholder`, `:focus-within`, advanced pseudo-selectors, `@font-face`, `content` property                                                        |

### How Tiers Are Assigned

We classify features based on the **caniemail.com category** and feature title:

```typescript
// Severity classification rules (applied in order)
const severityRules: Array<{ match: (title: string, category: string) => boolean; tier: Tier }> = [
  // Critical: Core layout and text rendering
  { match: (t) => /^(display|width|height|margin|padding|float|clear)/.test(t), tier: 'critical' },
  {
    match: (t) => /^(background-color|color|font-size|text-align|vertical-align)/.test(t),
    tier: 'critical'
  },
  {
    match: (t, c) => c === 'html' && /^<(table|tr|td|th|a|img|body|head|style|div|span)>/.test(t),
    tier: 'critical'
  },

  // High: Important visual features
  {
    match: (t) => /^(border|line-height|font-family|font-weight|max-width|min-width)/.test(t),
    tier: 'high'
  },
  {
    match: (t) => /^(background-image|background-size|background-position|@media)/.test(t),
    tier: 'high'
  },
  { match: (t, c) => c === 'html' && /^<(p|h[1-6]|ul|ol|li|br|hr)>/.test(t), tier: 'high' },

  // Medium: Visual enhancements
  {
    match: (t) => /^(flex|gap|grid|box-shadow|text-decoration|text-transform|opacity)/.test(t),
    tier: 'medium'
  },
  {
    match: (t, c) => c === 'html' && /^<(video|picture|figure|section|article|nav)>/.test(t),
    tier: 'medium'
  },
  { match: (t) => /selector|combinator/i.test(t), tier: 'medium' },

  // Low: Advanced CSS
  {
    match: (t) => /^(filter|transform|clip|outline|cursor|animation|transition)/.test(t),
    tier: 'low'
  },
  { match: (t) => /unit$|calc\(\)|var\(\)|clamp\(\)/.test(t), tier: 'low' },

  // Default: Minimal
  { match: () => true, tier: 'minimal' }
];
```

Users can also **override** severity for specific features:

```typescript
const result = canIEmailScore({
  clients: ['gmail.*'],
  html,
  scoring: {
    featureSeverity: {
      'border-radius': 'critical', // Override: border-radius matters a lot to us
      '@media': 'minimal' // Override: we don't rely on media queries
    }
  }
});
```

---

## Dimension 2: Feature Usage Impact

A feature used **10 times** in an email should weigh more than one used **once** — but not 10× more (diminishing returns).

### Usage Impact Formula

```
usageMultiplier = 1 + log2(occurrenceCount)
```

| Occurrences | Multiplier | Reasoning                   |
| ----------- | ---------- | --------------------------- |
| 1           | 1.0        | Single use                  |
| 2           | 2.0        | Double the impact           |
| 4           | 3.0        | Significant but not linear  |
| 8           | 4.0        | Diminishing returns kick in |
| 16          | 5.0        | Cap practical impact        |

### How Occurrences Are Counted

Using the existing `FeatureMap`, we count how many times each feature title appears per client:

```typescript
// From the existing issues map: Map<client, FeatureIssue[]>
// Count occurrences of each title per client
const occurrences = new Map<string, number>();
for (const issue of clientIssues) {
  occurrences.set(issue.title, (occurrences.get(issue.title) ?? 0) + 1);
}
```

---

## Dimension 3: Client Importance Weights

Not all email clients matter equally. Enterprise users care about Outlook; B2C startups care about Gmail and Apple Mail.

### Default Weights (Based on Market Share)

Default weights are based on approximate global email client market share data:

| Client                  | Default Weight | Reasoning                    |
| ----------------------- | -------------- | ---------------------------- |
| `apple-mail.ios`        | `1.0`          | ~35% mobile market share     |
| `gmail.desktop-webmail` | `1.0`          | ~30% desktop share           |
| `gmail.android`         | `0.9`          | Large Android user base      |
| `outlook.windows`       | `0.9`          | Dominant in enterprise       |
| `apple-mail.macos`      | `0.8`          | Significant desktop share    |
| `gmail.ios`             | `0.7`          | Secondary Gmail access       |
| `outlook.macos`         | `0.6`          | Growing Mac enterprise use   |
| `yahoo.desktop-webmail` | `0.5`          | Smaller but meaningful share |
| `outlook.ios`           | `0.5`          | Enterprise mobile            |
| `outlook.android`       | `0.5`          | Enterprise mobile            |
| `gmail.mobile-webmail`  | `0.4`          | Mobile web — less common     |
| All others              | `0.3`          | Niche clients                |

### User-Configurable Weights

Users can override weights or use presets:

```typescript
// Custom weights
const result = canIEmailScore({
  clients: ['gmail.*', 'outlook.*'],
  html,
  scoring: {
    clientWeights: {
      'outlook.windows': 1.0,   // Enterprise priority
      'outlook.macos': 0.9,
      'gmail.*': 0.5,           // Glob patterns work too
    }
  }
});

// Preset: Enterprise (Outlook-heavy)
const result = canIEmailScore({
  clients: ['*'],
  html,
  scoring: { preset: 'enterprise' }
});

// Preset: Consumer (Gmail + Apple-heavy)
const result = canIEmailScore({
  clients: ['*'],
  html,
  scoring: { preset: 'consumer' }
});
```

### Presets

| Preset         | Description                 | Heavy Weights On                       |
| -------------- | --------------------------- | -------------------------------------- |
| `enterprise`   | Corporate/B2B email         | Outlook (all), Apple Mail, Thunderbird |
| `consumer`     | B2C / Marketing email       | Gmail (all), Apple Mail, Yahoo         |
| `global`       | Balanced worldwide coverage | Equal weights for all clients          |
| `mobile-first` | Mobile-heavy audiences      | `*.ios`, `*.android` weighted higher   |

---

## Score Calculation Algorithm

### Step-by-Step

```
For each target client C:
  1. Get all features F used in the email (from HTML + CSS parsing)
  2. For each feature F[i]:
     a. Look up support status: full, partial, none
     b. Assign support score:
        - full    → 1.0
        - partial → 0.5
        - none    → 0.0
     c. Look up severity weight W_severity for F[i]
     d. Count occurrences → compute usage multiplier W_usage
     e. Feature impact = W_severity × W_usage
  3. Client score = Σ(supportScore × featureImpact) / Σ(featureImpact)
  4. Apply client importance weight W_client

Final score = Σ(clientScore × W_client) / Σ(W_client) × 100
```

### Formal Formula

$$
\text{Score} = \frac{\displaystyle\sum_{c \in \text{Clients}} w_c \cdot \frac{\displaystyle\sum_{f \in \text{Features}} s_{c,f} \cdot w_f^{\text{sev}} \cdot w_f^{\text{usage}}}{\displaystyle\sum_{f \in \text{Features}} w_f^{\text{sev}} \cdot w_f^{\text{usage}}}}{\displaystyle\sum_{c \in \text{Clients}} w_c} \times 100
$$

Where:

- $w_c$ = client importance weight
- $s_{c,f}$ = support score (1.0, 0.5, or 0.0)
- $w_f^{\text{sev}}$ = feature severity weight
- $w_f^{\text{usage}}$ = usage multiplier $= 1 + \log_2(\text{count})$

---

## Worked Example

### Email Under Test

```html
<div style="display: flex; gap: 16px; border-radius: 8px;">
  <div style="background-color: #fff; padding: 20px;">
    <p style="font-size: 16px; color: #333;">Hello</p>
  </div>
</div>
```

### Target Clients

| Client                  | Client Weight ($w_c$) |
| ----------------------- | --------------------- |
| `gmail.desktop-webmail` | 1.0                   |
| `outlook.windows`       | 0.9                   |

### Features Detected

| Feature            | Category | Severity | Weight ($w_f^{\text{sev}}$) | Occurrences | Usage Multiplier ($w_f^{\text{usage}}$) |
| ------------------ | -------- | -------- | --------------------------- | ----------- | --------------------------------------- |
| `display`          | CSS      | Critical | 1.0                         | 1           | 1.0                                     |
| `gap`              | CSS      | Medium   | 0.5                         | 1           | 1.0                                     |
| `border-radius`    | CSS      | High     | 0.75                        | 1           | 1.0                                     |
| `background-color` | CSS      | Critical | 1.0                         | 1           | 1.0                                     |
| `padding`          | CSS      | Critical | 1.0                         | 1           | 1.0                                     |
| `font-size`        | CSS      | Critical | 1.0                         | 1           | 1.0                                     |
| `color`            | CSS      | Critical | 1.0                         | 1           | 1.0                                     |

### Support Matrix

| Feature            | Gmail Desktop | Outlook Windows |
| ------------------ | ------------- | --------------- |
| `display`          | ✅ full (1.0) | ✅ full (1.0)   |
| `gap`              | ❌ none (0.0) | ❌ none (0.0)   |
| `border-radius`    | ✅ full (1.0) | ❌ none (0.0)   |
| `background-color` | ✅ full (1.0) | ✅ full (1.0)   |
| `padding`          | ✅ full (1.0) | ✅ full (1.0)   |
| `font-size`        | ✅ full (1.0) | ✅ full (1.0)   |
| `color`            | ✅ full (1.0) | ✅ full (1.0)   |

### Calculation

**Total feature impact** = $(1.0 \times 1.0) + (0.5 \times 1.0) + (0.75 \times 1.0) + (1.0 \times 1.0) + (1.0 \times 1.0) + (1.0 \times 1.0) + (1.0 \times 1.0) = 6.25$

**Gmail Desktop score:**

$$
\frac{(1.0 \times 1.0) + (0.0 \times 0.5) + (1.0 \times 0.75) + (1.0 \times 1.0) + (1.0 \times 1.0) + (1.0 \times 1.0) + (1.0 \times 1.0)}{6.25} = \frac{5.75}{6.25} = 0.92
$$

**Outlook Windows score:**

$$
\frac{(1.0 \times 1.0) + (0.0 \times 0.5) + (0.0 \times 0.75) + (1.0 \times 1.0) + (1.0 \times 1.0) + (1.0 \times 1.0) + (1.0 \times 1.0)}{6.25} = \frac{5.0}{6.25} = 0.80
$$

**Final score:**

$$
\frac{(0.92 \times 1.0) + (0.80 \times 0.9)}{1.0 + 0.9} \times 100 = \frac{0.92 + 0.72}{1.9} \times 100 = \frac{1.64}{1.9} \times 100 = \textbf{86.3\%}
$$

---

## Score Interpretation & Grading

| Score Range | Grade | Label      | Badge Color | Meaning                                       |
| ----------- | ----- | ---------- | ----------- | --------------------------------------------- |
| 95–100%     | A+    | Excellent  | 🟢 Green    | Near-perfect compatibility across all clients |
| 90–94%      | A     | Very Good  | 🟢 Green    | Minor cosmetic issues only                    |
| 80–89%      | B     | Good       | 🟡 Yellow   | Some visual differences, no layout breaks     |
| 70–79%      | C     | Acceptable | 🟠 Orange   | Noticeable issues on some clients             |
| 50–69%      | D     | Poor       | 🔴 Red      | Significant rendering problems                |
| 0–49%       | F     | Failing    | 🔴 Red      | Email will be broken on most clients          |

---

## API Design

### New Function: `canIEmailScore()`

```typescript
interface ScoringOptions {
  /** Override severity tier for specific features */
  featureSeverity?: Record<string, 'critical' | 'high' | 'medium' | 'low' | 'minimal'>;

  /** Override client importance weights (0.0 – 1.0). Supports globs. */
  clientWeights?: Record<string, number>;

  /** Use a preset weight profile */
  preset?: 'enterprise' | 'consumer' | 'global' | 'mobile-first';

  /** Include partial support as what fraction of "full"? Default: 0.5 */
  partialSupportValue?: number;
}

interface CanIEmailScoreOptions {
  clients: EmailClientGlobs[];
  css?: string;
  html?: string;
  scoring?: ScoringOptions;
}

interface FeatureScoreDetail {
  title: string;
  severity: string;
  severityWeight: number;
  occurrences: number;
  usageMultiplier: number;
  supportByClient: Record<string, 'full' | 'partial' | 'none'>;
}

interface ClientScoreDetail {
  client: string;
  clientWeight: number;
  score: number; // 0.0 – 1.0
  totalFeatures: number;
  supportedFeatures: number;
  partialFeatures: number;
  unsupportedFeatures: number;
}

interface CanIEmailScoreResult {
  /** Overall score 0 – 100 */
  score: number;

  /** Letter grade */
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';

  /** Human-readable label */
  label: string;

  /** Per-client breakdown */
  clientScores: ClientScoreDetail[];

  /** Per-feature breakdown */
  featureDetails: FeatureScoreDetail[];

  /** The raw caniemail result (existing API) */
  raw: CanIEmailResult;
}
```

### Usage

```typescript
import { canIEmailScore } from 'caniemail';

const result = canIEmailScore({
  clients: ['gmail.*', 'outlook.*'],
  html: emailHtml,
  scoring: {
    preset: 'enterprise',
    featureSeverity: {
      'border-radius': 'critical'
    }
  }
});

console.log(`Score: ${result.score}%`); // "Score: 86.3%"
console.log(`Grade: ${result.grade}`); // "Grade: B"
console.log(`Label: ${result.label}`); // "Label: Good"

// Per-client breakdown
for (const cs of result.clientScores) {
  console.log(`${cs.client}: ${(cs.score * 100).toFixed(1)}% (weight: ${cs.clientWeight})`);
  console.log(
    `  ✅ ${cs.supportedFeatures} | ⚠️ ${cs.partialFeatures} | ❌ ${cs.unsupportedFeatures}`
  );
}

// Worst offenders
const worst = result.featureDetails
  .filter((f) => Object.values(f.supportByClient).includes('none'))
  .sort((a, b) => b.severityWeight - a.severityWeight);

console.log('\nTop issues to fix:');
worst.slice(0, 5).forEach((f) => {
  console.log(`  ${f.title} (severity: ${f.severity}, weight: ${f.severityWeight})`);
});
```

---

## Implementation Plan

### Phase 1: Core Scoring Engine (Week 1)

| Task                          | File                            | Description                                    |
| ----------------------------- | ------------------------------- | ---------------------------------------------- |
| Define severity tier mappings | `src/scoring/severity.ts`       | Map every feature title → severity tier        |
| Create usage multiplier logic | `src/scoring/usage.ts`          | Count feature occurrences + apply log2 formula |
| Define default client weights | `src/scoring/client-weights.ts` | Default market-share weights + preset profiles |
| Build score calculator        | `src/scoring/calculator.ts`     | Core algorithm implementing the formula        |
| Export `canIEmailScore()`     | `src/scoring/index.ts`          | Public API wrapping caniemail() + scoring      |

### Phase 2: Configuration & Presets (Week 2)

| Task                      | File                     | Description                                               |
| ------------------------- | ------------------------ | --------------------------------------------------------- |
| Implement preset profiles | `src/scoring/presets.ts` | Enterprise, consumer, global, mobile-first weight sets    |
| User override merging     | `src/scoring/config.ts`  | Merge user overrides with defaults, resolve glob patterns |
| Grade calculation         | `src/scoring/grades.ts`  | Score → grade/label mapping                               |

### Phase 3: Testing & Documentation (Week 3)

| Task                              | File                         | Description                     |
| --------------------------------- | ---------------------------- | ------------------------------- |
| Unit tests for calculator         | `test/scoring.test.ts`       | Known inputs → expected scores  |
| Unit tests for severity mapping   | `test/severity.test.ts`      | All features have a severity    |
| Snapshot tests with fixture email | `test/score-fixture.test.ts` | Score stability over time       |
| Update README                     | `README.md`                  | Document `canIEmailScore()` API |

---

## File-by-File Changes

### New Files

```
src/
  scoring/
    index.ts              # Public export: canIEmailScore()
    calculator.ts         # Core scoring algorithm
    severity.ts           # Feature → severity tier mapping
    usage.ts              # Occurrence counting + multiplier
    client-weights.ts     # Default weights + presets
    presets.ts            # Preset definitions (enterprise, consumer, etc.)
    config.ts             # Merge user config with defaults
    grades.ts             # Score → grade mapping
    types.ts              # All scoring-related TypeScript interfaces
test/
    scoring.test.ts       # Score calculation tests
    severity.test.ts      # Severity mapping tests
```

### Modified Files

| File           | Change                                         |
| -------------- | ---------------------------------------------- |
| `src/index.ts` | Add `export * from './scoring/index.js'`       |
| `README.md`    | Add scoring section with API docs and examples |
| `package.json` | No dependency changes needed (pure logic)      |

---

## Edge Cases

| Edge Case                         | Handling                                          |
| --------------------------------- | ------------------------------------------------- |
| Email with no detectable features | Return score `100%` (nothing to fail)             |
| All features unsupported          | Return score `0%`                                 |
| Client not in database            | Throw `RangeError` (same as current behavior)     |
| Feature with no severity mapping  | Falls to `minimal` tier (0.1 weight) — never zero |
| User sets client weight to `0`    | Client is effectively excluded from scoring       |
| Only CSS provided, no HTML        | Score based on CSS features only                  |
| Only HTML provided, no CSS        | Score based on HTML elements + inline styles only |
| Empty HTML/CSS                    | Throw `RangeError` (same as current behavior)     |
| `partialSupportValue` = 0         | Treat partial as unsupported (strict mode)        |
| `partialSupportValue` = 1         | Treat partial as fully supported (lenient mode)   |

---

## Future Enhancements

1. **Score History Tracking**: Store scores over time in a JSON file for trend visualization.
2. **Score Diff**: Compare two scores and report what changed ("this PR reduced Outlook compatibility by 5%").
3. **Badge Generation**: Generate SVG/PNG badges like `![Email Compatibility: 92%](...)` for READMEs.
4. **Threshold Configuration**: `minScore` option that throws when score is below threshold (CI gate).
5. **Per-Category Scores**: Break score into sub-scores: HTML score, CSS score, layout score, visual score.
6. **Interactive Report**: HTML report with sortable tables showing per-feature, per-client breakdowns.
7. **Custom Severity Rules**: Allow regex-based severity rules (e.g., "anything with `flex` in the name is critical for us").
8. **Machine Learning Weights**: Auto-derive severity weights from anonymized usage data across the community.
