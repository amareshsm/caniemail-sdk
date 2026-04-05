import type { EmailClient, EmailClientGlobs } from '../clients.js';
import type { CanIEmailResult } from '../index.js';

// ─── Severity Tiers ───────────────────────────────────────────────────────────

export type SeverityTier = 'critical' | 'high' | 'medium' | 'low' | 'minimal';

export const SEVERITY_WEIGHTS: Record<SeverityTier, number> = {
  critical: 1.0,
  high: 0.75,
  medium: 0.5,
  low: 0.25,
  minimal: 0.1
};

// ─── Scoring Options ──────────────────────────────────────────────────────────

export type ScoringPreset = 'enterprise' | 'consumer' | 'global' | 'mobile-first';

export interface ScoringOptions {
  /** Override severity tier for specific features by title */
  featureSeverity?: Record<string, SeverityTier>;

  /** Override client importance weights (0.0–1.0). Supports glob patterns. */
  clientWeights?: Record<string, number>;

  /** Use a preset weight profile */
  preset?: ScoringPreset;

  /**
   * How much credit partial support gets (0.0–1.0).
   * Default: 0.7 (70% credit).
   * Set to 0 for strict mode (partial = unsupported).
   * Set to 1 for lenient mode (partial = fully supported).
   */
  partialSupportValue?: number;

  /**
   * Impact dampening factor for "partial-only" features (0.0–1.0).
   *
   * Features that are NEVER fully unsupported ("none") in any tested client
   * only cause minor degradation. This factor reduces their impact weight
   * so they don't dominate the score over truly broken features.
   *
   * Default: 0.2 (partial-only features contribute 20% of their base impact).
   * Set to 1.0 to disable dampening (all features weighted equally).
   * Set to 0.0 to completely ignore partial-only features.
   */
  partialOnlyDampening?: number;
}

export interface CanIEmailScoreOptions {
  clients: EmailClientGlobs[];
  css?: string;
  html?: string;
  scoring?: ScoringOptions;
}

// ─── Score Results ────────────────────────────────────────────────────────────

export type Grade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';

export interface FeatureScoreDetail {
  /** Feature title (e.g., "border-radius", "display:flex") */
  title: string;
  /** The severity tier assigned */
  severity: SeverityTier;
  /** Numeric severity weight (1.0, 0.75, 0.5, 0.25, 0.1) */
  severityWeight: number;
  /** How many times this feature was detected in the email */
  occurrences: number;
  /** Multiplier derived from occurrences: 1 + log2(count) */
  usageMultiplier: number;
  /** The combined impact weight = severityWeight × usageMultiplier × dampening */
  impact: number;
  /**
   * Whether this feature is "partial-only" — it has partial support in some
   * clients but is never fully unsupported ("none") in any tested client.
   * Partial-only features have dampened impact because they represent
   * minor degradation rather than breakage.
   */
  isPartialOnly: boolean;
  /** Support status per client */
  supportByClient: Record<string, 'full' | 'partial' | 'none'>;
}

export interface ClientScoreDetail {
  /** Full client name (e.g., "gmail.desktop-webmail") */
  client: EmailClient;
  /** The importance weight assigned to this client */
  clientWeight: number;
  /** Client's weighted compatibility score (0.0–1.0) */
  score: number;
  /** Total number of distinct features checked */
  totalFeatures: number;
  /** Number of fully supported features */
  supportedFeatures: number;
  /** Number of partially supported features */
  partialFeatures: number;
  /** Number of unsupported features */
  unsupportedFeatures: number;
}

export interface CanIEmailScoreResult {
  /** Overall compatibility score (0–100) */
  score: number;

  /** Letter grade (A+, A, B, C, D, F) */
  grade: Grade;

  /** Human-readable label (e.g., "Excellent", "Good", "Poor") */
  label: string;

  /** Per-client score breakdown */
  clientScores: ClientScoreDetail[];

  /** Per-feature detail breakdown */
  featureDetails: FeatureScoreDetail[];

  /** The raw caniemail() result for access to issues */
  raw: CanIEmailResult;
}

// ─── Internal Types ───────────────────────────────────────────────────────────

/** A rule for classifying feature title → severity tier */
export interface SeverityRule {
  match: (title: string, category: string) => boolean;
  tier: SeverityTier;
}

/** Resolved config after merging defaults, presets, and user overrides */
export interface ResolvedScoringConfig {
  featureSeverityOverrides: Record<string, SeverityTier>;
  clientWeights: Map<EmailClient, number>;
  partialSupportValue: number;
  /** Impact dampening factor for partial-only features (0.0–1.0) */
  partialOnlyDampening: number;
}
