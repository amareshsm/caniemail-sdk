/**
 * Feature Usage Impact
 *
 * A feature used multiple times in an email should weigh more than
 * one used once — but not linearly (diminishing returns).
 *
 * Formula: usageMultiplier = 1 + log2(occurrenceCount)
 *
 * | Occurrences | Multiplier |
 * |-------------|------------|
 * | 1           | 1.0        |
 * | 2           | 2.0        |
 * | 4           | 3.0        |
 * | 8           | 4.0        |
 * | 16          | 5.0        |
 */
import type { EmailClient } from '../clients.js';
import type { FeatureIssue, FeatureMap } from '../features.js';

/**
 * Calculate the usage multiplier for a given occurrence count.
 * Uses log2 with a floor of 1.0 for stability.
 */
export function getUsageMultiplier(occurrenceCount: number): number {
  if (occurrenceCount <= 0) return 0;
  if (occurrenceCount === 1) return 1.0;
  return 1 + Math.log2(occurrenceCount);
}

/**
 * Count how many times each feature title appears across all clients.
 *
 * We count distinct occurrences per feature (by position), not per client.
 * If the same feature appears at 3 different positions in the HTML,
 * that counts as 3 occurrences regardless of how many clients it affects.
 *
 * This is the right semantic: occurrence count reflects how pervasively
 * a feature is used in the email source, not how many clients flag it.
 */
export function countFeatureOccurrences(
  errors: FeatureMap<FeatureIssue>,
  warnings: FeatureMap<FeatureIssue>
): Map<string, number> {
  const positionKeys = new Map<string, Set<string>>();

  const processMap = (map: FeatureMap<FeatureIssue>) => {
    for (const [_client, issues] of map.entries()) {
      for (const issue of issues) {
        const title = issue.title;
        if (!positionKeys.has(title)) {
          positionKeys.set(title, new Set());
        }

        // Unique position key to avoid double-counting same usage across clients
        const posKey = issue.position
          ? `${issue.position.start.line}:${issue.position.start.column}`
          : `no-pos-${Math.random()}`; // Fallback for issues without position
        positionKeys.get(title)!.add(posKey);
      }
    }
  };

  processMap(errors);
  processMap(warnings);

  const counts = new Map<string, number>();
  for (const [title, positions] of positionKeys) {
    counts.set(title, positions.size);
  }
  return counts;
}

/**
 * Collect the support status for each feature title per client.
 *
 * Returns a map: featureTitle → Map<client, 'full' | 'partial' | 'none'>
 *
 * Features that appear in errors → 'none' for that client
 * Features that appear in warnings → 'partial' for that client
 * Features not in errors/warnings → 'full' for that client (assumed supported)
 */
export function collectFeatureSupport(
  errors: FeatureMap<FeatureIssue>,
  warnings: FeatureMap<FeatureIssue>,
  clients: EmailClient[]
): Map<string, Map<EmailClient, 'full' | 'partial' | 'none'>> {
  const support = new Map<string, Map<EmailClient, 'full' | 'partial' | 'none'>>();

  // Helper to get or create per-feature map
  const getFeatureMap = (title: string) => {
    if (!support.has(title)) {
      // Initialize all clients as 'full' (supported)
      const clientMap = new Map<EmailClient, 'full' | 'partial' | 'none'>();
      for (const c of clients) {
        clientMap.set(c, 'full');
      }
      support.set(title, clientMap);
    }
    return support.get(title)!;
  };

  // Collect all feature titles
  const allTitles = new Set<string>();

  // Mark errors as 'none'
  for (const [client, issues] of errors.entries()) {
    for (const issue of issues) {
      allTitles.add(issue.title);
      const featureMap = getFeatureMap(issue.title);
      featureMap.set(client, 'none');
    }
  }

  // Mark warnings as 'partial' (only if not already 'none')
  for (const [client, issues] of warnings.entries()) {
    for (const issue of issues) {
      allTitles.add(issue.title);
      const featureMap = getFeatureMap(issue.title);
      if (featureMap.get(client) !== 'none') {
        featureMap.set(client, 'partial');
      }
    }
  }

  return support;
}
