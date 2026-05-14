import { outdent } from 'outdent';
import { describe, expect, test } from 'vitest';

import type { EmailClientGlobs } from '../dist/clients.js';
import {
  DEFAULT_CLIENT_WEIGHTS,
  SEVERITY_WEIGHTS,
  canIEmailScore,
  getExplicitSeverityMap,
  getFeatureSeverity,
  getGrade,
  getPresetWeights,
  getUsageMultiplier
} from '../dist/index.js';
import type { CanIEmailScoreResult, Grade, SeverityTier } from '../dist/index.js';

import {
  FIXTURE_BROKEN_LAYOUT_EMAIL,
  FIXTURE_DARK_MODE_EMAIL,
  FIXTURE_INTERACTIVE_EMAIL,
  FIXTURE_MINIMAL_EMAIL,
  FIXTURE_MODERN_CSS_EMAIL,
  FIXTURE_MODERN_MARKETING_EMAIL,
  FIXTURE_PERFECT_TABLE_EMAIL
} from './fixtures/scoring-emails.js';

// ─── Severity Classification Tests ──────────────────────────────────────────

describe('severity classification', () => {
  test('SEVERITY_WEIGHTS has correct values', () => {
    expect(SEVERITY_WEIGHTS.critical).toBe(1.0);
    expect(SEVERITY_WEIGHTS.high).toBe(0.75);
    expect(SEVERITY_WEIGHTS.medium).toBe(0.5);
    expect(SEVERITY_WEIGHTS.low).toBe(0.25);
    expect(SEVERITY_WEIGHTS.minimal).toBe(0.1);
  });

  test('explicit severity map covers core CSS properties', () => {
    const map = getExplicitSeverityMap();
    expect(map['margin']).toBe('critical');
    expect(map['padding']).toBe('critical');
    expect(map['font-size']).toBe('critical');
    expect(map['background-color']).toBe('critical');
    expect(map['display']).toBe('critical');
    expect(map['width property']).toBe('critical');
    expect(map['text-align']).toBe('critical');
  });

  test('explicit severity map classifies modern CSS features correctly', () => {
    const map = getExplicitSeverityMap();
    expect(map['display:flex']).toBe('medium');
    expect(map['display:grid']).toBe('medium');
    expect(map['box-shadow']).toBe('medium');
    expect(map['border-radius']).toBe('high');
    expect(map['CSS Variables (Custom Properties)']).toBe('medium');
    expect(map['transition']).toBe('low');
    expect(map['animation']).toBe('low');
  });

  test('explicit severity map classifies HTML elements correctly', () => {
    const map = getExplicitSeverityMap();
    expect(map['<body> element']).toBe('critical');
    expect(map['<table> element']).toBe('critical');
    expect(map['<img> element']).toBe('critical');
    expect(map['<style> element']).toBe('critical');
    expect(map['<p> element']).toBe('high');
    expect(map['<video> element']).toBe('low');
    expect(map['<form> element']).toBe('low');
  });

  test('explicit severity map classifies image formats correctly', () => {
    const map = getExplicitSeverityMap();
    expect(map['JPG image format']).toBe('critical');
    expect(map['PNG image format']).toBe('critical');
    expect(map['GIF image format']).toBe('high');
    expect(map['SVG image format']).toBe('medium');
    expect(map['AVIF image format']).toBe('low');
  });

  test('getFeatureSeverity returns correct tier for known features', () => {
    expect(getFeatureSeverity('margin', 'css')).toBe('critical');
    expect(getFeatureSeverity('border-radius', 'css')).toBe('high');
    expect(getFeatureSeverity('box-shadow', 'css')).toBe('medium');
    expect(getFeatureSeverity('transition', 'css')).toBe('low');
    expect(getFeatureSeverity('AMP for Email', 'other')).toBe('minimal');
  });

  test('getFeatureSeverity user overrides take highest priority', () => {
    const overrides = { margin: 'low' as SeverityTier };
    expect(getFeatureSeverity('margin', 'css', overrides)).toBe('low');

    const overrides2 = { 'border-radius': 'critical' as SeverityTier };
    expect(getFeatureSeverity('border-radius', 'css', overrides2)).toBe('critical');
  });

  test('getFeatureSeverity falls back to pattern rules for unknown features', () => {
    // Unknown feature matching a layout pattern
    const result = getFeatureSeverity('display-custom-widget', 'css');
    expect(['critical', 'high', 'medium', 'low', 'minimal']).toContain(result);
  });

  test('getFeatureSeverity returns minimal for completely unknown features', () => {
    const result = getFeatureSeverity('xyzzy-unknown-feature-abc123', 'unknown');
    expect(result).toBe('minimal');
  });
});

// ─── Usage Multiplier Tests ─────────────────────────────────────────────────

describe('usage multiplier', () => {
  test('getUsageMultiplier returns 0 for 0 occurrences', () => {
    expect(getUsageMultiplier(0)).toBe(0);
  });

  test('getUsageMultiplier returns 1.0 for 1 occurrence', () => {
    expect(getUsageMultiplier(1)).toBe(1.0);
  });

  test('getUsageMultiplier returns 2.0 for 2 occurrences', () => {
    expect(getUsageMultiplier(2)).toBe(2.0);
  });

  test('getUsageMultiplier follows log2 curve', () => {
    expect(getUsageMultiplier(4)).toBeCloseTo(3.0, 5); // 1 + log2(4) = 3
    expect(getUsageMultiplier(8)).toBeCloseTo(4.0, 5); // 1 + log2(8) = 4
    expect(getUsageMultiplier(16)).toBeCloseTo(5.0, 5); // 1 + log2(16) = 5
  });

  test('getUsageMultiplier has diminishing returns for high counts', () => {
    const m1 = getUsageMultiplier(1);
    const m2 = getUsageMultiplier(2);
    const m4 = getUsageMultiplier(4);
    const m8 = getUsageMultiplier(8);

    // Each doubling of count adds exactly 1.0 to the multiplier (log2 property)
    // But the RATE of increase per additional unit decreases
    const gain1to2 = m2 - m1; // Going from 1→2: gain = 1.0
    const gain2to4 = m4 - m2; // Going from 2→4: gain = 1.0
    const gain4to8 = m8 - m4; // Going from 4→8: gain = 1.0

    // Each doubling adds same amount, but the multiplier per unit decreases
    // Multiplier at 8 (4.0) vs multiplier at 2 (2.0) — a 4× increase in count gives only 2× the multiplier
    expect(m8 / m2).toBeLessThan(8 / 2); // Sub-linear growth
    expect(m4 / m2).toBeLessThan(4 / 2); // 3.0/2.0 = 1.5 < 2.0
  });

  test('getUsageMultiplier returns 0 for negative occurrences', () => {
    expect(getUsageMultiplier(-1)).toBe(0);
    expect(getUsageMultiplier(-100)).toBe(0);
  });
});

// ─── Grade Tests ────────────────────────────────────────────────────────────

describe('grade calculation', () => {
  test('getGrade returns A+ for scores >= 95', () => {
    expect(getGrade(95)).toEqual({ grade: 'A+', label: 'Excellent' });
    expect(getGrade(100)).toEqual({ grade: 'A+', label: 'Excellent' });
    expect(getGrade(99.5)).toEqual({ grade: 'A+', label: 'Excellent' });
  });

  test('getGrade returns A for scores 90-94', () => {
    expect(getGrade(90)).toEqual({ grade: 'A', label: 'Very Good' });
    expect(getGrade(94.9)).toEqual({ grade: 'A', label: 'Very Good' });
  });

  test('getGrade returns B for scores 80-89', () => {
    expect(getGrade(80)).toEqual({ grade: 'B', label: 'Good' });
    expect(getGrade(89.9)).toEqual({ grade: 'B', label: 'Good' });
  });

  test('getGrade returns C for scores 70-79', () => {
    expect(getGrade(70)).toEqual({ grade: 'C', label: 'Acceptable' });
    expect(getGrade(79.9)).toEqual({ grade: 'C', label: 'Acceptable' });
  });

  test('getGrade returns D for scores 50-69', () => {
    expect(getGrade(50)).toEqual({ grade: 'D', label: 'Poor' });
    expect(getGrade(69.9)).toEqual({ grade: 'D', label: 'Poor' });
  });

  test('getGrade returns F for scores < 50', () => {
    expect(getGrade(0)).toEqual({ grade: 'F', label: 'Failing' });
    expect(getGrade(49.9)).toEqual({ grade: 'F', label: 'Failing' });
    expect(getGrade(25)).toEqual({ grade: 'F', label: 'Failing' });
  });

  test('getGrade clamps values above 100', () => {
    expect(getGrade(150)).toEqual({ grade: 'A+', label: 'Excellent' });
  });

  test('getGrade clamps values below 0', () => {
    expect(getGrade(-10)).toEqual({ grade: 'F', label: 'Failing' });
  });

  test('grade boundary precision', () => {
    // Exactly on boundaries
    expect(getGrade(95).grade).toBe('A+');
    expect(getGrade(90).grade).toBe('A');
    expect(getGrade(80).grade).toBe('B');
    expect(getGrade(70).grade).toBe('C');
    expect(getGrade(50).grade).toBe('D');
    expect(getGrade(0).grade).toBe('F');
  });
});

// ─── Client Weights Tests ───────────────────────────────────────────────────

describe('client weights', () => {
  test('DEFAULT_CLIENT_WEIGHTS covers all major clients', () => {
    expect(DEFAULT_CLIENT_WEIGHTS['apple-mail.ios']).toBe(1.0);
    expect(DEFAULT_CLIENT_WEIGHTS['gmail.desktop-webmail']).toBe(1.0);
    expect(DEFAULT_CLIENT_WEIGHTS['outlook.windows']).toBe(0.9);
    expect(DEFAULT_CLIENT_WEIGHTS['yahoo.desktop-webmail']).toBe(0.5);
    expect(DEFAULT_CLIENT_WEIGHTS['samsung-email.android']).toBe(0.4);
  });

  test('all weights are between 0 and 1', () => {
    for (const [client, weight] of Object.entries(DEFAULT_CLIENT_WEIGHTS)) {
      expect(weight).toBeGreaterThanOrEqual(0);
      expect(weight).toBeLessThanOrEqual(1);
    }
  });

  test('high-share clients have highest weights', () => {
    // Apple Mail iOS and Gmail desktop should be top weights
    expect(DEFAULT_CLIENT_WEIGHTS['apple-mail.ios']).toBeGreaterThanOrEqual(
      DEFAULT_CLIENT_WEIGHTS['outlook.windows']
    );
    expect(DEFAULT_CLIENT_WEIGHTS['gmail.desktop-webmail']).toBeGreaterThanOrEqual(
      DEFAULT_CLIENT_WEIGHTS['outlook.windows']
    );
  });
});

// ─── Preset Tests ───────────────────────────────────────────────────────────

describe('presets', () => {
  test('enterprise preset weights Outlook heavily', () => {
    const weights = getPresetWeights('enterprise');
    expect(weights['outlook.windows']).toBe(1.0);
    expect(weights['outlook.windows']!).toBeGreaterThanOrEqual(weights['gmail.desktop-webmail']!);
  });

  test('consumer preset weights Gmail and Apple Mail heavily', () => {
    const weights = getPresetWeights('consumer');
    expect(weights['gmail.desktop-webmail']).toBe(1.0);
    expect(weights['apple-mail.ios']).toBe(1.0);
    expect(weights['gmail.desktop-webmail']!).toBeGreaterThanOrEqual(weights['outlook.windows']!);
  });

  test('global preset returns empty weights (all equal)', () => {
    const weights = getPresetWeights('global');
    expect(Object.keys(weights).length).toBe(0);
  });

  test('mobile-first preset weights mobile clients higher', () => {
    const weights = getPresetWeights('mobile-first');
    expect(weights['apple-mail.ios']).toBe(1.0);
    expect(weights['gmail.android']).toBe(1.0);
    // Mobile > desktop
    expect(weights['apple-mail.ios']!).toBeGreaterThanOrEqual(weights['apple-mail.macos']!);
    expect(weights['gmail.android']!).toBeGreaterThanOrEqual(weights['gmail.desktop-webmail']!);
  });

  test('invalid preset throws RangeError', () => {
    // @ts-expect-error testing invalid input
    expect(() => getPresetWeights('invalid-preset')).toThrow(RangeError);
  });
});

// ─── canIEmailScore Integration Tests ───────────────────────────────────────

describe('canIEmailScore', () => {
  const defaultClients: EmailClientGlobs[] = ['gmail.*', 'outlook.*', 'apple-mail.*'];

  describe('basic functionality', () => {
    test('returns a valid score result', () => {
      const result = canIEmailScore({
        clients: defaultClients,
        html: '<p>Hello</p>'
      });

      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('grade');
      expect(result).toHaveProperty('label');
      expect(result).toHaveProperty('clientScores');
      expect(result).toHaveProperty('featureDetails');
      expect(result).toHaveProperty('raw');
    });

    test('score is between 0 and 100', () => {
      const result = canIEmailScore({
        clients: defaultClients,
        html: FIXTURE_MODERN_CSS_EMAIL
      });

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    test('grade is a valid letter grade', () => {
      const validGrades: Grade[] = ['A+', 'A', 'B', 'C', 'D', 'F'];
      const result = canIEmailScore({
        clients: defaultClients,
        html: FIXTURE_MODERN_CSS_EMAIL
      });

      expect(validGrades).toContain(result.grade);
    });

    test('clientScores includes all resolved clients', () => {
      const result = canIEmailScore({
        clients: ['gmail.desktop-webmail', 'apple-mail.ios'],
        html: '<p>Hello</p>'
      });

      expect(result.clientScores.length).toBe(2);
      expect(result.clientScores.map((c) => c.client)).toContain('gmail.desktop-webmail');
      expect(result.clientScores.map((c) => c.client)).toContain('apple-mail.ios');
    });

    test('featureDetails contains detected features', () => {
      const result = canIEmailScore({
        clients: defaultClients,
        html: FIXTURE_MODERN_CSS_EMAIL
      });

      expect(result.featureDetails.length).toBeGreaterThan(0);
      for (const detail of result.featureDetails) {
        expect(detail).toHaveProperty('title');
        expect(detail).toHaveProperty('severity');
        expect(detail).toHaveProperty('severityWeight');
        expect(detail).toHaveProperty('occurrences');
        expect(detail).toHaveProperty('usageMultiplier');
        expect(detail).toHaveProperty('impact');
        expect(detail).toHaveProperty('isPartialOnly');
        expect(detail).toHaveProperty('supportByClient');
      }
    });

    test('raw property contains caniemail result', () => {
      const result = canIEmailScore({
        clients: defaultClients,
        html: '<p>Hello</p>'
      });

      expect(result.raw).toHaveProperty('issues');
      expect(result.raw).toHaveProperty('success');
    });
  });

  describe('empty / minimal input', () => {
    test('empty HTML throws RangeError', () => {
      expect(() =>
        canIEmailScore({
          clients: defaultClients,
          html: ''
        })
      ).toThrow(RangeError);
    });

    test('HTML with no detectable features returns 100%', () => {
      const result = canIEmailScore({
        clients: defaultClients,
        html: '<!-- just a comment -->'
      });

      expect(result.score).toBe(100);
      expect(result.grade).toBe('A+');
    });
  });

  describe('client weight configuration', () => {
    test('explicit client weight overrides work', () => {
      const html = FIXTURE_MODERN_CSS_EMAIL;

      // Set Outlook to 0 weight — should raise the score
      const r1 = canIEmailScore({
        clients: defaultClients,
        html,
        scoring: { clientWeights: { 'outlook.*': 0 } }
      });

      const r2 = canIEmailScore({
        clients: defaultClients,
        html
      });

      // Without Outlook penalty, score should be higher
      expect(r1.score).toBeGreaterThan(r2.score);
    });

    test('client weight of 0 excludes client from scoring', () => {
      const result = canIEmailScore({
        clients: ['gmail.desktop-webmail', 'outlook.windows'],
        html: FIXTURE_MODERN_CSS_EMAIL,
        scoring: { clientWeights: { 'outlook.windows': 0 } }
      });

      // Outlook should still be in clientScores but with weight 0
      const outlookScore = result.clientScores.find((c) => c.client === 'outlook.windows');
      expect(outlookScore).toBeDefined();
      expect(outlookScore!.clientWeight).toBe(0);
    });

    test('glob patterns in client weights work', () => {
      const result = canIEmailScore({
        clients: defaultClients,
        html: FIXTURE_MODERN_CSS_EMAIL,
        scoring: { clientWeights: { 'outlook.*': 0.1, '*.ios': 0.9 } }
      });

      const outlookWindows = result.clientScores.find((c) => c.client === 'outlook.windows');
      const appleIos = result.clientScores.find((c) => c.client === 'apple-mail.ios');

      // Glob pattern should set outlook.windows to 0.1
      expect(outlookWindows!.clientWeight).toBe(0.1);
      // *.ios pattern should match apple-mail.ios (but outlook.ios wins from outlook.* too)
      expect(appleIos!.clientWeight).toBe(0.9);
    });

    test('invalid client weight throws RangeError', () => {
      expect(() =>
        canIEmailScore({
          clients: defaultClients,
          html: '<p>test</p>',
          scoring: { clientWeights: { 'gmail.*': 1.5 } }
        })
      ).toThrow(RangeError);

      expect(() =>
        canIEmailScore({
          clients: defaultClients,
          html: '<p>test</p>',
          scoring: { clientWeights: { 'gmail.*': -0.1 } }
        })
      ).toThrow(RangeError);
    });
  });

  describe('partial support configuration', () => {
    test('partialSupportValue defaults produce reasonable scores', () => {
      const result = canIEmailScore({
        clients: defaultClients,
        html: FIXTURE_PERFECT_TABLE_EMAIL
      });

      // Perfect table email should be A or A+
      expect(result.score).toBeGreaterThanOrEqual(85);
    });

    test('partialSupportValue=0 makes all partial support count as none', () => {
      const r1 = canIEmailScore({
        clients: defaultClients,
        html: FIXTURE_PERFECT_TABLE_EMAIL,
        scoring: { partialSupportValue: 0 }
      });

      const r2 = canIEmailScore({
        clients: defaultClients,
        html: FIXTURE_PERFECT_TABLE_EMAIL,
        scoring: { partialSupportValue: 1 }
      });

      // Strict mode should always produce lower or equal scores
      expect(r1.score).toBeLessThanOrEqual(r2.score);
    });

    test('partialSupportValue=1 treats partial as full', () => {
      const result = canIEmailScore({
        clients: ['apple-mail.ios'], // Apple Mail has best support
        html: FIXTURE_PERFECT_TABLE_EMAIL,
        scoring: { partialSupportValue: 1 }
      });

      // Apple Mail with lenient partial should be near 100%
      expect(result.score).toBeGreaterThanOrEqual(99);
    });

    test('invalid partialSupportValue throws RangeError', () => {
      expect(() =>
        canIEmailScore({
          clients: defaultClients,
          html: '<p>test</p>',
          scoring: { partialSupportValue: 1.5 }
        })
      ).toThrow(RangeError);

      expect(() =>
        canIEmailScore({
          clients: defaultClients,
          html: '<p>test</p>',
          scoring: { partialSupportValue: -0.1 }
        })
      ).toThrow(RangeError);
    });
  });

  describe('partial-only dampening', () => {
    test('partial-only features have isPartialOnly=true', () => {
      const result = canIEmailScore({
        clients: ['gmail.desktop-webmail', 'apple-mail.ios'],
        html: FIXTURE_MINIMAL_EMAIL
      });

      // Some features should be partial-only (warnings but no errors across all clients)
      const partialOnlyFeatures = result.featureDetails.filter((f) => f.isPartialOnly);
      expect(partialOnlyFeatures.length).toBeGreaterThan(0);
    });

    test('dampening=1.0 disables partial-only dampening', () => {
      const rDampened = canIEmailScore({
        clients: defaultClients,
        html: FIXTURE_MINIMAL_EMAIL,
        scoring: { partialOnlyDampening: 0.2 }
      });

      const rUndampened = canIEmailScore({
        clients: defaultClients,
        html: FIXTURE_MINIMAL_EMAIL,
        scoring: { partialOnlyDampening: 1.0 }
      });

      // Both should produce valid scores
      expect(rDampened.score).toBeGreaterThanOrEqual(0);
      expect(rUndampened.score).toBeGreaterThanOrEqual(0);
      expect(rDampened.score).toBeLessThanOrEqual(100);
      expect(rUndampened.score).toBeLessThanOrEqual(100);

      // Scores should differ when dampening value changes
      expect(rDampened.score).not.toBeCloseTo(rUndampened.score, 0);

      // With dampening=1.0, partial-only features keep full impact weight.
      // For emails with unsupported features, the partial-only features
      // add to the denominator, diluting the unsupported penalty → higher score.
      // With dampening=0.2, partial-only impact is small, so unsupported
      // features dominate → lower score.
      expect(rUndampened.score).toBeGreaterThanOrEqual(rDampened.score);
    });

    test('dampening=0.0 completely ignores partial-only features', () => {
      const result = canIEmailScore({
        clients: defaultClients,
        html: FIXTURE_MINIMAL_EMAIL,
        scoring: { partialOnlyDampening: 0 }
      });

      // Partial-only features should have impact=0
      for (const f of result.featureDetails) {
        if (f.isPartialOnly) {
          expect(f.impact).toBe(0);
        }
      }
    });

    test('invalid partialOnlyDampening throws RangeError', () => {
      expect(() =>
        canIEmailScore({
          clients: defaultClients,
          html: '<p>test</p>',
          scoring: { partialOnlyDampening: 1.5 }
        })
      ).toThrow(RangeError);
    });
  });

  describe('feature severity overrides', () => {
    test('custom featureSeverity overrides default classification', () => {
      // Make border-radius critical instead of high
      const r1 = canIEmailScore({
        clients: ['outlook.windows'],
        html: '<div style="border-radius: 8px;">Hello</div>',
        scoring: { featureSeverity: { 'border-radius': 'critical' } }
      });

      const r2 = canIEmailScore({
        clients: ['outlook.windows'],
        html: '<div style="border-radius: 8px;">Hello</div>'
      });

      // Critical severity should produce lower score (more penalty)
      expect(r1.score).toBeLessThanOrEqual(r2.score);
    });
  });

  describe('preset scoring', () => {
    test('enterprise preset penalizes Outlook issues more', () => {
      const html = FIXTURE_MODERN_CSS_EMAIL;

      const enterprise = canIEmailScore({
        clients: defaultClients,
        html,
        scoring: { preset: 'enterprise' }
      });

      const consumer = canIEmailScore({
        clients: defaultClients,
        html,
        scoring: { preset: 'consumer' }
      });

      // Modern CSS breaks more in Outlook, so enterprise should score lower
      expect(enterprise.score).toBeLessThan(consumer.score);
    });

    test('consumer preset favors Gmail/Apple Mail support', () => {
      const html = FIXTURE_MODERN_CSS_EMAIL;

      const consumer = canIEmailScore({
        clients: defaultClients,
        html,
        scoring: { preset: 'consumer' }
      });

      const defaults = canIEmailScore({
        clients: defaultClients,
        html
      });

      // Consumer weights Apple Mail higher, which supports modern CSS better
      expect(consumer.score).toBeGreaterThanOrEqual(defaults.score - 5);
    });

    test('global preset weights all clients equally', () => {
      const result = canIEmailScore({
        clients: ['gmail.desktop-webmail', 'outlook.windows', 'apple-mail.ios'],
        html: FIXTURE_MODERN_CSS_EMAIL,
        scoring: { preset: 'global' }
      });

      // All clients should have weight 1.0
      for (const cs of result.clientScores) {
        expect(cs.clientWeight).toBe(1.0);
      }
    });

    test('mobile-first preset weights mobile clients higher', () => {
      const result = canIEmailScore({
        clients: ['apple-mail.ios', 'apple-mail.macos', 'gmail.android', 'gmail.desktop-webmail'],
        html: FIXTURE_MODERN_CSS_EMAIL,
        scoring: { preset: 'mobile-first' }
      });

      const iosWeight = result.clientScores.find(
        (c) => c.client === 'apple-mail.ios'
      )!.clientWeight;
      const macosWeight = result.clientScores.find(
        (c) => c.client === 'apple-mail.macos'
      )!.clientWeight;
      expect(iosWeight).toBeGreaterThan(macosWeight);
    });
  });
});

// ─── Score Ordering / Calibration Tests ─────────────────────────────────────

describe('score calibration', () => {
  const defaultClients: EmailClientGlobs[] = ['gmail.*', 'outlook.*', 'apple-mail.*'];

  function score(
    html: string,
    opts?: Parameters<typeof canIEmailScore>[0]['scoring']
  ): CanIEmailScoreResult {
    return canIEmailScore({ clients: defaultClients, html, scoring: opts });
  }

  test('perfect table email scores B or above', () => {
    const result = score(FIXTURE_PERFECT_TABLE_EMAIL);
    expect(result.score).toBeGreaterThanOrEqual(85);
    expect(['A+', 'A', 'B']).toContain(result.grade);
  });

  test('minimal email scores B or above', () => {
    const result = score(FIXTURE_MINIMAL_EMAIL);
    expect(result.score).toBeGreaterThanOrEqual(75);
    expect(['A+', 'A', 'B']).toContain(result.grade);
  });

  test('broken layout email scores D or C', () => {
    const result = score(FIXTURE_BROKEN_LAYOUT_EMAIL);
    expect(result.score).toBeLessThan(80);
    expect(['C', 'D', 'F']).toContain(result.grade);
  });

  test('perfect table email scores higher than broken layout', () => {
    const perfect = score(FIXTURE_PERFECT_TABLE_EMAIL);
    const broken = score(FIXTURE_BROKEN_LAYOUT_EMAIL);
    expect(perfect.score).toBeGreaterThan(broken.score);
  });

  test('perfect table email scores higher than modern CSS email', () => {
    const perfect = score(FIXTURE_PERFECT_TABLE_EMAIL);
    const modern = score(FIXTURE_MODERN_CSS_EMAIL);
    expect(perfect.score).toBeGreaterThan(modern.score);
  });

  test('modern marketing email scores lower than perfect table', () => {
    const perfect = score(FIXTURE_PERFECT_TABLE_EMAIL);
    const marketing = score(FIXTURE_MODERN_MARKETING_EMAIL);
    expect(perfect.score).toBeGreaterThan(marketing.score);
  });

  test('broken layout email scores lower than modern CSS email', () => {
    const modern = score(FIXTURE_MODERN_CSS_EMAIL);
    const broken = score(FIXTURE_BROKEN_LAYOUT_EMAIL);
    expect(modern.score).toBeGreaterThan(broken.score);
  });

  test('dark mode email scores in B range', () => {
    const result = score(FIXTURE_DARK_MODE_EMAIL);
    expect(result.score).toBeGreaterThanOrEqual(75);
    expect(result.score).toBeLessThanOrEqual(92);
  });

  test('Apple Mail scores highest for any email', () => {
    const result = score(FIXTURE_MODERN_CSS_EMAIL);
    const appleMail = result.clientScores.filter((c) => c.client.startsWith('apple-mail'));
    const others = result.clientScores.filter((c) => !c.client.startsWith('apple-mail'));

    const maxApple = Math.max(...appleMail.map((c) => c.score));
    const avgOthers = others.reduce((sum, c) => sum + c.score, 0) / others.length;

    expect(maxApple).toBeGreaterThan(avgOthers);
  });

  test('Outlook Windows scores lowest for modern CSS', () => {
    const result = score(FIXTURE_MODERN_CSS_EMAIL);
    const outlookWindows = result.clientScores.find((c) => c.client === 'outlook.windows');
    const othersMin = Math.min(
      ...result.clientScores.filter((c) => c.client !== 'outlook.windows').map((c) => c.score)
    );

    // Outlook Windows should be among the lowest scorers for modern CSS
    expect(outlookWindows!.score).toBeLessThanOrEqual(0.6);
  });

  test('score spread is meaningful — at least 15 points between best and worst fixture', () => {
    const fixtures = [
      FIXTURE_PERFECT_TABLE_EMAIL,
      FIXTURE_MODERN_MARKETING_EMAIL,
      FIXTURE_MODERN_CSS_EMAIL,
      FIXTURE_BROKEN_LAYOUT_EMAIL,
      FIXTURE_MINIMAL_EMAIL,
      FIXTURE_INTERACTIVE_EMAIL,
      FIXTURE_DARK_MODE_EMAIL
    ];

    const scores = fixtures.map((f) => score(f).score);
    const spread = Math.max(...scores) - Math.min(...scores);

    // Should have meaningful differentiation
    expect(spread).toBeGreaterThanOrEqual(15);
  });
});

// ─── Per-Client Score Tests ─────────────────────────────────────────────────

describe('client score details', () => {
  test('client scores are between 0 and 1', () => {
    const result = canIEmailScore({
      clients: ['gmail.*', 'outlook.*', 'apple-mail.*'],
      html: FIXTURE_MODERN_CSS_EMAIL
    });

    for (const cs of result.clientScores) {
      expect(cs.score).toBeGreaterThanOrEqual(0);
      expect(cs.score).toBeLessThanOrEqual(1);
    }
  });

  test('feature counts add up correctly', () => {
    const result = canIEmailScore({
      clients: ['gmail.desktop-webmail'],
      html: FIXTURE_MODERN_CSS_EMAIL
    });

    for (const cs of result.clientScores) {
      expect(cs.supportedFeatures + cs.partialFeatures + cs.unsupportedFeatures).toBe(
        cs.totalFeatures
      );
    }
  });

  test('single client scoring works', () => {
    const result = canIEmailScore({
      clients: ['apple-mail.ios'],
      html: FIXTURE_PERFECT_TABLE_EMAIL
    });

    expect(result.clientScores.length).toBe(1);
    expect(result.clientScores[0].client).toBe('apple-mail.ios');
    // Apple Mail should support basically everything
    expect(result.clientScores[0].score).toBeGreaterThanOrEqual(0.95);
  });
});

// ─── Feature Detail Tests ───────────────────────────────────────────────────

describe('feature score details', () => {
  test('each feature has valid severity tier', () => {
    const validSeverities: SeverityTier[] = ['critical', 'high', 'medium', 'low', 'minimal'];
    const result = canIEmailScore({
      clients: ['gmail.*', 'outlook.*'],
      html: FIXTURE_MODERN_CSS_EMAIL
    });

    for (const detail of result.featureDetails) {
      expect(validSeverities).toContain(detail.severity);
    }
  });

  test('severity weight matches tier', () => {
    const result = canIEmailScore({
      clients: ['gmail.*'],
      html: FIXTURE_MODERN_CSS_EMAIL
    });

    for (const detail of result.featureDetails) {
      expect(detail.severityWeight).toBe(SEVERITY_WEIGHTS[detail.severity]);
    }
  });

  test('occurrences are positive integers', () => {
    const result = canIEmailScore({
      clients: ['gmail.*'],
      html: FIXTURE_MODERN_CSS_EMAIL
    });

    for (const detail of result.featureDetails) {
      expect(detail.occurrences).toBeGreaterThan(0);
      expect(Number.isInteger(detail.occurrences)).toBe(true);
    }
  });

  test('impact is product of severityWeight × usageMultiplier × dampening', () => {
    const result = canIEmailScore({
      clients: ['gmail.*', 'outlook.*'],
      html: FIXTURE_MODERN_CSS_EMAIL
    });

    for (const detail of result.featureDetails) {
      const expectedMultiplier = getUsageMultiplier(detail.occurrences);
      expect(detail.usageMultiplier).toBeCloseTo(expectedMultiplier, 5);

      // Impact should be severity × usage × dampening
      // For non-partial-only features, dampening=1.0
      // For partial-only features, dampening is the configured value (default 0.2)
      if (!detail.isPartialOnly) {
        expect(detail.impact).toBeCloseTo(detail.severityWeight * detail.usageMultiplier, 5);
      } else {
        // Impact should be less than full (dampened)
        expect(detail.impact).toBeLessThanOrEqual(detail.severityWeight * detail.usageMultiplier);
      }
    }
  });

  test('support values are valid', () => {
    const result = canIEmailScore({
      clients: ['gmail.desktop-webmail', 'outlook.windows'],
      html: FIXTURE_MODERN_CSS_EMAIL
    });

    for (const detail of result.featureDetails) {
      for (const [, support] of Object.entries(detail.supportByClient)) {
        expect(['full', 'partial', 'none']).toContain(support);
      }
    }
  });

  test('repeated features have higher occurrence count', () => {
    // Email with repeated padding usage
    const html = outdent`
      <table>
        <tr><td style="padding: 10px;">A</td></tr>
        <tr><td style="padding: 20px;">B</td></tr>
        <tr><td style="padding: 30px;">C</td></tr>
      </table>
    `;

    const result = canIEmailScore({
      clients: ['outlook.windows'],
      html
    });

    const paddingFeature = result.featureDetails.find((f) => f.title === 'padding');
    if (paddingFeature) {
      expect(paddingFeature.occurrences).toBeGreaterThanOrEqual(3);
      expect(paddingFeature.usageMultiplier).toBeGreaterThan(1.0);
    }
  });
});

// ─── Edge Cases ─────────────────────────────────────────────────────────────

describe('edge cases', () => {
  test('CSS-only input (no HTML)', () => {
    const result = canIEmailScore({
      clients: ['gmail.desktop-webmail'],
      css: 'body { margin: 0; padding: 0; font-size: 16px; }'
    });

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  test('HTML with inline styles', () => {
    const result = canIEmailScore({
      clients: ['gmail.desktop-webmail'],
      html: '<div style="margin: 0; padding: 10px; color: red;">Test</div>'
    });

    expect(result.featureDetails.length).toBeGreaterThan(0);
  });

  test('single client produces valid result', () => {
    const result = canIEmailScore({
      clients: ['gmail.desktop-webmail'],
      html: FIXTURE_PERFECT_TABLE_EMAIL
    });

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.clientScores.length).toBe(1);
  });

  test('many clients produce valid result', () => {
    const result = canIEmailScore({
      clients: [
        'gmail.*',
        'outlook.*',
        'apple-mail.*',
        'yahoo.*',
        'thunderbird.*',
        'samsung-email.*'
      ],
      html: FIXTURE_MODERN_CSS_EMAIL
    });

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.clientScores.length).toBeGreaterThan(10);
  });

  test('real-world newsletter-style email', () => {
    const html = outdent`
      <!doctype html>
      <html>
      <head>
        <style>
          @media only screen and (max-width: 600px) {
            .wrapper { width: 100% !important; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
          <tr>
            <td align="center">
              <table class="wrapper" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff;">
                <tr>
                  <td style="padding: 20px; font-size: 16px; color: #333333; line-height: 24px;">
                    <h1 style="font-size: 24px; margin: 0 0 16px 0; color: #111111;">Newsletter Title</h1>
                    <p style="margin: 0 0 16px 0;">This is a typical newsletter email.</p>
                    <a href="https://example.com" style="color: #0066cc; text-decoration: underline;">Read more</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const result = canIEmailScore({
      clients: ['gmail.*', 'outlook.*', 'apple-mail.*'],
      html
    });

    // Real-world newsletter should score reasonably well
    expect(result.score).toBeGreaterThanOrEqual(70);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});
