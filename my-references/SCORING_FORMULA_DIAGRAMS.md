# 📐 Scoring Formula — Visual Diagrams & Flows

## The Complete Algorithm Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Input: Email HTML                              │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
            ┌────────────────────────────────┐
            │  caniemail(html, clients)      │
            │  Extract features from HTML    │
            └────────────────────────┬───────┘
                                     │
                ┌────────────────────┴────────────────────┐
                │ Returns: errors + warnings per client  │
                └────────────────────┬────────────────────┘
                                     │
                ┌────────────────────▼─────────────────────────────────────┐
                │ For each feature:                                        │
                │ 1. Classify severity (5 tiers)                           │
                │ 2. Count occurrences (by position)                       │
                │ 3. Calculate usage multiplier (1 + log₂ count)           │
                │ 4. Check if partial-only (all full/partial?)             │
                │ 5. Apply dampening (0.2 or 1.0)                         │
                │ 6. Calculate impact = sev × usage × damp                 │
                │ 7. Collect support status per client                     │
                └────────────────────┬────────────────────────────────────┘
                                     │
                ┌────────────────────▼─────────────────────────────────────┐
                │ For each client:                                         │
                │ 1. For each feature, map status to score (1.0/0.7/0.0)   │
                │ 2. Calculate: Σ(support × impact) / Σ(impact)            │
                │ 3. Get client score (0.0–1.0)                            │
                │ 4. Apply client weight                                   │
                └────────────────────┬────────────────────────────────────┘
                                     │
                ┌────────────────────▼─────────────────────────────────────┐
                │ Final Step:                                              │
                │ Weighted average = Σ(client_score × weight) / Σ(weights) │
                │ FinalScore = average × 100                               │
                │ Grade = map(score) to A+/A/B/C/D/F                       │
                └────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
                    ┌─────────────────────────────────┐
                    │ Output: {score, grade, details} │
                    └─────────────────────────────────┘
```

---

## Feature Impact Calculation

```
                    FEATURE IMPACT
                    ═════════════════════
                            │
                ┌───────────┼───────────┐
                │           │           │
                ▼           ▼           ▼
            SEVERITY     USAGE         DAMPENING
            ═════════    MULTIPLIER    ═════════════
                         ══════════════════
            1.0          1 use   → 1.0   Partial-only?
            0.75         2 uses  → 2.0   ├─ YES   → 0.2
            0.5          4 uses  → 3.0   └─ NO    → 1.0
            0.25         8 uses  → 4.0
            0.1          16 uses → 5.0
                            │
                ┌───────────┴───────────┐
                │                       │
                ▼                       ▼
            Impact = 1.0 × 4.0 × 0.2 = 0.8
                    (critical)(16 uses)(partial-only)
```

---

## Client Scoring Example: Modern Marketing Email

```
                    EMAIL WITH FEATURES
                    ═════════════════════════════════════════════════════
                    @media (impact 3.53) │ border-radius (impact 2.49)
                    Local anchors (1.5)  │ font-size (0.5) │ ...
                    ═════════════════════════════════════════════════════
                                │
                ┌───────────────┼───────────────┐
                │               │               │
                ▼               ▼               ▼
            GMAIL DESKTOP   OUTLOOK WINDOWS   APPLE MAIL iOS
            ═════════════   ═══════════════   ══════════════
            
            Support:        Support:          Support:
            @media: part.   @media: part.     @media: full
            r-radius: part. r-radius: none    r-radius: full
            anchors: full   anchors: full     anchors: full
            font-sz: part.  font-sz: part.    font-sz: full
                │               │                 │
                ▼               ▼                 ▼
            ClientScore     ClientScore       ClientScore
            = Σ(supp×imp)   = Σ(supp×imp)   = Σ(supp×imp)
            / Σ(imp)        / Σ(imp)        / Σ(imp)
            = 0.88          = 0.47          = 0.997
                │               │                 │
                ├─ Weight: 1.0   ├─ Weight: 0.9   └─ Weight: 1.0
                │               │
                ▼               ▼                 ▼
        Weighted: 0.88 ×  Weighted: 0.47 × Weighted: 0.997 ×
                  1.0 =             0.9 =           1.0 =
                  0.88              0.42            0.997
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
            FinalScore = (0.88 + 0.42 + 0.997) / (1.0 + 0.9 + 1.0)
                       = 2.297 / 2.9
                       = 0.792
                       = 79.2% ✓ (Grade C — Acceptable)
```

---

## Severity Tier Decision Tree

```
                        FEATURE TITLE
                              │
                ┌─────────────┼─────────────┐
                │             │             │
        ┌───►EXPLICIT?    ┌─►PATTERN?  ┌──►DEFAULT
        │   (200+ hand     │   (regex   │   (minimal)
        │    classified)   │    rules)  │
        │                 │            │
        │         YES─┐   │     YES─┐  │
        │            │   │        │ │  │
        └────────────┼───┴────────┼─┴──┘
                     │            │
        ┌────────────▼────────────▼──────────────────────┐
        │ PATTERN MATCHING (in order, first match wins)  │
        ├────────────────────────────────────────────────┤
        │ Title contains: "background|border|color|      │
        │               font|padding|margin|width|       │ ──► CRITICAL (1.0)
        │               height|display|<|>"              │
        ├────────────────────────────────────────────────┤
        │ Title contains: "@media|radius|flex|grid|      │
        │               display|anchor"                  │ ──► HIGH (0.75)
        ├────────────────────────────────────────────────┤
        │ Title contains: "shadow|aspect|gap|transform|  │
        │               opacity"                         │ ──► MEDIUM (0.5)
        ├────────────────────────────────────────────────┤
        │ Title contains: "animation|transition|cursor"  │ ──► LOW (0.25)
        ├────────────────────────────────────────────────┤
        │ Otherwise                                      │ ──► MINIMAL (0.1)
        └────────────────────────────────────────────────┘
```

---

## Partial-Only Dampening Decision

```
                    FEATURE SUPPORT STATUS
                    ACROSS ALL CLIENTS
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
        Client A:       Client B:       Client C:
        "full"          "partial"       "none" ⚠️
            │               │               │
            │   ┌───────────┴───────────┐   │
            │   │                       │   │
            └───▶ ANY "none"?          ◀──┘
                    │      │
                    NO    YES
                    │      │
            ┌───────▼──┬───▼─────────┐
            │          │             │
            ▼          ▼             ▼
        isPartial   isPartial   isPartial
        -Only       -Only       -Only
        = TRUE      = FALSE      = FALSE
            │           │           │
            ▼           ▼           ▼
        Dampening  Dampening   Dampening
        = 0.2      = 1.0       = 1.0
        (reduced)  (full)      (full)
```

**Examples:**
```
Feature: margin
├─ Apple Mail:    partial (works with minor quirks)
├─ Gmail:         partial (minor spacing difference)
├─ Outlook:       partial (renders differently)
└─ Yahoo:         full (complete support)
   → NO "none" → isPartialOnly = true → dampening = 0.2 ✓

Feature: display:grid
├─ Apple Mail:    full
├─ Gmail:         partial (limited grid support)
├─ Outlook:       none ⚠️ (collapses layout)
└─ Yahoo:         none ⚠️ (collapses layout)
   → HAS "none" → isPartialOnly = false → dampening = 1.0 ✓
```

---

## Usage Multiplier: Log Scale with Diminishing Returns

```
             OCCURRENCES vs MULTIPLIER
             ═══════════════════════════════

             5.0 │
                 │         •
             4.5 │        /│\
                 │       / │ \
             4.0 │      •  │  \
                 │     /│  │   •
             3.5 │    / │  │  /│\
                 │   /  │  │ / │ \
             3.0 │  •   │  •  │  \
                 │ /│   │ /│  │   •
             2.5 │/ │   / │ \ │  /│
                 │  │  /  │  \│ / │
             2.0 │  • /   │   │   │
                 │  │/    │   │   │
             1.5 │  │     │   │   │
                 │  │     │   │   │
             1.0 │•─┴─────┴───┴───┴───
                 └─────────────────────────
                 1  2  4  8  16 32
                 Occurrences (log scale)

             Formula: 1 + log₂(count)

             │ Count │ log₂(count) │ Multiplier │
             ├───────┼─────────────┼────────────┤
             │   1   │      0      │    1.0     │ ← baseline
             │   2   │      1      │    2.0     │ ← double impact
             │   4   │      2      │    3.0     │ ← +50% from 2
             │   8   │      3      │    4.0     │ ← +33% from 4
             │  16   │      4      │    5.0     │ ← +25% from 8

             Why log? Each doubling of uses adds 1.0 to multiplier,
             so diminishing returns kick in naturally.
```

---

## Client Weight Hierarchy (Default)

```
                    CLIENT IMPORTANCE
                    ══════════════════════════════════════════

                    Market Share Groups
                    ─────────────────────

┌─────────────────────────────────────────────────────────────────┐
│ TIER 1: Maximum Importance (1.0)                                │
├─────────────────────────────────────────────────────────────────┤
│ • apple-mail.ios ────────────────── 35% combined share          │
│ • gmail.desktop-webmail ────────── 30% combined share           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ TIER 2: High Importance (0.8–0.9)                               │
├─────────────────────────────────────────────────────────────────┤
│ • gmail.android ──────────────── 0.9 (high volume)             │
│ • outlook.windows ───────────── 0.9 (enterprise market)        │
│ • apple-mail.macos ─────────── 0.8 (desktop share)             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ TIER 3: Medium Importance (0.5–0.7)                             │
├─────────────────────────────────────────────────────────────────┤
│ • gmail.ios ────────────────── 0.7 (iOS users)                 │
│ • outlook.windows-mail ────── 0.6 (legacy Outlook)            │
│ • outlook.macos ──────────── 0.6 (Mac Outlook)                 │
│ • yahoo.desktop-webmail ──── 0.5 (smaller base)               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ TIER 4: Low Importance (0.2–0.4)                                │
├─────────────────────────────────────────────────────────────────┤
│ • outlook.ios/android ────── 0.5 (smaller base)               │
│ • gmail.mobile-webmail ───── 0.4 (niche)                      │
│ • samsung-email.android ──── 0.4 (Android users)              │
│ • thunderbird.macos ──────── 0.4 (power users)                │
│ • ... others (orange, aol, etc.) ──── 0.2–0.3                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Per-Client Score Calculation: Detailed Example

```
                    CLIENT: gmail.desktop-webmail
                    ════════════════════════════════════════════

Features in email:
┌────────────────┬──────────┬───────────┬──────────┐
│ Feature        │ Severity │ Usage     │ Dampening│
├────────────────┼──────────┼───────────┼──────────┤
│ @media         │ 0.75     │ 1 + 3.70  │ 1.0      │
│ border-radius  │ 0.75     │ 1 + 2.32  │ 1.0      │
│ margin         │ 1.0      │ 1 + 4.32  │ 0.2      │
│ font-size      │ 1.0      │ 1 + 3.81  │ 0.2      │
│ color          │ 1.0      │ 1 + 3.00  │ 0.2      │
└────────────────┴──────────┴───────────┴──────────┘

Impact = severity × usage × dampening:
┌────────────────┬─────────────────────────────┐
│ @media         │ 0.75 × 4.70 × 1.0 = 3.525   │
│ border-radius  │ 0.75 × 3.32 × 1.0 = 2.491   │
│ margin         │ 1.0 × 5.32 × 0.2 = 1.064    │
│ font-size      │ 1.0 × 4.81 × 0.2 = 0.962    │
│ color          │ 1.0 × 4.00 × 0.2 = 0.800    │
└────────────────┴─────────────────────────────┘

Support on Gmail + support score:
┌────────────────┬──────────┬───────────────────┐
│ Feature        │ Status   │ Score             │
├────────────────┼──────────┼───────────────────┤
│ @media         │ partial  │ 0.7 × 3.525 = 2.468 │
│ border-radius  │ partial  │ 0.7 × 2.491 = 1.744 │
│ margin         │ full     │ 1.0 × 1.064 = 1.064 │
│ font-size      │ full     │ 1.0 × 0.962 = 0.962 │
│ color          │ full     │ 1.0 × 0.800 = 0.800 │
└────────────────┴──────────┴───────────────────┘

ClientScore:
  = sum of (support × impact) / sum of impacts
  = (2.468 + 1.744 + 1.064 + 0.962 + 0.800) / (3.525 + 2.491 + 1.064 + 0.962 + 0.800)
  = 7.038 / 8.842
  = 0.796
  = 79.6% ✓ (Before weighting by client importance)
```

---

## Grade Mapping

```
                       SCORE → GRADE
                       ═════════════════════

    100%│    A+
        │   ╱─ Excellent
        │  ╱
    95% │╱╱─────────────────────────────────────
        │  ╲
        │   ╲   A
    90% │    ╲─ Very Good
        │     ╲
        │      ╲╲────────────────────────────────
        │       ╲
    80% │        ╲ B
        │         ╲─ Good
        │          ╲╲───────────────────────────
        │           ╲
    70% │            ╲ C
        │             ╲─ Acceptable
        │              ╲╲─────────────────────
        │               ╲
    50% │                ╲ D
        │                 ╲─ Poor
        │                  ╲╲────────────────
        │                   ╲
     0% │                    ╲ F
        │                     ╲─ Failing
        └──────────────────────────────────────

Grade lookup: iterate thresholds in order, return first match
```

---

## Complete Data Flow: From HTML to Score

```
HTML Input
    │
    ├─► Parse & detect features
    │       ├─ Errors (unsupported/"none") 
    │       └─ Warnings (partial support)
    │
    ├─► Classify each feature
    │       ├─ Severity (critical/high/medium/low/minimal)
    │       ├─ Occurrences (count by position)
    │       ├─ Usage multiplier (1 + log₂ count)
    │       ├─ Partial-only (check all clients for "none")
    │       └─ Dampening (0.2 or 1.0)
    │
    ├─► Calculate impact
    │       └─ severity × usage × dampening
    │
    ├─► For each client:
    │       ├─ Collect support status (full/partial/none)
    │       ├─ Convert to score (1.0 / 0.7 / 0.0)
    │       ├─ Weighted average: Σ(score × impact) / Σ(impact)
    │       └─ Apply client weight
    │
    ├─► Weighted score average
    │       └─ Σ(clientScore × weight) / Σ(weights) × 100
    │
    ├─► Round to 1 decimal place
    │
    └─► Map to grade (A+/A/B/C/D/F)
            └─ Return {score, grade, label, details}
```

---

## Configuration Knobs (Tunable Parameters)

```
                    SCORING CONFIGURATION
                    ════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│ PRESET PROFILES — Pre-built weight combinations             │
├─────────────────────────────────────────────────────────────┤
│ • enterprise ──────── Outlook-heavy (0.9), Apple reduced    │
│ • consumer ───────── Apple/Gmail-heavy (1.0), Outlook lower│
│ • global ─────────── All clients = 1.0 (no bias)           │
│ • mobile-first ──── iOS/Android-heavy (1.0)                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ PARTIAL SUPPORT VALUE (0.0–1.0, default 0.7)                │
├─────────────────────────────────────────────────────────────┤
│ How much credit does a "partial" feature get?              │
│ • 0.0 ─ Strict: partial = failure                         │
│ • 0.5 ─ Moderate                                           │
│ • 0.7 ─ Default: 70% credit                               │
│ • 1.0 ─ Lenient: partial = full success                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ PARTIAL-ONLY DAMPENING (0.0–1.0, default 0.2)               │
├─────────────────────────────────────────────────────────────┤
│ How much to penalize universal CSS with minor quirks?      │
│ • 0.0 ─ Aggressive: ignore partial-only entirely          │
│ • 0.2 ─ Default: 20% impact for partial-only             │
│ • 0.5 ─ Moderate dampening                               │
│ • 1.0 ─ Disabled: all features equally weighted           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ CLIENT WEIGHTS (custom, glob patterns, default market share)│
├─────────────────────────────────────────────────────────────┤
│ • 'outlook.*' ──────────────── all Outlook versions        │
│ • 'gmail.android' ─────────── specific client             │
│ • 'apple-mail.ios' ───────── specific client              │
│ Values: 0.0 = excluded, 1.0 = maximum importance          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ FEATURE SEVERITY OVERRIDES (custom per-feature)             │
├─────────────────────────────────────────────────────────────┤
│ • my-custom-feature: 'critical'                            │
│ • @keyframes: 'low' (instead of default 'low')            │
│ Overrides hand-classified + pattern-based tiers            │
└─────────────────────────────────────────────────────────────┘
```

---

**For full mathematical derivation and examples, see:**
- `SCORING_FORMULA.md` (comprehensive)
- `SCORING_FORMULA_QUICK_REFERENCE.md` (quick lookup)
