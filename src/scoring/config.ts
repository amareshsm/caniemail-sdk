/**
 * Configuration Resolver
 *
 * Merges user-provided scoring options with defaults:
 * 1. Preset weights (if specified)
 * 2. Default client weights
 * 3. User-specified client weight overrides (supports glob patterns)
 * 4. User-specified feature severity overrides
 */
import micromatch from 'micromatch';

import { type EmailClient } from '../clients.js';

import { getDefaultClientWeight } from './client-weights.js';
import { GLOBAL_EQUAL_WEIGHT, getPresetWeights } from './presets.js';
import type { ResolvedScoringConfig, ScoringOptions } from './types.js';

/**
 * Resolve scoring options into a fully-resolved config.
 *
 * Priority for client weights:
 * 1. Explicit `clientWeights` overrides (highest priority)
 * 2. Preset weights (if `preset` is specified)
 * 3. Default market-share weights
 *
 * The `clientWeights` keys support glob patterns (e.g., "outlook.*", "*.ios").
 */
export function resolveConfig(
  clients: EmailClient[],
  options?: ScoringOptions
): ResolvedScoringConfig {
  const partialSupportValue = options?.partialSupportValue ?? 0.7;
  const partialOnlyDampening = options?.partialOnlyDampening ?? 0.2;

  if (partialSupportValue < 0 || partialSupportValue > 1) {
    throw new RangeError(`partialSupportValue must be between 0 and 1, got ${partialSupportValue}`);
  }

  if (partialOnlyDampening < 0 || partialOnlyDampening > 1) {
    throw new RangeError(
      `partialOnlyDampening must be between 0 and 1, got ${partialOnlyDampening}`
    );
  }

  // --- Resolve client weights ---
  const clientWeights = new Map<EmailClient, number>();

  // Start with defaults
  for (const client of clients) {
    clientWeights.set(client, getDefaultClientWeight(client));
  }

  // Apply preset overrides
  if (options?.preset) {
    const presetWeights = getPresetWeights(options.preset);

    if (options.preset === 'global') {
      // Global preset: all clients get equal weight
      for (const client of clients) {
        clientWeights.set(client, GLOBAL_EQUAL_WEIGHT);
      }
    } else {
      // Other presets: apply partial overrides
      for (const client of clients) {
        if (presetWeights[client] !== undefined) {
          clientWeights.set(client, presetWeights[client]!);
        }
      }
    }
  }

  // Apply user overrides (supports globs, highest priority)
  if (options?.clientWeights) {
    for (const [pattern, weight] of Object.entries(options.clientWeights)) {
      if (weight < 0 || weight > 1) {
        throw new RangeError(
          `Client weight for "${pattern}" must be between 0 and 1, got ${weight}`
        );
      }

      // Resolve glob pattern against client names
      const matched = micromatch(clients, [pattern]) as EmailClient[];
      for (const client of matched) {
        clientWeights.set(client, weight);
      }
    }
  }

  return {
    featureSeverityOverrides: options?.featureSeverity ?? {},
    clientWeights,
    partialSupportValue,
    partialOnlyDampening
  };
}
