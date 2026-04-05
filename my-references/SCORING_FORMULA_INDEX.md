# 📚 Scoring Formula Documentation Index

## Overview

The caniemail scoring system calculates a **0–100% compatibility score** for email templates, combining:
- **Feature severity** (critical features matter more)
- **Feature usage** (using something multiple times penalizes more, with diminishing returns)
- **Client support** (Outlook's poor CSS support weighted by market share)
- **Partial-only dampening** (universal CSS with minor quirks doesn't dominate the score)

---

## Documentation Files

### 1. **SCORING_FORMULA_QUICK_REFERENCE.md** ⚡ START HERE
**388 lines | ~12 KB**

For when you need **the formula and factors fast**:
- Main formula with components explained
- Severity weights table
- Usage multiplier lookup table
- Client weights (default)
- Grade thresholds
- Configuration parameters
- Real examples

**Use this when:** You need to quickly look up a specific value or formula.

---

### 2. **SCORING_FORMULA.md** 📖 COMPREHENSIVE
**230 lines | ~6.3 KB**

The **complete mathematical derivation**:
- Main formula explained step-by-step
- All 5 components in detail with real examples
- Partial-only dampening explanation with examples
- Client weighting with default values
- Configuration options with descriptions
- Real-world walkthrough (Modern Marketing Email)
- Pre-built presets (enterprise, consumer, global, mobile-first)

**Use this when:** You need to understand the logic and theory behind the scoring.

---

### 3. **SCORING_FORMULA_DIAGRAMS.md** 🎨 VISUAL
**478 lines | ~14 KB**

**Visual flowcharts and ASCII diagrams**:
- Complete algorithm flow (top to bottom)
- Feature impact calculation breakdown
- Client scoring example with detailed walkthrough
- Severity tier decision tree
- Partial-only dampening decision logic
- Usage multiplier graph with log scale explanation
- Client weight hierarchy (by importance)
- Per-client score calculation example
- Grade mapping visualization
- Complete data flow (HTML → Score)
- Configuration knobs and tunable parameters

**Use this when:** You're a visual learner or need to understand the process flow.

---

## Quick Formula

$$\text{Score} = \frac{\sum_c \left( w_c \times \frac{\sum_f s_{c,f} \times I_f}{\sum_f I_f} \right)}{\sum_c w_c} \times 100$$

Where:
- $c$ = client (e.g., `gmail.desktop-webmail`)
- $f$ = feature (e.g., `border-radius`)
- $w_c$ = client weight (0.0–1.0)
- $s_{c,f}$ = support score (1.0 / 0.7 / 0.0)
- $I_f$ = impact = severity × usage multiplier × dampening

---

## Key Factors at a Glance

### Severity Weights
| Tier | Weight | Examples |
|------|--------|----------|
| Critical | 1.0 | `<body>`, `<table>`, `width`, `padding`, `color`, `font-size` |
| High | 0.75 | `@media`, `border-radius`, `display:flex` |
| Medium | 0.5 | `display:grid`, `aspect-ratio`, `gap` |
| Low | 0.25 | `@keyframes`, `animation`, `cursor` |
| Minimal | 0.1 | Obscure CSS |

### Usage Multiplier (Log Scale)
| Uses | Multiplier |
|------|-----------|
| 1 | 1.0 |
| 2 | 2.0 |
| 4 | 3.0 |
| 8 | 4.0 |
| 16 | 5.0 |

### Support Scores
```
Full support:     1.0
Partial support:  0.7 (configurable)
No support:       0.0
```

### Top Client Weights (Default)
```
apple-mail.ios          1.0  ← Highest
gmail.desktop-webmail   1.0  ← Highest
gmail.android           0.9
outlook.windows         0.9
...
hey.desktop-webmail     0.2  ← Lowest
```

### Grade Thresholds
```
≥ 95%  →  A+  Excellent
≥ 90%  →  A   Very Good
≥ 80%  →  B   Good
≥ 70%  →  C   Acceptable
≥ 50%  →  D   Poor
< 50%  →  F   Failing
```

---

## Reading Guide

**If you want to...**

| Goal | Read | Reason |
|------|------|--------|
| Understand the formula in 2 min | QUICK_REFERENCE | Compact tables + examples |
| Learn the complete theory | SCORING_FORMULA | Step-by-step with explanations |
| Visualize the algorithm | DIAGRAMS | Flowcharts + ASCII art |
| Build a custom implementation | All three | Get theory + examples + visual flow |
| Debug a score calculation | DIAGRAMS + FORMULA | Step through the flow with real values |

---

## Example: Perfect Table Email

**File:** `samples/01-happy-table-based.html`

**Calculation highlights:**
```
Features detected: ~16 (mostly partial-only CSS)

@media impact: 0.75 × 1.0 × 1.0 = 0.75 (not partial-only)
margin impact: 1.0 × 5.32 × 0.2 = 1.06 (partial-only, dampened)

Gmail Desktop score:  88.4% (nearly perfect)
Outlook Windows score: 94.0% (tables are king here)
Apple Mail score:     99.7% (native CSS support)

Weighted average: (0.884 + 0.94 + 0.997) / 3 = 0.94 = 94%

But with market-weighted clients → 89.1% B (Good)
```

---

## Configuration Example

```js
canIEmailScore({
  clients: ['outlook.*', 'gmail.*', 'apple-mail.*'],
  html: fs.readFileSync('./email.html', 'utf8'),
  
  scoring: {
    // Use a preset weight profile
    preset: 'enterprise',  // or 'consumer', 'global', 'mobile-first'
    
    // Or override individual clients (overrides preset)
    clientWeights: {
      'outlook.windows': 1.0,
      'gmail.android': 0.8,
      'apple-mail.ios': 0.6
    },
    
    // How much credit for partial support (default 0.7)
    partialSupportValue: 0.7,
    
    // Dampening for "partial-only" features (default 0.2)
    partialOnlyDampening: 0.2,
    
    // Override feature severity
    featureSeverity: {
      '@media': 'high',
      'my-custom-feature': 'critical'
    }
  }
})

// Returns:
// {
//   score: 82.3,
//   grade: 'B',
//   label: 'Good',
//   clientScores: [...],
//   featureDetails: [...],
//   raw: {...}
// }
```

---

## Source Code Locations

The scoring implementation is modular:

| File | Responsibility |
|------|-----------------|
| `src/scoring/types.ts` | Type definitions, severity weights, grade enum |
| `src/scoring/severity.ts` | Feature severity classification (200+ features) |
| `src/scoring/usage.ts` | Occurrence counting, log-scale multiplier |
| `src/scoring/client-weights.ts` | Default client weights (market share) |
| `src/scoring/presets.ts` | 4 pre-built weight profiles |
| `src/scoring/grades.ts` | Score → grade mapping |
| `src/scoring/config.ts` | Config resolution with glob patterns |
| `src/scoring/calculator.ts` | Core scoring algorithm |
| `src/scoring/index.ts` | Public API (`canIEmailScore()`) |

---

## Real-World Examples

### Sample Emails

See `samples/` directory for 7 real emails scoring across the full spectrum:

| Email | Score | Grade | Demonstrates |
|-------|-------|-------|---------------|
| `01-happy-table-based.html` | 89% | B | Gold standard (tables only) |
| `02-happy-transactional.html` | 86% | B | Minimal safe design |
| `03-partial-marketing.html` | 82% | B | Modern CSS with fallback |
| `04-partial-dark-mode.html` | 81% | B | Dark mode with graceful degradation |
| `05-partial-flex-grid.html` | 76% | C | Flexbox/grid (breaks in Outlook) |
| `06-unhappy-interactive.html` | 77% | C | CSS interactivity (Apple Mail only) |
| `07-broken-modern-css.html` | 67% | D | Everything modern (fails in Outlook) |

Open any file in your browser and run through `canIEmailScore()`.

---

## Testing

All scoring modules are tested:
- **82 tests** in `test/scoring.test.ts`
- Severity classification, usage multiplier, grades, presets, dampening, edge cases
- All tests passing ✅

Run with: `pnpm test`

---

## FAQ

**Q: Why is partial-only dampening needed?**
A: caniemail marks universal CSS (`margin`, `padding`, `font-size`) as "partial" because they have minor quirks in some clients. Without dampening, these dominate the score unfairly. Dampening=0.2 means they contribute only 20% of their base impact.

**Q: Why log₂ for usage multiplier?**
A: Linear scaling (2× features = 2× penalty) is too harsh. Log scale gives diminishing returns: each doubling adds only +1 to the multiplier, so going from 8 to 16 uses adds less penalty than 1 to 2 uses.

**Q: Why are client weights based on market share?**
A: Email rendering varies wildly. Outlook (20% share) breaks more CSS than Apple Mail (35% share). Weighting by market share means the score reflects real-world email experience for typical users.

**Q: Can I change the thresholds?**
A: The grade thresholds (A+=95%, etc.) are hardcoded as sensible defaults. If you need different thresholds, we can add configuration — open an issue!

**Q: What about email clients not in the list?**
A: Any client not in `DEFAULT_CLIENT_WEIGHTS` gets weight 0.3 (default fallback). You can override with custom weights.

---

## Contributing

To modify the scoring system:

1. **Change severity weights?** Edit `SEVERITY_WEIGHTS` in `src/scoring/types.ts`
2. **Add/override feature severity?** Add to `EXPLICIT_SEVERITY` in `src/scoring/severity.ts`
3. **Change client weights?** Edit `DEFAULT_CLIENT_WEIGHTS` in `src/scoring/client-weights.ts`
4. **Change grade thresholds?** Edit `GRADE_THRESHOLDS` in `src/scoring/grades.ts`
5. **Add a new preset?** Edit `src/scoring/presets.ts`

Always add tests in `test/scoring.test.ts` and run `pnpm test`.

---

## Next Steps

1. **Read SCORING_FORMULA_QUICK_REFERENCE.md** — Get familiar with factors
2. **Open samples/01-happy-table-based.html** in your browser — See what good looks like
3. **Run through samples/ with `canIEmailScore()`** — Try different configurations
4. **Read SCORING_FORMULA_DIAGRAMS.md** — Understand the flow
5. **Build your own emails** — Test with your HTML

---

**Last updated:** April 4, 2026  
**Status:** ✅ Production ready (111/111 tests passing)
