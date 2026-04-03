[![libera manifesto](https://img.shields.io/badge/libera-manifesto-lightgrey.svg)](https://liberamanifesto.com)

# caniemail

Check HTML and CSS Feature Support for Email Clients from [caniemail.com](https://caniemail.com) — works in **Node.js** and **browsers**.

> **Note:** This project is a fork of [shellscape/caniemail](https://github.com/shellscape/caniemail). Email compatibility data is sourced from [caniemail.com](https://www.caniemail.com/).

## Environment Support

| Environment                    | Format | Entry                              |
| ------------------------------ | ------ | ---------------------------------- |
| **Node.js** (≥20.19.0)         | ESM    | `dist/index.js`                    |
| **Browser** (bundler)          | ESM    | `dist/browser/index.mjs`           |
| **Browser** (CDN / `<script>`) | IIFE   | `dist/browser/caniemail.global.js` |

## Requirements

**Node.js:** [LTS](https://github.com/nodejs/Release) Node version (v20.19.0+)

**Browser:** Any modern browser (ES2020+). No polyfills needed.

## Installation

Install the package from npm using your favourite package manager:

```shell
pnpm add caniemail
# bun add caniemail
# yarn add caniemail
# npm add caniemail
```

## Usage

### Node.js (ESM)

```typescript
import { caniemail } from 'caniemail';

const result = caniemail({
  clients: ['gmail.*', 'outlook.*'],
  html: '<div style="display: flex;"><p>Hello</p></div>'
});

console.log(result.success); // false
```

### Browser (ESM / Frontend Bundlers)

When using a bundler like Vite, webpack, or esbuild, the package automatically resolves to the browser build:

```typescript
import { caniemail } from 'caniemail';

const result = caniemail({
  clients: ['gmail.*'],
  html: '<div style="display: flex;"><p>Hello</p></div>'
});
```

### Browser (CDN / `<script>` tag)

Use directly via unpkg or jsDelivr — no build step required:

```html
<!-- IIFE global bundle -->
<script src="https://unpkg.com/caniemail/dist/browser/caniemail.global.js"></script>
<script>
  const result = CanIEmail.caniemail({
    clients: ['gmail.*', 'outlook.*'],
    html: '<div style="display: flex;"><p>Hello</p></div>'
  });
  console.log(result.success);
</script>
```

Or with ESM via CDN:

```html
<script type="module">
  import { caniemail } from 'https://esm.sh/caniemail';

  // or: import { caniemail } from 'https://cdn.jsdelivr.net/npm/caniemail/dist/browser/index.mjs';

  const result = caniemail({
    clients: ['gmail.*'],
    html: '<div><p>Hello World</p></div>'
  });
  console.log(result.success);
</script>
```

## Exports

### caniemail(options)

Returns:

```typescript
interface CanIEmailResult {
  issues: FeatureIssues;
  success: boolean;
}
```

#### `options`

Type: `CanIEmailOptions`

```typescript
interface CanIEmailOptions {
  /**
    An array of client names or globs to match email clients.
    Example: ['gmail.android', 'outlook.*', '*.ios']
  */
  clients: EmailClientGlobs[];
  css?: string;
  html?: string;
}
```

##### `clients`

Type: `EmailClientGlobs[]`<br>
Required: `true`

An array of globs for matching email clients to be checked against CanIEmail data. For more information about the glob syntax that is used, refer to the [micromatch](https://www.npmjs.com/package/micromatch) documentation.

To match all clients, pass `['*']`.

Possible email clients:

```javascript
[
  'apple-mail.macos',
  'apple-mail.ios',
  'gmail.desktop-webmail',
  'gmail.ios',
  'gmail.android',
  'gmail.mobile-webmail',
  'orange.desktop-webmail',
  'orange.ios',
  'orange.android',
  'outlook.windows',
  'outlook.windows-mail',
  'outlook.macos',
  'outlook.ios',
  'outlook.android',
  'yahoo.desktop-webmail',
  'yahoo.ios',
  'yahoo.android',
  'aol.desktop-webmail',
  'aol.ios',
  'aol.android',
  'samsung-email.android',
  'sfr.desktop-webmail',
  'sfr.ios',
  'sfr.android',
  'thunderbird.macos',
  'protonmail.desktop-webmail',
  'protonmail.ios',
  'protonmail.android',
  'hey.desktop-webmail',
  'mail-ru.desktop-webmail',
  'fastmail.desktop-webmail',
  'laposte.desktop-webmail'
];
```

Example: `["gmail.*", "*.desktop-webmail"]`

##### `css`

Type: `string`<br>
Required: `false`

CSS string to analyze for email client compatibility.

##### `html`

Type: `string`<br>
Required: `false`

HTML string to analyze for email client compatibility.

> [!NOTE]  
> At least one of `css` or `html` must be provided.

### `formatIssue(options)`

Returns:

```typescript
{
  message: string;
  notes: string[];
}
```

#### `options`

Type:

```typescript
interface FormatIssueOptions {
  client: EmailClient;
  issue: FeatureIssue;
  issueType: 'error' | 'warning';
}
```

##### `client`

Type: `EmailClient`<br>
Required: `true`

The email client to format the issue for.

##### `issue`

Type: `FeatureIssue`<br>
Required: `true`

The feature issue to format.

##### `issueType`

Type: `'error' | 'warning'`<br>
Required: `true`

The type of issue being formatted. Determines the formatting of the message.

## Contributing, Working With This Repo

We 💛 contributions! After all, this is a community-driven project. We have no corporate sponsorship or backing. The maintainers and users keep this project going!

Please check out our [Contribution Guide](./CONTRIBUTING.md).

## Building

```bash
# Build Node.js output
pnpm build

# Build browser bundles (ESM + IIFE)
pnpm build:browser

# Build everything (Node.js + browser)
pnpm build:all
```

## Credits

- Email compatibility data from [caniemail.com](https://www.caniemail.com/)
- Originally created by [Avi Goldman](https://github.com/useparcel) and [Andrew Powell](https://github.com/shellscape)
- Forked and maintained by [Amaresh](https://github.com/amareshsm)

## License

[MIT License](./LICENSE)
