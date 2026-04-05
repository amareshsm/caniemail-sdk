/**
 * Feature Severity Classification
 *
 * Maps every caniemail feature title to a severity tier based on its
 * real-world visual impact on email rendering.
 *
 * The classification philosophy:
 * - CRITICAL: Without this, the email layout breaks or becomes unreadable.
 *   A user would immediately notice something is wrong.
 * - HIGH: Visually significant — noticeable degradation but the email is
 *   still readable and layout generally holds together.
 * - MEDIUM: Moderate visual difference. An average user might notice it
 *   but the email still functions and looks acceptable.
 * - LOW: Minor cosmetic differences that most users won't notice.
 *   Advanced CSS features that provide polish but aren't essential.
 * - MINIMAL: Nice-to-have features with negligible visual impact.
 *   The email looks fine without them.
 *
 * Classification is done via ordered rules (first match wins) plus
 * an explicit override map for features that don't fit neatly into
 * pattern-based rules.
 */
import type { SeverityRule, SeverityTier } from './types.js';

// ─── Explicit Severity Overrides ──────────────────────────────────────────────
// For features where a pattern-based rule would misclassify them.
// These take highest precedence.

const EXPLICIT_SEVERITY: Record<string, SeverityTier> = {
  // --- Critical: Core layout & rendering ---
  display: 'critical',
  'display:flex': 'medium', // Flexbox is modern CSS, not universally expected in email
  'display:grid': 'medium', // Grid is even less expected
  'display:none': 'critical', // Hiding preheader text, etc.
  'width property': 'critical',
  'height property': 'critical',
  margin: 'critical',
  padding: 'critical',
  'background-color': 'critical',
  background: 'critical',
  'color-scheme CSS property': 'low',
  'font-size': 'critical',
  'text-align': 'critical',
  'vertical-align': 'critical',
  float: 'critical',
  clear: 'critical',
  'table-layout': 'critical',
  'border-collapse': 'critical',
  'empty-cells': 'high',
  'caption-side': 'low',

  // --- High: Important visual properties ---
  border: 'high',
  'border-radius': 'high',
  'border-spacing': 'high',
  'background-image': 'high',
  'background-size': 'high',
  'background-position': 'high',
  'background-repeat': 'high',
  'line-height': 'high',
  'font shorthand': 'high',
  'font-weight': 'high',
  'max-width': 'high',
  'min-width property': 'high',
  'max-height property': 'high',
  'min-height property': 'high',
  position: 'high',
  overflow: 'high',
  'overflow-wrap': 'high',
  direction: 'high',
  visibility: 'high',
  'white-space': 'high',
  'word-wrap': 'high',
  'word-break': 'high',

  // --- Medium: Visual enhancements ---
  'box-shadow': 'medium',
  'text-decoration': 'medium',
  'text-decoration-color': 'medium',
  'text-decoration-line': 'medium',
  'text-decoration-style': 'medium',
  'text-decoration-thickness': 'low',
  'text-decoration-skip-ink': 'low',
  'text-transform': 'medium',
  opacity: 'medium',
  'text-shadow': 'medium',
  'text-overflow': 'medium',
  'text-indent': 'medium',
  'letter-spacing': 'medium',
  'word-spacing': 'medium',
  'list-style': 'medium',
  'list-style-type': 'medium',
  'list-style-position': 'medium',
  'list-style-image': 'medium',
  'font-kerning': 'low',
  'font-stretch': 'low',
  hyphens: 'low',
  'hyphenate-character': 'low',
  'hyphenate-limit-chars': 'low',
  'text-align-last': 'low',
  'text-justify': 'low',
  'text-orientation': 'low',
  'text-emphasis': 'low',
  'text-emphasis-position': 'low',
  'text-underline-offset': 'low',
  'text-underline-position': 'low',
  'text-wrap': 'low',
  'white-space-collapse': 'low',
  'writing-mode': 'low',
  widows: 'low',
  orphans: 'low',

  // --- Flexbox / Grid (modern layout — medium, not critical in email) ---
  'align-items': 'medium',
  'justify-content': 'medium',
  'flex-direction:column': 'medium',
  'flex-wrap: wrap': 'medium',
  'gap, column-gap, row-gap': 'medium',
  'grid-template-* properties': 'medium',

  // --- Background advanced ---
  'background-clip': 'medium',
  'background-origin': 'low',
  'background-blend-mode': 'low',
  'backdrop-filter': 'low',

  // --- Border advanced ---
  'border-image': 'low',
  'border-inline & border-block': 'low',
  'border-inline & border-block individual logical properties': 'low',
  'border-inline & border-block longhand properties': 'low',
  'border-radius logical properties': 'low',

  // --- Logical properties (fallback to physical is fine) ---
  'block-size & inline-size': 'low',
  'inline-size ': 'low', // note trailing space in caniemail data
  'margin-block-start & margin-block-end': 'low',
  'margin-inline & margin-block': 'low',
  'margin-inline-start & margin-inline-end': 'low',
  'padding-block-start & padding-block-end': 'low',
  'padding-inline & padding-block': 'low',
  'padding-inline-start & padding-inline-end': 'low',
  'max-block-size': 'low',
  'max-inline-size': 'low',
  'min-block-size': 'low',
  'min-inline-size': 'low',
  inset: 'low',
  'left, right, top, bottom': 'medium',

  // --- Advanced CSS effects ---
  filter: 'low',
  transform: 'low',
  transition: 'low',
  animation: 'low',
  'clip-path': 'low',
  'mix-blend-mode': 'low',
  'mask-image': 'low',
  'object-fit': 'medium',
  'object-position': 'low',
  resize: 'minimal',
  'scroll-snap': 'minimal',
  'shape-margin': 'minimal',
  'shape-outside': 'minimal',
  'user-select': 'minimal',
  cursor: 'minimal',
  'z-index': 'medium',
  outline: 'low',
  'outline-offset': 'low',
  'box-sizing': 'high',
  'column-count': 'medium',
  'css column properties': 'medium',
  'tab-size': 'minimal',
  'aspect-ratio': 'medium',
  'accent-color': 'minimal',
  'color-scheme meta tag': 'low',

  // --- CSS Units ---
  'px unit': 'critical', // Most common, must work
  '% unit': 'critical', // Percentage layouts are fundamental
  'em unit': 'high', // Very commonly used
  'pt unit': 'high', // Used in font-size often
  'rem unit': 'medium', // Modern but common
  'cm unit': 'low',
  'mm unit': 'low',
  'in unit': 'low',
  'pc unit': 'low',
  'ex unit': 'low',
  'ch unit': 'low',
  'vh unit': 'low',
  'vw unit': 'low',
  'vmin unit': 'low',
  'vmax unit': 'low',
  'initial unit': 'low',

  // --- CSS Functions ---
  'CSS calc() function': 'medium',
  'clamp()': 'low',
  'min()': 'low',
  'max()': 'low',
  'linear-gradient()': 'high',
  'radial-gradient()': 'medium',
  'conic-gradient()': 'low',
  'rgb()': 'high',
  'rgba()': 'high',
  'light-dark()': 'low',
  'lch(), oklch(), lab(), oklab()': 'low',
  'fit-content, min-content, max-content': 'medium',
  'CSS Variables (Custom Properties)': 'medium',
  'CSS Nesting': 'low',
  'CSS comments': 'minimal',
  '!important keyword': 'high',

  // --- At-rules ---
  '@media': 'high',
  '@media (prefers-color-scheme)': 'medium',
  '@media (hover), @media (any-hover)': 'low',
  '@media (orientation)': 'low',
  '@media (-webkit-device-pixel-ratio)': 'low',
  '@media (prefers-reduced-motion)': 'low',
  '@font-face': 'medium',
  '@import': 'medium',
  '@keyframes': 'low',
  '@supports': 'low',

  // --- Selectors ---
  'Class selector': 'critical',
  'ID selector': 'high',
  'Type selector': 'high',
  'Descendant combinator': 'high',
  'Child combinator': 'high',
  'Grouping selectors': 'high',
  'Attribute selector': 'medium',
  'Adjacent sibling combinator': 'medium',
  'General sibling combinator': 'medium',
  'Chaining selectors': 'medium',
  'Universal selector *': 'low',

  // --- Pseudo-classes ---
  ':hover': 'medium',
  ':active': 'low',
  ':focus': 'low',
  ':visited': 'low',
  ':link': 'low',
  ':first-child': 'medium',
  ':last-child': 'medium',
  ':nth-child': 'medium',
  ':nth-of-type': 'low',
  ':nth-last-child': 'low',
  ':nth-last-of-type': 'low',
  ':first-of-type': 'low',
  ':last-of-type': 'low',
  ':only-child': 'low',
  ':only-of-type': 'low',
  ':not': 'medium',
  ':has()': 'low',
  ':checked': 'minimal',
  ':target': 'minimal',
  'lang()': 'minimal',

  // --- Pseudo-elements ---
  '::before': 'medium',
  '::after': 'medium',
  '::first-line': 'low',
  '::first-letter': 'low',
  '::marker': 'low',
  '::placeholder': 'minimal',

  // --- System fonts ---
  'system-ui, ui-serif, ui-sans-serif, ui-rounded, ui-monospace': 'low',

  // ─── HTML Elements ──────────────────────────────────────────────────────────

  // Critical HTML (structure)
  '<body> element': 'critical',
  '<table> element': 'critical',
  '<div> element': 'critical',
  '<span> element': 'critical',
  '<img> element': 'critical',
  '<style> element': 'critical',
  'HTML5 doctype': 'critical',
  'align attribute': 'critical',
  'width attribute': 'critical',
  'height attribute': 'critical',
  'background attribute': 'high',
  'cellpadding attribute': 'high',
  'cellspacing attribute': 'high',
  'valign attribute': 'high',

  // High HTML (content structure)
  '<p> element': 'high',
  '<h1> to <h6> elements': 'high',
  '<a> element (implicit)': 'high', // handled by pattern
  '<ul>, <ol> and <dl>': 'high',
  '<hr> element': 'high',
  '<blockquote> element': 'high',
  '<strong> element': 'high',
  '<br> element (implicit)': 'high', // handled by pattern
  'Local anchors': 'high',
  'mailto: links': 'high',
  '<link> element': 'high',
  'dir attribute': 'medium',
  'lang attribute': 'medium',
  'role attribute': 'medium',
  'target attribute': 'medium',
  'loading attribute': 'medium',
  'srcset and sizes attributes': 'medium',
  'hidden attribute': 'medium',

  // Medium HTML
  '<pre> element': 'medium',
  '<code> element': 'medium',
  '<small> element': 'medium',
  '<del> element': 'medium',
  '<strike> element': 'medium',
  'HTML5 semantics': 'medium',
  '<picture> element': 'medium',
  '<abbr> element': 'low',
  '<acronym> element': 'low',
  address: 'low',
  '<bdi> element': 'low',
  '<dfn> element': 'low',
  '<wbr> element': 'low',
  '<marquee> element': 'minimal',
  'HTML comments': 'minimal',

  // Low HTML (interactive — rarely used in email)
  '<audio> element': 'low',
  '<video> element': 'low',
  '<form> element': 'low',
  '<input type="text"> element': 'low',
  '<input type="submit"> element': 'low',
  '<input type="reset"> element': 'low',
  '<input type="checkbox"> element': 'low',
  '<input type="radio"> element': 'low',
  '<input type="hidden"> element': 'low',
  '<button type="submit"> element': 'low',
  '<button type="reset"> element': 'low',
  '<select> element': 'low',
  '<textarea> element': 'low',
  '<meter> element': 'minimal',
  '<progress> element': 'minimal',
  '<dialog> element': 'minimal',
  '<object> element': 'minimal',
  '<base>': 'low',
  '<rp> element': 'minimal',
  '<rt> element': 'minimal',
  '<ruby> element': 'minimal',
  'Embedded <svg> image': 'medium',
  'Image maps': 'low',
  'required attribute': 'minimal',
  'aria-describedby attribute': 'minimal',
  'aria-hidden attribute': 'low',
  'aria-label attribute': 'minimal',
  'aria-labelledby attribute': 'minimal',
  'aria-live attribute': 'minimal',
  'popover attribute': 'minimal',

  // ─── Image Formats ──────────────────────────────────────────────────────────
  'JPG image format': 'critical',
  'PNG image format': 'critical',
  'GIF image format': 'high',
  'SVG image format': 'medium',
  'webP image format': 'medium',
  'AVIF image format': 'low',
  'Animated PNG image format': 'low',
  'Base 64 image format': 'medium',
  'BMP image format': 'low',
  'HDR image format': 'minimal',
  'HEIF image format': 'low',
  'ICO image format': 'minimal',
  'TIFF image format': 'low',
  'Video as Image Assets': 'low',

  // ─── Others ─────────────────────────────────────────────────────────────────
  'AMP for Email': 'minimal',
  BIMI: 'minimal'
};

// ─── Pattern-Based Rules (fallback) ──────────────────────────────────────────
// These are only consulted if a feature is NOT in EXPLICIT_SEVERITY.
// First match wins.

const SEVERITY_RULES: SeverityRule[] = [
  // Core layout properties
  {
    match: (t) =>
      /^(display|width|height|margin|padding|float|clear|background-color|color|font-size|text-align|vertical-align)/i.test(
        t
      ),
    tier: 'critical'
  },
  // Critical HTML elements
  {
    match: (t, c) =>
      c === 'html' && /^<(table|tr|td|th|a|img|body|head|style|div|span|br)>/i.test(t),
    tier: 'critical'
  },

  // Important visual properties
  {
    match: (t) =>
      /^(border|line-height|font-family|font-weight|max-width|min-width|background-image|background-size|@media)/i.test(
        t
      ),
    tier: 'high'
  },
  // Important HTML elements
  {
    match: (t, c) => c === 'html' && /^<(p|h[1-6]|ul|ol|li|br|hr|link)>/i.test(t),
    tier: 'high'
  },

  // Visual enhancements
  {
    match: (t) =>
      /^(flex|gap|grid|box-shadow|text-decoration|text-transform|opacity|object)/i.test(t),
    tier: 'medium'
  },
  {
    match: (t, c) => c === 'html' && /^<(video|picture|figure|section|article|nav|svg)>/i.test(t),
    tier: 'medium'
  },
  { match: (t) => /selector|combinator/i.test(t), tier: 'medium' },

  // Advanced CSS
  {
    match: (t) => /^(filter|transform|clip|outline|cursor|animation|transition|mask)/i.test(t),
    tier: 'low'
  },
  { match: (t) => /unit$|calc\(\)|var\(\)|clamp\(\)/i.test(t), tier: 'low' },

  // Image formats
  { match: (_t, c) => c === 'image', tier: 'medium' },

  // Everything else
  { match: () => true, tier: 'minimal' }
];

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Get the severity tier for a feature by its title and category.
 *
 * Lookup order:
 * 1. User overrides (passed in)
 * 2. Explicit severity map (hand-classified per feature)
 * 3. Pattern-based rules (first match)
 * 4. Fallback: 'minimal'
 */
export function getFeatureSeverity(
  title: string,
  category: string,
  overrides?: Record<string, SeverityTier>
): SeverityTier {
  // 1. User overrides take highest priority
  if (overrides?.[title] !== undefined) {
    return overrides[title];
  }

  // 2. Explicit classification
  if (EXPLICIT_SEVERITY[title] !== undefined) {
    return EXPLICIT_SEVERITY[title];
  }

  // 3. Pattern-based rules (first match)
  for (const rule of SEVERITY_RULES) {
    if (rule.match(title, category)) {
      return rule.tier;
    }
  }

  // 4. Should never reach here (last rule matches everything), but safety net
  return 'minimal';
}

/**
 * Expose the explicit map for testing/introspection.
 */
export function getExplicitSeverityMap(): Readonly<Record<string, SeverityTier>> {
  return EXPLICIT_SEVERITY;
}
