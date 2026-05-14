/**
 * Compatibility Scoring — Public API
 *
 * Wraps the existing `caniemail()` function with a weighted scoring system
 * that produces a meaningful 0–100% score with detailed breakdowns.
 */
import { parseClients } from '../clients.js';
import { caniemail } from '../index.js';

import { calculateScore } from './calculator.js';
import { resolveConfig } from './config.js';
import type { CanIEmailScoreOptions, CanIEmailScoreResult } from './types.js';

// Re-export all types
export type {
  CanIEmailScoreOptions,
  CanIEmailScoreResult,
  ClientScoreDetail,
  FeatureScoreDetail,
  Grade,
  ScoringOptions,
  ScoringPreset,
  SeverityTier
} from './types.js';
export { SEVERITY_WEIGHTS } from './types.js';
export { getFeatureSeverity, getExplicitSeverityMap } from './severity.js';
export { getUsageMultiplier } from './usage.js';
export { getGrade } from './grades.js';
export { DEFAULT_CLIENT_WEIGHTS } from './client-weights.js';
export { getPresetWeights } from './presets.js';

/**
 * Check email compatibility and produce a weighted score.
 *
 * This is the main entry point for the scoring system. It:
 * 1. Runs `caniemail()` to detect compatibility issues
 * 2. Classifies each feature by severity tier
 * 3. Counts feature usage for impact weighting
 * 4. Calculates per-client and overall weighted scores
 * 5. Returns a detailed breakdown
 *
 * @example
 * ```ts
 * import { canIEmailScore } from 'caniemail-sdk';
 *
 * const result = canIEmailScore({
 *   clients: ['gmail.*', 'outlook.*'],
 *   html: emailHtml,
 *   scoring: { preset: 'enterprise' }
 * });
 *
 * console.log(`Score: ${result.score}% (${result.grade})`);
 * // "Score: 86.3% (B)"
 * ```
 */
export function canIEmailScore(options: CanIEmailScoreOptions): CanIEmailScoreResult {
  const { clients: globs, css, html, scoring } = options;

  // Run the underlying compatibility check
  const raw = caniemail({ clients: globs, css, html });

  // Resolve the actual client list
  const clients = parseClients(globs);

  // Resolve scoring config (merge defaults + preset + user overrides)
  const config = resolveConfig(clients, scoring);

  // Calculate and return the score
  return calculateScore(raw.issues, clients, config, raw);
}
