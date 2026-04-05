/**
 * Core Scoring Calculator
 *
 * Implements the weighted compatibility scoring formula:
 *
 *                    Σ_c ( w_c × (Σ_f s_{c,f} × I_f) / (Σ_f I_f) )
 * Score = ──────────────────────────────────────────────────────────── × 100
 *                                   Σ_c w_c
 *
 * Where:
 * - w_c = client importance weight
 * - s_{c,f} = support score for feature f on client c (1.0 / partial / 0.0)
 * - I_f = effective impact = severityWeight × usageMultiplier × dampening
 *
 * Impact dampening:
 * Features that have NO "unsupported" (none) status across ANY tested client
 * are considered "partial-only" — they degrade gracefully but never fully break.
 * Their impact is dampened by `partialOnlyDampening` (default 0.25) so they
 * don't unfairly dominate the score. This is critical because caniemail data
 * marks very common CSS properties (margin, padding, font-size, etc.) as
 * "partial" in most clients. Without dampening, a perfectly-crafted table
 * email would score the same as one using cutting-edge CSS.
 *
 * The algorithm:
 * 1. Collect all features detected (from caniemail errors + warnings)
 * 2. For each feature: classify severity, count occurrences, compute impact
 * 3. Apply partial-only dampening to features never fully unsupported
 * 4. For each client: compute weighted support ratio
 * 5. Combine client scores using client importance weights
 */
import type { EmailClient } from '../clients.js';
import type { FeatureIssues } from '../features.js';
import { getFeatures } from '../features.js';
import type { CanIEmailResult } from '../index.js';

import { getGrade } from './grades.js';
import { getFeatureSeverity } from './severity.js';
import type {
  CanIEmailScoreResult,
  ClientScoreDetail,
  FeatureScoreDetail,
  ResolvedScoringConfig,
  SeverityTier
} from './types.js';
import { SEVERITY_WEIGHTS } from './types.js';
import { collectFeatureSupport, countFeatureOccurrences, getUsageMultiplier } from './usage.js';

/**
 * Determine the category of a feature by title.
 * Looks it up in the caniemail data.
 */
function getFeatureCategory(title: string): string {
  const { all } = getFeatures();
  const feature = all.get(title);
  return feature?.category ?? 'css';
}

/**
 * Check if a feature has "none" support in at least one tested client.
 * Features that are only ever "partial" or "full" across all clients
 * are considered "partial-only" — they don't fully break in any client.
 */
function hasUnsupportedClient(
  supportByClient: Record<string, 'full' | 'partial' | 'none'>
): boolean {
  return Object.values(supportByClient).includes('none');
}

/**
 * Calculate the compatibility score.
 *
 * @param issues - The feature issues from caniemail()
 * @param clients - The resolved client list
 * @param config - The resolved scoring configuration
 * @param raw - The raw caniemail result
 * @returns Full score result with breakdowns
 */
export function calculateScore(
  issues: FeatureIssues,
  clients: EmailClient[],
  config: ResolvedScoringConfig,
  raw: CanIEmailResult
): CanIEmailScoreResult {
  const { errors, warnings } = issues;
  const { partialSupportValue, partialOnlyDampening, featureSeverityOverrides, clientWeights } =
    config;

  // ─── Step 1: Collect feature data ──────────────────────────────────────────

  // Count unique occurrences per feature (by position in source)
  const occurrenceCounts = countFeatureOccurrences(errors, warnings);

  // Collect support status: feature → client → 'full' | 'partial' | 'none'
  const featureSupport = collectFeatureSupport(errors, warnings, clients);

  // ─── Step 2: Build feature details ─────────────────────────────────────────

  const featureDetails: FeatureScoreDetail[] = [];

  for (const [title, clientMap] of featureSupport) {
    const category = getFeatureCategory(title);
    const severity: SeverityTier = getFeatureSeverity(title, category, featureSeverityOverrides);
    const severityWeight = SEVERITY_WEIGHTS[severity];
    const occurrences = occurrenceCounts.get(title) ?? 1;
    const usageMultiplier = getUsageMultiplier(occurrences);

    const supportByClient: Record<string, 'full' | 'partial' | 'none'> = {};
    for (const [client, support] of clientMap) {
      supportByClient[client] = support;
    }

    // ─── Partial-only dampening ──────────────────────────────────────────
    // Features that are never fully unsupported ("none") in any client
    // only cause minor degradation. Dampen their impact so they don't
    // unfairly dominate the score over features that truly break.
    const isPartialOnly = !hasUnsupportedClient(supportByClient);
    const dampening = isPartialOnly ? partialOnlyDampening : 1.0;
    const impact = severityWeight * usageMultiplier * dampening;

    featureDetails.push({
      title,
      severity,
      severityWeight,
      occurrences,
      usageMultiplier,
      impact,
      isPartialOnly,
      supportByClient
    });
  }

  // ─── Step 3: Handle edge case — no features detected ──────────────────────

  if (featureDetails.length === 0) {
    // No features detected = nothing to fail on. Perfect score.
    const clientScores: ClientScoreDetail[] = clients.map((client) => ({
      client,
      clientWeight: clientWeights.get(client) ?? 0.3,
      score: 1.0,
      totalFeatures: 0,
      supportedFeatures: 0,
      partialFeatures: 0,
      unsupportedFeatures: 0
    }));

    return {
      score: 100,
      grade: 'A+',
      label: 'Excellent',
      clientScores,
      featureDetails,
      raw
    };
  }

  // ─── Step 4: Calculate per-client scores ───────────────────────────────────

  const clientScores: ClientScoreDetail[] = [];

  for (const client of clients) {
    let weightedSupportSum = 0;
    let totalImpact = 0;
    let supportedCount = 0;
    let partialCount = 0;
    let unsupportedCount = 0;

    for (const feature of featureDetails) {
      const support = feature.supportByClient[client];
      const impact = feature.impact;

      // Support score: full=1.0, partial=configurable, none=0.0
      let supportScore: number;
      if (support === 'full') {
        supportScore = 1.0;
        supportedCount++;
      } else if (support === 'partial') {
        supportScore = partialSupportValue;
        partialCount++;
      } else {
        supportScore = 0.0;
        unsupportedCount++;
      }

      weightedSupportSum += supportScore * impact;
      totalImpact += impact;
    }

    // Client score = weighted support ratio (0.0–1.0)
    const clientScore = totalImpact > 0 ? weightedSupportSum / totalImpact : 1.0;
    const cWeight = clientWeights.get(client) ?? 0.3;

    clientScores.push({
      client,
      clientWeight: cWeight,
      score: clientScore,
      totalFeatures: featureDetails.length,
      supportedFeatures: supportedCount,
      partialFeatures: partialCount,
      unsupportedFeatures: unsupportedCount
    });
  }

  // ─── Step 5: Calculate final weighted score ────────────────────────────────

  let weightedScoreSum = 0;
  let totalWeight = 0;

  for (const cs of clientScores) {
    // Skip clients with weight 0 (user explicitly excluded them)
    if (cs.clientWeight === 0) continue;

    weightedScoreSum += cs.score * cs.clientWeight;
    totalWeight += cs.clientWeight;
  }

  const finalScore = totalWeight > 0 ? (weightedScoreSum / totalWeight) * 100 : 100;

  // Round to 1 decimal place for display
  const roundedScore = Math.round(finalScore * 10) / 10;

  const { grade, label } = getGrade(roundedScore);

  return {
    score: roundedScore,
    grade,
    label,
    clientScores,
    featureDetails,
    raw
  };
}
