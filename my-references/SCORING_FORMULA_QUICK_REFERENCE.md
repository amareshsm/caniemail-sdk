# 📊 Scoring Formula — Quick Reference Card

## The Main Formula

```
                   Σ_c ( w_c × ClientScore_c )
Score (%) = ─────────────────────────────────── × 100
                      Σ_c w_c
```

---

## Factor Breakdown

### 1️⃣ Feature Impact = Severity × Usage × Dampening

| Component | Formula | Example |
|-----------|---------|---------|
| **Severity** | Predefined tiers | `critical`=1.0, `high`=0.75, `medium`=0.5, `low`=0.25, `minimal`=0.1 |
| **Usage Multiplier** | `1 + log₂(count)` | 1 use → 1.0, 2 uses → 2.0, 4 uses → 3.0, 8 uses → 4.0 |
| **Dampening** | Partial-only check | Full/Partial everywhere → 0.2, Has "none" → 1.0 |
| **Combined** | `sev × usage × damp` | Example: `1.0 × 3.0 × 0.2 = 0.6` |

### 2️⃣ Support Score per Feature per Client

```
Full:    1.0    (feature works perfectly)
Partial: 0.7    (feature works with quirks — configurable)
None:    0.0    (feature broken/unsupported)
```

### 3️⃣ Per-Client Score

```
ClientScore = Σ(support × impact) / Σ(impact)
            = weighted average of all features
            = 0.0 (all broken) to 1.0 (all work)
```

### 4️⃣ Client Weights (Default, Market Share Based)

```
apple-mail.ios          1.0  ← Highest importance
gmail.desktop-webmail   1.0  ← Highest importance
gmail.android           0.9
outlook.windows         0.9
apple-mail.macos        0.8
outlook.windows-mail    0.6
outlook.macos           0.6
...
outlook.ios             0.5
yahoo.desktop-webmail   0.5
gmail.mobile-webmail    0.4
samsung-email.android   0.4
...
Others                  0.3  (default fallback)
```

### 5️⃣ Final Score

```
FinalScore = (sum of client_score × client_weight) / (sum of weights) × 100
           = 0–100%
```

---

## Severity Weights

| Tier | Weight | Examples |
|------|--------|----------|
| 🔴 Critical | 1.0 | `<body>`, `<table>`, `width`, `padding`, `color`, `font-size`, `background` |
| 🟠 High | 0.75 | `@media`, `border-radius`, `display:flex`, `Local anchors` |
| 🟡 Medium | 0.5 | `display:grid`, `aspect-ratio`, `gap`, `text-shadow` |
| 🟢 Low | 0.25 | `@keyframes`, `animation`, `cursor` |
| ⚪ Minimal | 0.1 | Obscure CSS properties |

---

## Usage Multiplier (Log Scale)

| Occurrences | Formula | Result |
|-------------|---------|--------|
| 1 | `1 + log₂(1)` = `1 + 0` | **1.0** |
| 2 | `1 + log₂(2)` = `1 + 1` | **2.0** |
| 3 | `1 + log₂(3)` = `1 + 1.58` | **2.58** |
| 4 | `1 + log₂(4)` = `1 + 2` | **3.0** |
| 8 | `1 + log₂(8)` = `1 + 3` | **4.0** |
| 16 | `1 + log₂(16)` = `1 + 4` | **5.0** |

**Why log?** Diminishing returns — using something twice shouldn't double its penalty.

---

## Partial-Only Dampening

**The key innovation:**

```
Feature has support status across all tested clients:
├─ All "full" or "partial"  → isPartialOnly = true  → dampening = 0.2
└─ At least one "none"      → isPartialOnly = false → dampening = 1.0
```

**Why?** Universal CSS (margin, padding, color, font-size) is marked "partial" by caniemail because it has minor client quirks. Without dampening, these dominate the score.

**Impact:**
```
Without dampening:  Perfect Table Email = 75%
With dampening:     Perfect Table Email = 87%  ✓ Realistic
```

---

## Configurable Parameters

```js
canIEmailScore({
  clients: ['apple-mail.*', 'gmail.*', 'outlook.*'],
  html,
  scoring: {
    partialSupportValue: 0.7,        // 70% credit for partial (0.0–1.0)
    partialOnlyDampening: 0.2,       // 20% impact for partial-only (0.0–1.0)
    preset: 'global',                // or 'enterprise', 'consumer', 'mobile-first'
    clientWeights: { ... },          // Custom weights, glob patterns
    featureSeverity: { ... }         // Custom severity overrides
  }
})
```

---

## Grade Thresholds

```
Score    Grade  Label
≥ 95%    A+     Excellent    ⭐⭐⭐⭐⭐
≥ 90%    A      Very Good    ⭐⭐⭐⭐
≥ 80%    B      Good         ⭐⭐⭐
≥ 70%    C      Acceptable   ⭐⭐
≥ 50%    D      Poor         ⭐
< 50%    F      Failing      ❌
```

---

## Examples

### Example 1: Simple Feature

```
Feature:        border-radius
Severity:       high (0.75)
Occurrences:    5
Usage mult:     1 + log₂(5) = 1 + 2.32 = 3.32
Partial-only:   false (Outlook has "none")
Dampening:      1.0

Impact = 0.75 × 3.32 × 1.0 = 2.49
```

### Example 2: Universal CSS Property

```
Feature:        margin
Severity:       critical (1.0)
Occurrences:    10
Usage mult:     1 + log₂(10) = 1 + 3.32 = 4.32
Partial-only:   true (all clients have full or partial)
Dampening:      0.2

Impact = 1.0 × 4.32 × 0.2 = 0.86
```

### Example 3: Per-Client Score Calculation

```
Client:         gmail.desktop-webmail
Weight:         1.0
Features:
  border-radius (impact 2.49): partial (0.7) → 0.7 × 2.49 = 1.74
  margin (impact 0.86):        full (1.0)   → 1.0 × 0.86 = 0.86
  @media (impact 3.53):        partial (0.7) → 0.7 × 3.53 = 2.47
  ... (10 more features)

ClientScore = (1.74 + 0.86 + 2.47 + ...) / (2.49 + 0.86 + 3.53 + ...)
            = 18.5 / 22.0
            = 0.841
            = 84.1% (after client score calculation)
```

---

## Workflow

```
1. Run caniemail(html) → extract errors + warnings
2. For each feature:
   a. Get severity (hand-classified or pattern-based)
   b. Count occurrences (deduplicated by position)
   c. Calc usage multiplier (log scale)
   d. Check partial-only (has "none" in any client?)
   e. Apply dampening (0.2 if partial-only, else 1.0)
   f. Combine → Impact
3. For each client:
   a. For each feature: get support status (full/partial/none)
   b. Calc support score (1.0 / 0.7 / 0.0)
   c. Weighted sum: Σ(support × impact) / Σ(impact)
4. Weight client scores by importance
5. Final average × 100 = Score%
6. Map to grade (A+/A/B/C/D/F)
```

---

## Key Insights

| Insight | Formula Impact |
|---------|---|
| Features used multiple times penalize more (log scale) | `1 + log₂(count)` |
| Universal CSS shouldn't dominate score | `partialOnlyDampening = 0.2` |
| Partial support ≠ full failure | `partialSupportValue = 0.7` (configurable) |
| Outlook matters more than niche clients | `outlook.windows = 0.9`, `hey.desktop-webmail = 0.2` |
| Client importance weighted by market share | `apple-mail = 1.0`, `orange = 0.3` |

---

## Full Reference

For complete details, formulas, and examples, see: **`SCORING_FORMULA.md`**

```iconicon
      <div className="no-results">
                    <div className="no-results-icon">📭</div>
                    <p style={{ fontSize: '14px', marginBottom: '8px' }}>No results yet</p>
                    <p style={{ fontSize: '13px', opacity: 0.7 }}>
                      Paste HTML code and select clients to see compatibility scores
                    </p>
                  </div>
```