# CLI Tool — Feature & Design Plan

A comprehensive plan for building a command-line interface for the `caniemail` package, enabling email compatibility checks directly from the terminal, CI/CD pipelines, and developer workflows.

---

## Table of Contents

- [Motivation](#motivation)
- [Design Principles](#design-principles)
- [Installation & Invocation](#installation--invocation)
- [Command Overview](#command-overview)
- [Command: `check`](#command-check)
- [Command: `score`](#command-score)
- [Command: `list-clients`](#command-list-clients)
- [Command: `list-features`](#command-list-features)
- [Command: `diff`](#command-diff)
- [Output Formats](#output-formats)
- [Configuration File](#configuration-file)
- [Exit Codes](#exit-codes)
- [Color & UX Design](#color--ux-design)
- [CI/CD Integration Examples](#cicd-integration-examples)
- [Implementation Plan](#implementation-plan)
- [Dependency Choices](#dependency-choices)
- [File Structure](#file-structure)
- [Future Features](#future-features)

---

## Motivation

The current `caniemail` package is **library-only** — you must write TypeScript/JavaScript code to use it. This limits its adoption to:

- ❌ Designers who build emails but don't write Node scripts
- ❌ CI/CD pipelines that want a simple one-liner
- ❌ Pre-commit hooks for quick validation
- ❌ Teams who want to run spot-checks without a project setup
- ❌ Comparison/auditing workflows across multiple email files

A CLI unlocks all of these use cases with zero code.

---

## Design Principles

1. **Zero config by default**: `caniemail check email.html` should work with sensible defaults.
2. **Progressive disclosure**: Simple commands for beginners, rich flags for power users.
3. **Pipe-friendly**: JSON output, proper exit codes, stderr for errors, stdout for results.
4. **Beautiful terminal output**: Colors, tables, progress indicators — but gracefully degrade in non-TTY environments.
5. **Fast**: No startup penalty. Check a file in under 200ms.

---

## Installation & Invocation

```bash
# Install globally
npm install -g caniemail

# Or use directly with npx (no install)
npx caniemail check email.html

# Or as a project dev dependency
pnpm add -D caniemail
pnpm caniemail check email.html
```

**Binary name:** `caniemail`

---

## Command Overview

```
caniemail <command> [options]

Commands:
  check           Check an HTML/CSS file for email client compatibility
  score           Get a weighted compatibility score for an email
  list-clients    List all supported email clients
  list-features   List all tracked features and their support status
  diff            Compare compatibility between two email files

Options:
  --help, -h      Show help
  --version, -v   Show version number
```

---

## Command: `check`

The primary command. Checks an email file for compatibility issues.

### Syntax

```
caniemail check <file> [options]
```

### Arguments

| Argument | Description                                     | Required |
| -------- | ----------------------------------------------- | -------- |
| `<file>` | Path to an HTML or CSS file. Use `-` for stdin. | Yes      |

### Options

| Flag                   | Short | Description                                                 | Default          |
| ---------------------- | ----- | ----------------------------------------------------------- | ---------------- |
| `--clients <glob,...>` | `-c`  | Comma-separated client globs                                | `*` (all)        |
| `--format <format>`    | `-f`  | Output format: `pretty`, `json`, `sarif`, `markdown`, `csv` | `pretty`         |
| `--fail-on <level>`    |       | Exit 1 on: `error`, `warning`, `none`                       | `error`          |
| `--css <file>`         |       | Additional CSS file to check alongside HTML                 |                  |
| `--no-color`           |       | Disable colored output                                      |                  |
| `--quiet`              | `-q`  | Only output errors, suppress warnings and info              |                  |
| `--max-issues <n>`     |       | Maximum issues to display                                   | `50`             |
| `--group-by <mode>`    |       | Group results by: `client`, `feature`, `position`           | `client`         |
| `--config <file>`      |       | Path to config file                                         | `.caniemailrc.*` |

### Examples

```bash
# Basic: Check an email against all clients
caniemail check email.html

# Check against specific clients
caniemail check email.html --clients "gmail.*,outlook.*"

# Check standalone CSS
caniemail check styles.css --clients "outlook.windows"

# Check HTML + external CSS
caniemail check email.html --css styles.css --clients "gmail.*"

# JSON output for CI
caniemail check email.html --format json --clients "*"

# Read from stdin (pipe from another tool)
cat email.html | caniemail check - --clients "gmail.*"

# Fail CI on any warning too
caniemail check email.html --fail-on warning

# Quiet mode — just exit code
caniemail check email.html --quiet
```

### Sample Pretty Output

```
  caniemail — Email Compatibility Check

  📄 File:     email.html
  🎯 Clients:  gmail.*, outlook.*  (12 clients matched)
  ⏱  Time:     42ms

  ❌ ERRORS (7 issues across 3 clients)
  ──────────────────────────────────────────────────────────

  outlook.windows (5 issues)
  │
  ├─ 15:5   display: flex              not supported
  ├─ 15:5   flex                       not supported
  ├─ 16:5   gap                        not supported
  ├─ 23:5   border-radius              not supported
  └─ 41:3   flex-direction             not supported

  outlook.windows-mail (2 issues)
  │
  ├─ 23:5   border-radius              not supported
  └─ 41:3   flex-direction             not supported

  ⚠️  WARNINGS (3 issues across 2 clients)
  ──────────────────────────────────────────────────────────

  gmail.desktop-webmail (2 issues)
  │
  ├─ 38:3   @media                     partial support
  │         ↳ Note: Only supports min-width and max-width
  └─ 12:3   background-color           partial support

  gmail.mobile-webmail (1 issue)
  │
  └─ 8:3    Class selector             not supported

  ──────────────────────────────────────────────────────────
  Result:  ❌ FAIL  (7 errors, 3 warnings)
```

---

## Command: `score`

Get a weighted compatibility score (depends on the scoring feature from the compatibility-score-plan).

### Syntax

```
caniemail score <file> [options]
```

### Options

All `check` options plus:

| Flag              | Short | Description                                                        | Default  |
| ----------------- | ----- | ------------------------------------------------------------------ | -------- |
| `--preset <name>` | `-p`  | Scoring preset: `enterprise`, `consumer`, `global`, `mobile-first` | `global` |
| `--min-score <n>` |       | Minimum acceptable score (exit 1 if below)                         |          |
| `--breakdown`     | `-b`  | Show per-client and per-feature breakdown                          | `false`  |

### Examples

```bash
# Quick score
caniemail score email.html --clients "gmail.*,outlook.*"

# Enterprise preset with threshold
caniemail score email.html --preset enterprise --min-score 85

# Detailed breakdown
caniemail score email.html --clients "*" --breakdown
```

### Sample Pretty Output

```
  caniemail — Compatibility Score

  📄 File:     email.html
  🎯 Clients:  gmail.*, outlook.*  (12 clients matched)
  📊 Preset:   enterprise

  ┌────────────────────────────────────────┐
  │                                        │
  │          Score: 86.3%  [B]             │
  │          ████████████████░░░░           │
  │          Good Compatibility             │
  │                                        │
  └────────────────────────────────────────┘

  Per-Client Breakdown:
  ───────────────────────────────────────────────────
  Client                     Score   Weight   Issues
  ───────────────────────────────────────────────────
  apple-mail.macos           100.0%  ×0.8     0
  apple-mail.ios             100.0%  ×1.0     0
  gmail.desktop-webmail       96.2%  ×1.0     1 warn
  gmail.ios                   96.2%  ×0.7     1 warn
  gmail.android               98.1%  ×0.9     0
  gmail.mobile-webmail        82.4%  ×0.4     3
  outlook.windows             72.0%  ×0.9     5
  outlook.windows-mail        85.5%  ×0.5     2
  outlook.macos               98.1%  ×0.6     0
  outlook.ios                 96.2%  ×0.5     1 warn
  outlook.android             96.2%  ×0.5     1 warn
  ───────────────────────────────────────────────────

  Top Issues to Fix (highest impact):
  ───────────────────────────────────────────────────
  1. display: flex        (critical) → +8.2% if fixed
  2. gap                  (medium)   → +3.1% if fixed
  3. border-radius        (high)     → +2.8% if fixed
  4. flex-direction       (medium)   → +1.5% if fixed
  ───────────────────────────────────────────────────
```

---

## Command: `list-clients`

List all supported email clients. Helpful for discovering valid client names.

### Syntax

```
caniemail list-clients [options]
```

### Options

| Flag                | Short | Description                            | Default  |
| ------------------- | ----- | -------------------------------------- | -------- |
| `--format <format>` | `-f`  | Output format: `pretty`, `json`, `csv` | `pretty` |
| `--filter <glob>`   |       | Filter clients by glob pattern         |          |

### Examples

```bash
# List all clients
caniemail list-clients

# List only Gmail clients
caniemail list-clients --filter "gmail.*"

# List all iOS clients
caniemail list-clients --filter "*.ios"

# JSON for scripting
caniemail list-clients --format json
```

### Sample Pretty Output

```
  caniemail — Supported Email Clients (33 total)

  Provider         Platform(s)
  ────────────────────────────────────────────
  apple-mail       macos, ios
  gmail            desktop-webmail, ios, android, mobile-webmail
  orange           desktop-webmail, ios, android
  outlook          windows, windows-mail, macos, ios, android
  yahoo            desktop-webmail, ios, android
  aol              desktop-webmail, ios, android
  samsung-email    android
  sfr              desktop-webmail, ios, android
  thunderbird      macos
  protonmail       desktop-webmail, ios, android
  hey              desktop-webmail
  mail-ru          desktop-webmail
  fastmail         desktop-webmail
  laposte          desktop-webmail

  Use glob patterns: "gmail.*", "*.ios", "outlook.windows"
```

---

## Command: `list-features`

List all tracked features and optionally show support status for specific clients.

### Syntax

```
caniemail list-features [options]
```

### Options

| Flag                   | Short | Description                            | Default  |
| ---------------------- | ----- | -------------------------------------- | -------- |
| `--format <format>`    | `-f`  | Output format: `pretty`, `json`, `csv` | `pretty` |
| `--clients <glob,...>` | `-c`  | Show support status for these clients  |          |
| `--category <cat>`     |       | Filter by category: `html`, `css`      |          |
| `--search <query>`     | `-s`  | Search features by title or keyword    |          |
| `--supported`          |       | Only show supported features           |          |
| `--unsupported`        |       | Only show unsupported features         |          |

### Examples

```bash
# List all features
caniemail list-features

# Search for flex-related features
caniemail list-features --search "flex"

# Show CSS features with support status for Outlook
caniemail list-features --category css --clients "outlook.windows"

# Only unsupported features in Gmail
caniemail list-features --clients "gmail.desktop-webmail" --unsupported
```

### Sample Pretty Output

```
  caniemail — Features (searching: "flex")

  Feature               Category  gmail.desktop  outlook.win
  ─────────────────────────────────────────────────────────
  display: flex         CSS       ✅ full        ❌ none
  flex-direction        CSS       ✅ full        ❌ none
  flex-wrap             CSS       ✅ full        ❌ none
  flex                  CSS       ✅ full        ❌ none

  4 features found
```

---

## Command: `diff`

Compare compatibility between two email files or two versions of the same file. Ideal for PR reviews.

### Syntax

```
caniemail diff <file-a> <file-b> [options]
```

### Options

| Flag                   | Short | Description                                 | Default  |
| ---------------------- | ----- | ------------------------------------------- | -------- |
| `--clients <glob,...>` | `-c`  | Comma-separated client globs                | `*`      |
| `--format <format>`    | `-f`  | Output format: `pretty`, `json`, `markdown` | `pretty` |

### Examples

```bash
# Compare old vs new email
caniemail diff email-v1.html email-v2.html --clients "gmail.*,outlook.*"

# Markdown output for PR comments
caniemail diff old.html new.html --format markdown
```

### Sample Pretty Output

```
  caniemail — Compatibility Diff

  📄 File A: email-v1.html
  📄 File B: email-v2.html
  🎯 Clients: gmail.*, outlook.*

  Changes:
  ─────────────────────────────────────────────────────────

  ✅ FIXED (3 issues resolved)
  │
  ├─ display: flex            (was error on outlook.windows)
  ├─ gap                      (was error on outlook.windows)
  └─ border-radius            (was error on outlook.windows)

  🆕 NEW ISSUES (1 issue introduced)
  │
  └─ rem unit                 (error on outlook.windows)

  📊 UNCHANGED (2 issues)
  │
  ├─ @media                   (warning on gmail.desktop-webmail)
  └─ Class selector           (error on gmail.mobile-webmail)

  Summary: Net improvement: +2 issues resolved
  Score:   82.1% → 87.5%  (+5.4%)  📈
```

---

## Output Formats

### `pretty` (default)

Human-readable, colored terminal output with tables and tree views. Automatically simplified when piped (non-TTY).

### `json`

Machine-readable JSON. Includes all data for programmatic consumption.

```json
{
  "file": "email.html",
  "clients": ["gmail.desktop-webmail", "outlook.windows"],
  "success": false,
  "errors": [
    {
      "client": "outlook.windows",
      "title": "display: flex",
      "support": "none",
      "position": { "start": { "line": 15, "column": 5 }, "end": { "line": 15, "column": 20 } },
      "notes": []
    }
  ],
  "warnings": [],
  "summary": {
    "totalErrors": 5,
    "totalWarnings": 2,
    "clientsChecked": 2,
    "featuresChecked": 18,
    "timeMs": 42
  }
}
```

### `sarif`

[SARIF](https://sarifweb.azurewebsites.net/) format for integration with GitHub Code Scanning, VS Code SARIF Viewer, and other security/quality tools.

```bash
caniemail check email.html --format sarif > results.sarif
```

### `markdown`

Markdown table output, ideal for pasting into PR descriptions or issues.

```markdown
## Email Compatibility Report

| Feature       | outlook.windows  | gmail.desktop-webmail |
| ------------- | ---------------- | --------------------- |
| display: flex | ❌ Not supported | ✅ Supported          |
| gap           | ❌ Not supported | ❌ Not supported      |
| border-radius | ❌ Not supported | ✅ Supported          |
| @media        | ✅ Supported     | ⚠️ Partial            |

**Result:** 5 errors, 2 warnings
```

### `csv`

CSV output for spreadsheet analysis.

```csv
client,feature,support,severity,line,column
outlook.windows,display: flex,none,critical,15,5
outlook.windows,gap,none,medium,16,5
```

---

## Configuration File

Support a configuration file for shared team settings. Auto-detected in this order:

1. `--config <path>` flag
2. `.caniemailrc.json`
3. `.caniemailrc.yml` / `.caniemailrc.yaml`
4. `caniemail.config.js` / `caniemail.config.ts`
5. `caniemail` key in `package.json`

### Example `.caniemailrc.json`

```json
{
  "clients": ["gmail.*", "outlook.*", "apple-mail.*"],
  "failOn": "error",
  "format": "pretty",
  "maxIssues": 100,
  "groupBy": "client",
  "scoring": {
    "preset": "enterprise",
    "minScore": 85,
    "featureSeverity": {
      "border-radius": "low"
    },
    "clientWeights": {
      "outlook.windows": 1.0,
      "gmail.*": 0.8
    }
  }
}
```

### Example in `package.json`

```json
{
  "caniemail-tool": {
    "clients": ["gmail.*", "outlook.*"],
    "failOn": "error"
  }
}
```

---

## Exit Codes

| Code | Meaning                                                  |
| ---- | -------------------------------------------------------- |
| `0`  | Success — no issues at the configured `failOn` level     |
| `1`  | Failure — issues found at or above `failOn` level        |
| `2`  | Configuration error (invalid config, missing file, etc.) |
| `3`  | Invalid arguments or unknown command                     |

---

## Color & UX Design

### Color Palette

| Element  | Color              | Usage                            |
| -------- | ------------------ | -------------------------------- |
| Errors   | Red (`#EF4444`)    | Unsupported features             |
| Warnings | Yellow (`#F59E0B`) | Partially supported features     |
| Success  | Green (`#10B981`)  | Fully supported, pass messages   |
| Info     | Blue (`#3B82F6`)   | File names, client names         |
| Dim      | Gray (`#6B7280`)   | Secondary info, notes, positions |

### Symbols

| Symbol | Meaning               |
| ------ | --------------------- |
| ❌     | Error / Not supported |
| ⚠️     | Warning / Partial     |
| ✅     | Supported / Pass      |
| 📄     | File                  |
| 🎯     | Clients               |
| 📊     | Score / Stats         |
| ⏱     | Timing                |
| 📈     | Improvement           |
| 📉     | Regression            |

### Non-TTY Mode

When output is piped (not a terminal), automatically:

- Disable colors
- Disable Unicode symbols (use ASCII: `[x]`, `[!]`, `[v]`)
- Suppress progress/spinners
- Use plain text tables

---

## CI/CD Integration Examples

### GitHub Actions

```yaml
name: Email Compatibility Check
on: [push, pull_request]

jobs:
  check-email:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install -g caniemail

      # Basic check
      - name: Check email compatibility
        run: caniemail check ./emails/welcome.html --clients "gmail.*,outlook.*"

      # Score with threshold
      - name: Score check
        run: caniemail score ./emails/welcome.html --min-score 85 --preset enterprise

      # PR comment with diff
      - name: Diff against main
        if: github.event_name == 'pull_request'
        run: |
          git show origin/main:emails/welcome.html > /tmp/old-email.html
          caniemail diff /tmp/old-email.html ./emails/welcome.html --format markdown >> $GITHUB_STEP_SUMMARY

      # Upload SARIF to GitHub Code Scanning
      - name: Generate SARIF
        run: caniemail check ./emails/welcome.html --format sarif > results.sarif
      - uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: results.sarif
```

### Pre-commit Hook

```bash
# .husky/pre-commit
#!/bin/sh
caniemail check ./src/emails/*.html --clients "gmail.*,outlook.*" --quiet
```

### GitLab CI

```yaml
email-check:
  script:
    - npx caniemail check ./emails/newsletter.html --format json > report.json
    - npx caniemail score ./emails/newsletter.html --min-score 80
  artifacts:
    reports:
      codequality: report.json
```

---

## Implementation Plan

### Phase 1: Core CLI Framework (Week 1)

| Task                         | Description                                             |
| ---------------------------- | ------------------------------------------------------- |
| Set up CLI entry point       | Binary, arg parsing, help text                          |
| Implement `check` command    | Core flow: read file → call caniemail() → format output |
| Implement `pretty` formatter | Colored tree-view output                                |
| Implement `json` formatter   | Structured JSON output                                  |
| Add stdin support            | Read from `-` (pipe)                                    |
| Set up exit codes            | Proper exit code handling                               |

### Phase 2: Additional Commands (Week 2)

| Task                              | Description                                 |
| --------------------------------- | ------------------------------------------- |
| Implement `list-clients` command  | List + filter clients                       |
| Implement `list-features` command | List + search features with support status  |
| Implement `score` command         | Wrap canIEmailScore() with CLI              |
| Add config file loading           | Support `.caniemailrc.*` and `package.json` |

### Phase 3: Advanced Features (Week 3)

| Task                           | Description                         |
| ------------------------------ | ----------------------------------- |
| Implement `diff` command       | Two-file comparison                 |
| Implement `sarif` formatter    | SARIF output for GitHub integration |
| Implement `markdown` formatter | Table output for PRs                |
| Implement `csv` formatter      | Spreadsheet output                  |
| Add non-TTY detection          | Graceful degradation                |

### Phase 4: Testing & Polish (Week 4)

| Task                        | Description                                       |
| --------------------------- | ------------------------------------------------- |
| CLI integration tests       | Snapshot test all commands + formats              |
| Error handling & edge cases | Missing files, invalid globs, empty input         |
| Performance optimization    | Lazy-load data, fast startup                      |
| Documentation               | README, man page, `--help` text for every command |

---

## Dependency Choices

| Dependency                                                 | Purpose             | Why This One                              |
| ---------------------------------------------------------- | ------------------- | ----------------------------------------- |
| [citty](https://github.com/unjs/citty)                     | CLI framework       | Lightweight, ESM-native, TypeScript-first |
| [consola](https://github.com/unjs/consola)                 | Logging             | Pretty output, non-TTY fallback           |
| [cli-table3](https://github.com/cli-table/cli-table3)      | Table rendering     | Feature-rich, well-maintained             |
| [picocolors](https://github.com/alexeyraspopov/picocolors) | Terminal colors     | Tiny, fast, already common in ecosystem   |
| [cosmiconfig](https://github.com/cosmiconfig/cosmiconfig)  | Config file loading | Industry standard for RC file resolution  |
| [globby](https://github.com/sindresorhus/globby)           | File globbing       | For multi-file checks                     |

All dependencies are chosen to be **small, ESM-compatible, and well-maintained**.

---

## File Structure

```
src/
  cli/
    index.ts              # Entry point, command routing
    commands/
      check.ts            # check command implementation
      score.ts            # score command implementation
      list-clients.ts     # list-clients command
      list-features.ts    # list-features command
      diff.ts             # diff command
    formatters/
      pretty.ts           # Human-readable terminal output
      json.ts             # JSON formatter
      sarif.ts            # SARIF formatter
      markdown.ts         # Markdown table formatter
      csv.ts              # CSV formatter
      index.ts            # Formatter factory
    utils/
      config.ts           # Config file loading (cosmiconfig)
      io.ts               # File reading, stdin handling
      colors.ts           # Color/symbol helpers + non-TTY detection
      table.ts            # Table rendering helpers
    types.ts              # CLI-specific types
  bin/
    caniemail.ts          # Bin entry: #!/usr/bin/env node
test/
  cli/
    check.test.ts
    score.test.ts
    list-clients.test.ts
    list-features.test.ts
    diff.test.ts
    formatters.test.ts
```

### `package.json` additions

```json
{
  "bin": {
    "caniemail-tool": "./dist/bin/caniemail-tool.js"
  }
}
```

---

## Future Features

| Feature              | Description                                                        | Priority |
| -------------------- | ------------------------------------------------------------------ | -------- |
| **Watch mode**       | `caniemail check email.html --watch` — re-run on file changes      | High     |
| **Multi-file glob**  | `caniemail check ./emails/**/*.html` — check many files at once    | High     |
| **HTML report**      | `--format html` — generates a self-contained HTML report page      | Medium   |
| **Badge generation** | `caniemail badge email.html` — SVG badge for README                | Medium   |
| **Init command**     | `caniemail init` — interactive setup to create `.caniemailrc.json` | Medium   |
| **Autofix**          | `caniemail fix email.html` — auto-apply safe fixes (future)        | Low      |
| **Plugin system**    | Custom formatters, custom checks via plugins                       | Low      |
| **Interactive mode** | `caniemail check email.html --interactive` — TUI with navigation   | Low      |
