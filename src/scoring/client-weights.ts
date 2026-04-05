/**
 * Client Importance Weights
 *
 * Default weights based on approximate global email client market share.
 * These represent how much each client's compatibility matters to the
 * overall score by default.
 *
 * Users can override these with custom weights or use a preset profile.
 */
import type { EmailClient } from '../clients.js';

/**
 * Default client weights based on approximate global market share data.
 * Values range from 0.0 (excluded) to 1.0 (maximum importance).
 */
export const DEFAULT_CLIENT_WEIGHTS: Record<EmailClient, number> = {
  // Apple Mail — ~35% combined share
  'apple-mail.ios': 1.0,
  'apple-mail.macos': 0.8,

  // Gmail — ~30% combined share
  'gmail.desktop-webmail': 1.0,
  'gmail.android': 0.9,
  'gmail.ios': 0.7,
  'gmail.mobile-webmail': 0.4,

  // Orange
  'orange.desktop-webmail': 0.3,
  'orange.ios': 0.2,
  'orange.android': 0.2,

  // Outlook — dominant in enterprise
  'outlook.windows': 0.9,
  'outlook.windows-mail': 0.6,
  'outlook.macos': 0.6,
  'outlook.ios': 0.5,
  'outlook.android': 0.5,

  // Yahoo — smaller but meaningful
  'yahoo.desktop-webmail': 0.5,
  'yahoo.ios': 0.3,
  'yahoo.android': 0.3,

  // AOL — legacy but still used
  'aol.desktop-webmail': 0.3,
  'aol.ios': 0.2,
  'aol.android': 0.2,

  // Other
  'samsung-email.android': 0.4,
  'sfr.desktop-webmail': 0.2,
  'sfr.ios': 0.2,
  'sfr.android': 0.2,
  'thunderbird.macos': 0.4,
  'protonmail.desktop-webmail': 0.4,
  'protonmail.ios': 0.3,
  'protonmail.android': 0.3,
  'hey.desktop-webmail': 0.2,
  'mail-ru.desktop-webmail': 0.3,
  'fastmail.desktop-webmail': 0.3,
  'laposte.desktop-webmail': 0.2
};

/**
 * Get the default weight for a client.
 * Falls back to 0.3 if the client is not in the defaults map.
 */
export function getDefaultClientWeight(client: EmailClient): number {
  return DEFAULT_CLIENT_WEIGHTS[client] ?? 0.3;
}
