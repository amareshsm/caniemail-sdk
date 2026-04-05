/**
 * Scoring Presets
 *
 * Pre-configured weight profiles for common email audience segments.
 * Each preset adjusts client importance weights to reflect the
 * typical importance of each client for that audience.
 */
import type { EmailClient } from '../clients.js';

import type { ScoringPreset } from './types.js';

type PresetWeights = Partial<Record<EmailClient, number>>;

interface PresetDefinition {
  description: string;
  weights: PresetWeights;
}

/**
 * Enterprise preset: B2B, corporate email.
 * Outlook is king, Apple Mail for executives, Thunderbird for tech.
 */
const ENTERPRISE: PresetDefinition = {
  description: 'Corporate/B2B email — Outlook-heavy with Apple Mail',
  weights: {
    'outlook.windows': 1.0,
    'outlook.windows-mail': 0.9,
    'outlook.macos': 0.85,
    'outlook.ios': 0.7,
    'outlook.android': 0.7,
    'apple-mail.macos': 0.8,
    'apple-mail.ios': 0.7,
    'gmail.desktop-webmail': 0.6,
    'gmail.android': 0.4,
    'gmail.ios': 0.4,
    'gmail.mobile-webmail': 0.2,
    'thunderbird.macos': 0.5,
    'yahoo.desktop-webmail': 0.2,
    'yahoo.ios': 0.1,
    'yahoo.android': 0.1,
    'protonmail.desktop-webmail': 0.3,
    'protonmail.ios': 0.2,
    'protonmail.android': 0.2
  }
};

/**
 * Consumer preset: B2C, marketing emails, newsletters.
 * Gmail and Apple Mail dominate.
 */
const CONSUMER: PresetDefinition = {
  description: 'B2C / Marketing email — Gmail and Apple Mail heavy',
  weights: {
    'gmail.desktop-webmail': 1.0,
    'gmail.android': 0.95,
    'gmail.ios': 0.85,
    'gmail.mobile-webmail': 0.6,
    'apple-mail.ios': 1.0,
    'apple-mail.macos': 0.8,
    'outlook.windows': 0.5,
    'outlook.windows-mail': 0.3,
    'outlook.macos': 0.4,
    'outlook.ios': 0.4,
    'outlook.android': 0.4,
    'yahoo.desktop-webmail': 0.6,
    'yahoo.ios': 0.4,
    'yahoo.android': 0.4,
    'aol.desktop-webmail': 0.3,
    'aol.ios': 0.2,
    'aol.android': 0.2,
    'samsung-email.android': 0.5
  }
};

/**
 * Global preset: balanced coverage across all clients.
 * All clients weighted equally at 1.0.
 */
const GLOBAL: PresetDefinition = {
  description: 'Balanced worldwide coverage — equal weights for all clients',
  weights: {} // Empty = all clients get equal weight (1.0)
};

/**
 * Mobile-first preset: mobile clients weighted higher.
 */
const MOBILE_FIRST: PresetDefinition = {
  description: 'Mobile-heavy audiences — iOS and Android weighted higher',
  weights: {
    'apple-mail.ios': 1.0,
    'gmail.android': 1.0,
    'gmail.ios': 0.95,
    'gmail.mobile-webmail': 0.7,
    'outlook.ios': 0.7,
    'outlook.android': 0.7,
    'yahoo.ios': 0.5,
    'yahoo.android': 0.5,
    'samsung-email.android': 0.7,
    'protonmail.ios': 0.4,
    'protonmail.android': 0.4,
    'orange.ios': 0.3,
    'orange.android': 0.3,
    'sfr.ios': 0.2,
    'sfr.android': 0.2,
    'aol.ios': 0.3,
    'aol.android': 0.3,
    // Desktop clients get lower weight
    'apple-mail.macos': 0.5,
    'gmail.desktop-webmail': 0.5,
    'outlook.windows': 0.4,
    'outlook.windows-mail': 0.3,
    'outlook.macos': 0.3,
    'yahoo.desktop-webmail': 0.3,
    'thunderbird.macos': 0.2
  }
};

const PRESET_MAP: Record<ScoringPreset, PresetDefinition> = {
  enterprise: ENTERPRISE,
  consumer: CONSUMER,
  global: GLOBAL,
  'mobile-first': MOBILE_FIRST
};

/**
 * Get the weight overrides for a given preset.
 * Returns partial weights — clients not in the map will use defaults.
 * For the 'global' preset, returns empty (meaning all clients get 1.0).
 */
export function getPresetWeights(preset: ScoringPreset): PresetWeights {
  const definition = PRESET_MAP[preset];
  if (!definition) {
    throw new RangeError(`Unknown scoring preset: "${preset}"`);
  }
  return definition.weights;
}

/**
 * Get the global preset weight for all clients (1.0 for each).
 */
export const GLOBAL_EQUAL_WEIGHT = 1.0;
