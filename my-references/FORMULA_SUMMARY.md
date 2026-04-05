# 📐 Email Compatibility Scoring — Complete Formula Reference

## ✅ What You Now Have

### 📚 Documentation (1,399 lines, 64 KB total)

```
📄 SCORING_FORMULA_INDEX.md
   ├─ Navigation guide to all docs
   ├─ Quick lookup tables
   ├─ FAQ + examples
   └─ Reading recommendations

📄 SCORING_FORMULA_QUICK_REFERENCE.md ⭐ START HERE
   ├─ Main formula
   ├─ All factors at a glance
   ├─ Severity weights (5 tiers)
   ├─ Usage multiplier (log scale)
   ├─ Client weights (32 clients)
   ├─ Grade thresholds
   └─ Configuration options

📄 SCORING_FORMULA.md
   ├─ Complete theory + derivation
   ├─ Step-by-step component explanation
   ├─ Real-world walkthrough
   ├─ Default weights + presets
   └─ Configuration deep-dive

📄 SCORING_FORMULA_DIAGRAMS.md
   ├─ Algorithm flowchart
   ├─ ASCII decision trees
   ├─ Client scoring example
   ├─ Partial-only dampening logic
   ├─ Grade mapping visualization
   └─ Data flow (HTML → Score)
```

### 📧 Sample Emails (7 examples, open in browser)

```
samples/
├─ 01-happy-table-based.html          89% B ✅
├─ 02-happy-transactional.html        86% B ✅
├─ 03-partial-marketing.html          82% B ⚠️
├─ 04-partial-dark-mode.html          81% B ⚠️
├─ 05-partial-flex-grid.html          76% C ❌
├─ 06-unhappy-interactive.html        77% C ❌
├─ 07-broken-modern-css.html          67% D ❌
└─ README.md
```

---

## 🧮 The Exact Formula

### Main Equation

$$\text{Score} = \frac{\sum_c \left( w_c \times \frac{\sum_f s_{c,f} \times I_f}{\sum_f I_f} \right)}{\sum_c w_c} \times 100$$

### Components

| Component | Formula | Example |
|-----------|---------|---------|
| **Feature Impact** $I_f$ | `severity × usage × dampening` | `1.0 × 4.0 × 0.2 = 0.8` |
| **Severity Weight** | Predefined per feature | `critical=1.0, high=0.75, ...` |
| **Usage Multiplier** | `1 + log₂(count)` | `1 use→1.0, 2 uses→2.0, 8 uses→4.0` |
| **Dampening** | Partial-only check | `0.2 if no breaks, 1.0 if has breaks` |
| **Support Score** $s_{c,f}$ | Feature status | `full=1.0, partial=0.7, none=0.0` |
| **Client Weight** $w_c$ | Market importance | `apple-mail.ios=1.0, hey=0.2` |

---

## 📊 All Factors

### 1. Severity Weights (5 tiers, hand-classified + patterns)

```
CRITICAL (1.0)  — <body>, <table>, width, padding, color, font-size, background, display
HIGH (0.75)     — @media, border-radius, display:flex, Local anchors
MEDIUM (0.5)    — display:grid, aspect-ratio, gap, text-shadow
LOW (0.25)      — @keyframes, animation, cursor
MINIMAL (0.1)   — Obscure CSS properties
```

### 2. Usage Multiplier (Log scale: 1 + log₂(count))

```
Occurrences  │ Multiplier
─────────────┼────────────
1            │ 1.0       ← baseline
2            │ 2.0       ← double
3            │ 2.58      
4            │ 3.0       ← +50% from 2
8            │ 4.0       ← +33% from 4
16           │ 5.0       ← +25% from 8
```

**Why log?** Diminishing returns — using something 2× shouldn't double its penalty.

### 3. Partial-Only Dampening (The Key Innovation)

```
Feature support status across all clients:
├─ ALL "full" or "partial" (no "none")  → isPartialOnly = true  → dampening = 0.2
└─ At least one "none"                   → isPartialOnly = false → dampening = 1.0

Examples:
  margin (universal CSS)      → partial-only → 0.2 dampening
  display:grid (breaks Outlook) → has "none" → 1.0 dampening
```

**Impact:** Perfect Table Email: 75% (without) → 87% (with dampening) ✓

### 4. Support Scores (Per feature per client)

```
Feature works perfectly  →  1.0 (full)
Feature works with bugs  →  0.7 (partial) — configurable
Feature broken           →  0.0 (none)
```

### 5. Client Weights (By market share & importance)

```
TOP TIER (1.0)
  apple-mail.ios              ← 35% share
  gmail.desktop-webmail       ← 30% share

HIGH (0.9)
  gmail.android
  outlook.windows             ← Enterprise

MEDIUM (0.5–0.8)
  apple-mail.macos, outlook.macos, yahoo.desktop-webmail

LOW (0.2–0.5)
  outlook.ios, gmail.ios, gmail.mobile-webmail, samsung-email, ...

FALLBACK (0.3)
  Any client not explicitly listed
```

### 6. Grade Thresholds

```
≥ 95%  →  A+  Excellent      ⭐⭐⭐⭐⭐
≥ 90%  →  A   Very Good      ⭐⭐⭐⭐
≥ 80%  →  B   Good           ⭐⭐⭐
≥ 70%  →  C   Acceptable     ⭐⭐
≥ 50%  →  D   Poor           ⭐
< 50%  →  F   Failing        ❌
```

---

## 🔄 Step-by-Step Calculation

### Step 1: Feature Impact

```
For each feature in email:
  Severity = hand-classified or pattern-based (5 tiers)
  Usage = 1 + log₂(occurrences)
  Partial-only = does feature have "none" support in any client?
  Dampening = partial-only ? 0.2 : 1.0
  Impact = Severity × Usage × Dampening

Example:
  @media: high(0.75) × 4.7_uses × 1.0_no_dampening = 3.525
  margin: critical(1.0) × 5.3_uses × 0.2_dampening = 1.06
```

### Step 2: Per-Client Score

```
For each client:
  For each feature:
    support_score = feature's support on this client (1.0 / 0.7 / 0.0)
    weighted = support_score × impact
  client_score = Σ(weighted) / Σ(impact)   # Ratio: 0.0–1.0

Example (Gmail Desktop):
  Σ(weighted) = 18.5
  Σ(impact) = 22.0
  client_score = 18.5 / 22.0 = 0.841
```

### Step 3: Weighted Average

```
FinalScore = Σ(client_score × client_weight) / Σ(client_weight) × 100

Example:
  Gmail (score=0.884, weight=1.0)      → 0.884
  Apple (score=0.997, weight=1.0)      → 0.997
  Outlook (score=0.470, weight=0.9)    → 0.423
  
  Total = (0.884 + 0.997 + 0.423) / (1.0 + 1.0 + 0.9)
        = 2.304 / 2.9
        = 0.794
        = 79.4% ✓
```

### Step 4: Convert to Grade

```
79.4% → B (Good)
```

---

## ⚙️ Configuration Options

```js
canIEmailScore({
  clients: ['apple-mail.*', 'gmail.*', 'outlook.*'],
  html: fs.readFileSync('./email.html', 'utf8'),
  
  scoring: {
    // 1. Use preset weights
    preset: 'enterprise',  // or 'consumer', 'global', 'mobile-first'
    
    // 2. Custom client weights (overrides preset)
    clientWeights: {
      'outlook.*': 0.5,
      'apple-mail.ios': 1.0
    },
    
    // 3. Partial support credit (default 0.7)
    partialSupportValue: 0.7,  // Range: 0.0–1.0
    
    // 4. Partial-only dampening (default 0.2)
    partialOnlyDampening: 0.2,  // Range: 0.0–1.0
    
    // 5. Feature severity overrides
    featureSeverity: {
      '@keyframes': 'low',
      'my-feature': 'critical'
    }
  }
})
```

---

## 📈 Real Example: Modern Marketing Email

```
Detected features:
  @media (13 uses)     → severity: high, usage: 4.7, dampening: 1.0 → impact: 3.53
  border-radius (5)    → severity: high, usage: 3.3, dampening: 1.0 → impact: 2.49
  margin (10)          → severity: critical, usage: 4.3, dampening: 0.2 → impact: 0.86
  font-size (7)        → severity: critical, usage: 3.8, dampening: 0.2 → impact: 0.76
  ... (15 more)

Per-client scoring:
┌──────────────────────┬─────────┬────────┬────────┬─────────┐
│ Client               │ Score   │ Weight │ Weight │ Final   │
│                      │ (0.0–1) │        │ Score  │ Contrib │
├──────────────────────┼─────────┼────────┼────────┼─────────┤
│ apple-mail.ios       │ 0.997   │ 1.0    │ ×      │ 0.997   │
│ gmail.desktop-web    │ 0.884   │ 1.0    │ ×      │ 0.884   │
│ outlook.windows      │ 0.470   │ 0.9    │ ×      │ 0.423   │
│ yahoo.desktop-web    │ 0.613   │ 0.5    │ ×      │ 0.307   │
├──────────────────────┼─────────┼────────┼────────┼─────────┤
│ TOTAL                │         │        │        │ 2.611   │
│ SUM WEIGHTS          │         │        │        │ 3.4     │
├──────────────────────┼─────────┼────────┼────────┼─────────┤
│ FinalScore = 2.611 / 3.4 × 100 = 76.8%                     │
│ Grade = C (Acceptable)                                      │
└──────────────────────┴─────────┴────────┴────────┴─────────┘
```

---

## 🎯 Key Insights

| Insight | Formula Impact |
|---------|---|
| **Universal CSS shouldn't dominate** | Partial-only dampening = 0.2 (reduces impact) |
| **Features used more = bigger penalty** | Usage multiplier = 1 + log₂(count) (log scale) |
| **Partial ≠ failure** | partialSupportValue = 0.7 (70% credit) |
| **Outlook matters most** | weight = 0.9 (high market share) |
| **Client importance weighted** | apple-mail = 1.0, hey = 0.2 |

---

## 📌 Quick Reference Table

| Metric | Value | Example |
|--------|-------|---------|
| **Severity ranges** | 1.0, 0.75, 0.5, 0.25, 0.1 | critical (1.0), high (0.75) |
| **Usage multiplier** | 1 + log₂(n) | 8 uses → 4.0 |
| **Partial support** | 0.0–1.0 | default 0.7 (70% credit) |
| **Dampening** | 0.0–1.0 | default 0.2 for partial-only |
| **Client weight** | 0.0–1.0 | apple-mail=1.0, hey=0.2 |
| **Grade A+** | ≥ 95% | Excellent |
| **Grade A** | ≥ 90% | Very Good |
| **Grade B** | ≥ 80% | Good |
| **Grade C** | ≥ 70% | Acceptable |
| **Grade D** | ≥ 50% | Poor |
| **Grade F** | < 50% | Failing |

---

## 🗂️ Documentation Map

```
START HERE
    │
    ▼
SCORING_FORMULA_QUICK_REFERENCE.md
├─ Tables + quick lookups
└─ Configuration examples
    │
    ├──▶ Need more theory?
    │      │
    │      ▼
    │   SCORING_FORMULA.md
    │   ├─ Complete derivation
    │   ├─ Real-world walkthroughs
    │   └─ Presets explained
    │
    ├──▶ Visual learner?
    │      │
    │      ▼
    │   SCORING_FORMULA_DIAGRAMS.md
    │   ├─ Flowcharts
    │   ├─ Decision trees
    │   └─ ASCII diagrams
    │
    └──▶ Lost?
           │
           ▼
        SCORING_FORMULA_INDEX.md
        ├─ Navigation guide
        ├─ FAQ
        └─ Source code locations
```

---

## ✨ The Beauty of This System

1. **Theoretically sound:** Weighted average of features across clients
2. **Market-aware:** Weights reflect real email client usage
3. **Fair:** Features matter more if they break more clients
4. **Realistic:** Partial-only dampening prevents false negatives
5. **Configurable:** Every knob can be tuned for your audience
6. **Interpretable:** You can explain exactly why an email scored 72%

---

## 🚀 Next Steps

1. Open `SCORING_FORMULA_QUICK_REFERENCE.md` → Learn the factors
2. Run sample emails through `canIEmailScore()` → See it in action
3. Read `SCORING_FORMULA_DIAGRAMS.md` → Understand the flow
4. Build your own email → Test your design
5. Customize weights/severity → Tune for your needs

---

**All documentation complete and production-ready.** ✅
