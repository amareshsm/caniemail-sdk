# Can I Email — Usage Guide

A comprehensive guide on how to use the `caniemail` npm package to check HTML and CSS email compatibility across email clients.

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
- [Sample Email Template](#sample-email-template)
- [Example 1: Check a Full HTML Email](#example-1-check-a-full-html-email)
- [Example 2: Check Only CSS](#example-2-check-only-css)
- [Example 3: Target Specific Email Clients](#example-3-target-specific-email-clients)
- [Example 4: Use Glob Patterns for Clients](#example-4-use-glob-patterns-for-clients)
- [Example 5: Format Issues for Reporting](#example-5-format-issues-for-reporting)
- [Example 6: Get All Features for a Client](#example-6-get-all-features-for-a-client)
- [Example 7: Group and Sort Issues by Position](#example-7-group-and-sort-issues-by-position)
- [Understanding the Output](#understanding-the-output)
- [Available Email Clients](#available-email-clients)
- [Common Patterns That Fail](#common-patterns-that-fail)
- [Integration with Build Pipelines](#integration-with-build-pipelines)

---

## Installation

```bash
# Using pnpm
pnpm add caniemail

# Using npm
npm add caniemail

# Using yarn
yarn add caniemail

# Using bun
bun add caniemail
```

**Requires:** Node.js v20.19.0 or later (LTS).

---

## Quick Start

```typescript
import { caniemail } from 'caniemail';

const result = caniemail({
  clients: ['gmail.*', 'outlook.*'],
  html: '<div style="display: flex;"><p>Hello World</p></div>'
});

console.log(result.success); // false — `display: flex` is not supported by Outlook Windows
```

---

## Core Concepts

| Concept        | Description                                                                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Clients**    | Email clients to check against (e.g., `gmail.android`, `outlook.windows`). Supports glob patterns via [micromatch](https://www.npmjs.com/package/micromatch). |
| **HTML Check** | Parses your HTML, walks every element, attribute, and inline `style`, and checks each against the caniemail.com database.                                     |
| **CSS Check**  | Parses CSS (from `<style>` tags or standalone), checks properties, values, functions, units, selectors, pseudo-selectors, and at-rules.                       |
| **Errors**     | Features that are **not supported** (`none`) by the target client.                                                                                            |
| **Warnings**   | Features that are **partially supported** (`partial`) by the target client.                                                                                   |
| **Success**    | `true` only if `errors` is empty (zero unsupported features detected).                                                                                        |

---

## Sample Email Template

Below is a realistic promotional email template that uses a mix of HTML elements, CSS properties, inline styles, and embedded `<style>` blocks. We'll use this throughout the examples.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      /* Reset */
      body {
        margin: 0;
        padding: 0;
        background-color: #f4f4f7;
        font-family: Arial, Helvetica, sans-serif;
      }

      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
      }

      /* Header */
      .header {
        background-color: #4f46e5;
        padding: 24px;
        text-align: center;
      }

      .header img {
        width: 120px;
        height: auto;
      }

      /* Hero Section */
      .hero {
        padding: 40px 24px;
        text-align: center;
      }

      .hero h1 {
        font-size: 28px;
        color: #1a1a2e;
        margin: 0 0 16px 0;
      }

      .hero p {
        font-size: 16px;
        color: #6b7280;
        line-height: 1.6;
        margin: 0 0 24px 0;
      }

      /* CTA Button */
      .cta-button {
        display: inline-block;
        background-color: #4f46e5;
        color: #ffffff;
        text-decoration: none;
        padding: 14px 32px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: bold;
      }

      /* Feature Grid */
      .features {
        padding: 0 24px 40px;
      }

      .feature-row {
        display: flex;
        gap: 16px;
        margin-bottom: 16px;
      }

      .feature-card {
        flex: 1;
        background-color: #f9fafb;
        border-radius: 8px;
        padding: 20px;
        text-align: center;
      }

      .feature-card h3 {
        font-size: 14px;
        color: #1a1a2e;
        margin: 12px 0 8px;
      }

      .feature-card p {
        font-size: 13px;
        color: #6b7280;
        margin: 0;
      }

      /* Footer */
      .footer {
        background-color: #1a1a2e;
        padding: 24px;
        text-align: center;
      }

      .footer p {
        color: #9ca3af;
        font-size: 12px;
        margin: 0 0 8px 0;
      }

      .footer a {
        color: #818cf8;
        text-decoration: underline;
      }

      /* Responsive */
      @media only screen and (max-width: 600px) {
        .feature-row {
          flex-direction: column;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <!-- Header -->
      <div class="header">
        <img src="https://example.com/logo-white.png" alt="Acme Inc." width="120" height="40" />
      </div>

      <!-- Hero -->
      <div class="hero">
        <h1>Welcome to Acme! 🎉</h1>
        <p>
          We're thrilled to have you on board. Acme helps you build, test, and ship email templates
          that look great everywhere.
        </p>
        <a href="https://example.com/get-started" class="cta-button"> Get Started </a>
      </div>

      <!-- Features -->
      <div class="features">
        <div class="feature-row">
          <div class="feature-card">
            <img
              src="https://example.com/icon-check.png"
              alt="Compatibility"
              width="48"
              height="48"
            />
            <h3>Cross-Client Compatible</h3>
            <p>Works in Gmail, Outlook, Apple Mail, and 30+ other clients.</p>
          </div>
          <div class="feature-card">
            <img src="https://example.com/icon-speed.png" alt="Fast" width="48" height="48" />
            <h3>Blazing Fast</h3>
            <p>Check your emails in milliseconds, not minutes.</p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p>© 2026 Acme Inc. All rights reserved.</p>
        <p>123 Email Street, San Francisco, CA 94105</p>
        <p>
          <a href="https://example.com/unsubscribe">Unsubscribe</a> ·
          <a href="https://example.com/preferences">Preferences</a>
        </p>
      </div>
    </div>
  </body>
</html>
```

Save this as `my-email.html` — we'll reference it below.

---

## Example 1: Check a Full HTML Email

The most common use case — check a complete HTML email for compatibility issues.

```typescript
import { caniemail, formatIssue } from 'caniemail';
import { readFileSync } from 'node:fs';

// 1. Read your email HTML
const html = readFileSync('./my-email.html', 'utf-8');

// 2. Run the check against target clients
const result = caniemail({
  clients: ['gmail.*', 'outlook.*', 'apple-mail.*'],
  html
});

// 3. Inspect results
console.log('Compatible:', result.success);

// 4. Print errors (unsupported features)
for (const [client, issues] of result.issues.errors.entries()) {
  for (const issue of issues) {
    const formatted = formatIssue({ client, issue, issueType: 'error' });
    console.error(`❌ ${formatted.message}`);
    formatted.notes.forEach((note) => console.error(`   ${note}`));
  }
}

// 5. Print warnings (partially supported features)
for (const [client, issues] of result.issues.warnings.entries()) {
  for (const issue of issues) {
    const formatted = formatIssue({ client, issue, issueType: 'warning' });
    console.warn(`⚠️  ${formatted.message}`);
    formatted.notes.forEach((note) => console.warn(`   ${note}`));
  }
}
```

**Expected output** (for the sample email above):

```
Compatible: false
❌ `display: flex` is not supported by `outlook.windows`
❌ `flex` is not supported by `outlook.windows`
❌ `gap` is not supported by `outlook.windows`
❌ `border-radius` is not supported by `outlook.windows`
❌ `flex-direction` is not supported by `outlook.windows`
⚠️  `@media` is only partially supported by `gmail.desktop-webmail`
⚠️  `background-color` is only partially supported by `gmail.mobile-webmail`
```

---

## Example 2: Check Only CSS

You can check standalone CSS without any HTML. Useful for validating shared stylesheets.

```typescript
import { caniemail } from 'caniemail';

const css = `
  .card {
    display: flex;
    gap: 16px;
    border-radius: 8px;
    filter: blur(5px);
    width: 2rem;
  }

  @media (prefers-color-scheme: dark) {
    .card { background-color: #333; }
  }
`;

const result = caniemail({
  clients: ['outlook.windows', 'gmail.desktop-webmail'],
  css
});

console.log('Success:', result.success);
console.log('Error count:', result.issues.errors.size);
console.log('Warning count:', result.issues.warnings.size);

// Iterate errors
for (const [client, issues] of result.issues.errors.entries()) {
  console.log(`\n${client}:`);
  issues.forEach((issue) => console.log(`  ❌ ${issue.title} (${issue.support})`));
}
```

---

## Example 3: Target Specific Email Clients

Check against only the exact clients your audience uses.

```typescript
import { caniemail } from 'caniemail';

const html = `
  <div style="display: flex; gap: 10px;">
    <div>Column A</div>
    <div>Column B</div>
  </div>
`;

// Only check these 3 specific clients
const result = caniemail({
  clients: ['gmail.desktop-webmail', 'outlook.windows', 'apple-mail.macos'],
  html
});

if (!result.success) {
  console.log('⚠️  Your email has compatibility issues:');
  for (const [client, issues] of result.issues.errors.entries()) {
    issues.forEach((i) => console.log(`  ${client}: ${i.title} is not supported`));
  }
} else {
  console.log('✅ Your email is fully compatible with all target clients!');
}
```

---

## Example 4: Use Glob Patterns for Clients

The `clients` option supports powerful glob patterns via [micromatch](https://www.npmjs.com/package/micromatch).

```typescript
import { caniemail } from 'caniemail';

const html = '<div style="border-radius: 8px;">Hello</div>';

// All clients
caniemail({ clients: ['*'], html });

// All Gmail clients (desktop-webmail, ios, android, mobile-webmail)
caniemail({ clients: ['gmail.*'], html });

// All iOS clients (apple-mail.ios, gmail.ios, outlook.ios, etc.)
caniemail({ clients: ['*.ios'], html });

// All desktop webmail clients
caniemail({ clients: ['*.desktop-webmail'], html });

// Mix patterns and specific names
caniemail({
  clients: ['gmail.*', 'outlook.windows', '*.ios'],
  html
});
```

---

## Example 5: Format Issues for Reporting

The `formatIssue` helper generates human-readable messages, useful for logging, CI output, or reporting tools.

```typescript
import { caniemail, formatIssue } from 'caniemail';

const result = caniemail({
  clients: ['gmail.desktop-webmail', 'outlook.windows'],
  css: `.test { filter: blur(50%); width: 2rem; }`
});

const report: string[] = [];

for (const [client, issues] of result.issues.errors.entries()) {
  for (const issue of issues) {
    const { message, notes } = formatIssue({ client, issue, issueType: 'error' });
    report.push(`ERROR: ${message}`);
    notes.forEach((note) => report.push(`  ↳ ${note}`));
  }
}

for (const [client, issues] of result.issues.warnings.entries()) {
  for (const issue of issues) {
    const { message, notes } = formatIssue({ client, issue, issueType: 'warning' });
    report.push(`WARN:  ${message}`);
    notes.forEach((note) => report.push(`  ↳ ${note}`));
  }
}

console.log(report.join('\n'));
```

**Output:**

```
ERROR: `filter` is not supported by `gmail.desktop-webmail`
ERROR: `rem unit` is not supported by `outlook.windows`
ERROR: `filter` is not supported by `outlook.windows`
```

---

## Example 6: Get All Features for a Client

Use `getAllFeatures` to retrieve **every** feature and its support status for given clients — useful for building dashboards or documentation.

```typescript
import { getAllFeatures } from 'caniemail';
import { parseClients } from 'caniemail/dist/clients.js';

// Get features for all Outlook clients
const clients = parseClients(['outlook.*']);
const features = getAllFeatures(clients);

// List supported features
console.log('=== SUPPORTED ===');
for (const [client, featureList] of features.supported.entries()) {
  console.log(`\n${client} (${featureList.length} features):`);
  featureList.forEach((f) => console.log(`  ✅ ${f.title} (${f.support})`));
}

// List unsupported features
console.log('\n=== UNSUPPORTED ===');
for (const [client, featureList] of features.unsupported.entries()) {
  console.log(`\n${client} (${featureList.length} features):`);
  featureList.forEach((f) => console.log(`  ❌ ${f.title}`));
}
```

---

## Example 7: Group and Sort Issues by Position

When checking a full email, issues include **source positions** (line/column). Use `groupIssues` and `sortIssues` to organize them — great for editor integrations or annotated reports.

```typescript
import { caniemail, groupIssues, sortIssues } from 'caniemail';
import { readFileSync } from 'node:fs';

const html = readFileSync('./my-email.html', 'utf-8');
const result = caniemail({ clients: ['outlook.windows'], html });

// Group: same issue at same position across multiple clients → one group
const grouped = groupIssues(result.issues.errors);

// Sort: order by line number, then column
const sorted = sortIssues(grouped);

for (const group of sorted) {
  const pos = group.issue.position;
  const loc = pos ? `${pos.start.line}:${pos.start.column}` : 'unknown';
  console.log(`[${loc}] ${group.issue.title}`);
  console.log(`  Affected clients: ${group.clients.join(', ')}`);
}
```

**Output:**

```
[15:5] display: flex
  Affected clients: outlook.windows
[16:5] gap
  Affected clients: outlook.windows
[23:5] border-radius
  Affected clients: outlook.windows, outlook.windows-mail
```

---

## Understanding the Output

### `CanIEmailResult`

```typescript
interface CanIEmailResult {
  issues: {
    errors: FeatureMap<FeatureIssue>; // Unsupported features (Map<client, issues[]>)
    warnings: FeatureMap<FeatureIssue>; // Partially supported features
  };
  success: boolean; // true only if errors map is empty
}
```

### `FeatureIssue`

```typescript
interface FeatureIssue {
  title: string; // e.g., "border-radius", "display: flex", "@media"
  support: 'full' | 'partial' | 'none';
  notes: string[]; // Contextual notes from caniemail.com
  position?: {
    // Source location (only when HTML is provided)
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
}
```

### How `FeatureMap` Works

`FeatureMap` extends `Map<EmailClient, FeatureIssue[]>`. Each `.set(client, issue)` **appends** the issue to the client's array rather than replacing it. Iterating gives you `[client, issues[]]` pairs.

---

## Available Email Clients

The full list of clients you can target:

| Provider        | Platforms                                             |
| --------------- | ----------------------------------------------------- |
| `apple-mail`    | `macos`, `ios`                                        |
| `gmail`         | `desktop-webmail`, `ios`, `android`, `mobile-webmail` |
| `orange`        | `desktop-webmail`, `ios`, `android`                   |
| `outlook`       | `windows`, `windows-mail`, `macos`, `ios`, `android`  |
| `yahoo`         | `desktop-webmail`, `ios`, `android`                   |
| `aol`           | `desktop-webmail`, `ios`, `android`                   |
| `samsung-email` | `android`                                             |
| `sfr`           | `desktop-webmail`, `ios`, `android`                   |
| `thunderbird`   | `macos`                                               |
| `protonmail`    | `desktop-webmail`, `ios`, `android`                   |
| `hey`           | `desktop-webmail`                                     |
| `mail-ru`       | `desktop-webmail`                                     |
| `fastmail`      | `desktop-webmail`                                     |
| `laposte`       | `desktop-webmail`                                     |

Use `*` to match all 33 clients.

---

## Common Patterns That Fail

These are commonly-used CSS/HTML features that fail on popular email clients:

| Feature                  | Fails On                      | Alternative                       |
| ------------------------ | ----------------------------- | --------------------------------- |
| `display: flex`          | Outlook Windows               | Use `<table>` layout              |
| `gap`                    | Outlook Windows, Gmail mobile | Use `margin` or `padding`         |
| `border-radius`          | Outlook Windows               | Use VML roundrect for Outlook     |
| `filter`                 | Gmail, Outlook                | Avoid or use pre-processed images |
| `rem` unit               | Outlook Windows               | Use `px` instead                  |
| `@media` queries         | Gmail mobile, some webmails   | Use fluid/hybrid design patterns  |
| `<video>` element        | Most clients                  | Use animated GIF + link fallback  |
| `flex-direction: column` | Gmail, Outlook                | Use stacked `<table>` rows        |
| Class selectors          | Gmail mobile-webmail          | Use inline styles                 |
| `position: absolute`     | Most clients                  | Use table-based positioning       |

---

## Integration with Build Pipelines

### Fail a CI Build on Incompatible Email

```typescript
// scripts/check-email.ts
import { caniemail, formatIssue } from 'caniemail';
import { readFileSync } from 'node:fs';

const html = readFileSync('./dist/email.html', 'utf-8');
const result = caniemail({
  clients: ['gmail.*', 'outlook.*', 'apple-mail.*'],
  html
});

if (!result.success) {
  console.error('❌ Email compatibility check FAILED:\n');
  for (const [client, issues] of result.issues.errors.entries()) {
    for (const issue of issues) {
      const { message } = formatIssue({ client, issue, issueType: 'error' });
      console.error(`  ${message}`);
    }
  }
  process.exit(1);
}

console.log('✅ Email is compatible with all target clients!');
process.exit(0);
```

Add to `package.json`:

```json
{
  "scripts": {
    "check:email": "tsx scripts/check-email.ts"
  }
}
```

### Use in GitHub Actions

```yaml
- name: Check email compatibility
  run: pnpm check:email
```

---

## Summary

| What You Want                | What To Use                                                       |
| ---------------------------- | ----------------------------------------------------------------- |
| Check HTML email             | `caniemail({ clients, html })`                                    |
| Check standalone CSS         | `caniemail({ clients, css })`                                     |
| Check both together          | `caniemail({ clients, html })` (extracts `<style>` automatically) |
| Human-readable messages      | `formatIssue({ client, issue, issueType })`                       |
| Get full feature support map | `getAllFeatures(clients)`                                         |
| Group issues by location     | `groupIssues(result.issues.errors)`                               |
| Sort by position             | `sortIssues(grouped)`                                             |
| Parse raw CSS/HTML           | `parseCss(css)` / `parseHtml(html)`                               |
| Access raw data              | `import data from 'caniemail/caniemail.json'`                     |
