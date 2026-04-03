// Type definitions for the caniemail browser bundle
// These mirror the types exported by the parent library

export interface FeatureIssue {
  title: string;
  support: 'full' | 'partial' | 'none';
  notes: string[];
  position?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
    source?: string;
  };
}

export interface FeatureMap<T> extends Map<string, T[]> {}

export interface FeatureIssues {
  errors: FeatureMap<FeatureIssue>;
  warnings: FeatureMap<FeatureIssue>;
}

export interface CanIEmailResult {
  issues: FeatureIssues;
  success: boolean;
}

export interface CanIEmailOptions {
  clients: string[];
  css?: string;
  html?: string;
}

export interface FormatIssueResult {
  message: string;
  notes: string[];
}

export interface IssueGroup {
  issue: FeatureIssue;
  clients: string[];
}

export interface FeatureInfo extends FeatureIssue {
  url: string;
}

export interface AllFeaturesResult {
  supported: FeatureMap<FeatureInfo>;
  unsupported: FeatureMap<FeatureInfo>;
}

// Client metadata
export interface ClientInfo {
  provider: string;
  platform: string;
  fullName: string;
  icon: string;
  label: string;
}

export const CLIENT_NAMES = [
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
] as const;

export type EmailClient = (typeof CLIENT_NAMES)[number];

export const PROVIDER_META: Record<string, { label: string; icon: string; color: string }> = {
  'apple-mail': { label: 'Apple Mail', icon: '🍎', color: '#007AFF' },
  gmail: { label: 'Gmail', icon: '📧', color: '#EA4335' },
  orange: { label: 'Orange', icon: '🟠', color: '#FF6600' },
  outlook: { label: 'Outlook', icon: '📬', color: '#0078D4' },
  yahoo: { label: 'Yahoo', icon: '💜', color: '#6001D2' },
  aol: { label: 'AOL', icon: '📨', color: '#31459B' },
  'samsung-email': { label: 'Samsung Email', icon: '📱', color: '#1428A0' },
  sfr: { label: 'SFR', icon: '📡', color: '#E30613' },
  thunderbird: { label: 'Thunderbird', icon: '🦊', color: '#0A84FF' },
  protonmail: { label: 'ProtonMail', icon: '🔒', color: '#6D4AFF' },
  hey: { label: 'HEY', icon: '👋', color: '#5522FA' },
  'mail-ru': { label: 'Mail.ru', icon: '✉️', color: '#005FF9' },
  fastmail: { label: 'Fastmail', icon: '⚡', color: '#69639A' },
  laposte: { label: 'La Poste', icon: '📮', color: '#FFD700' }
};

export const PLATFORM_LABELS: Record<string, string> = {
  macos: 'macOS',
  ios: 'iOS',
  android: 'Android',
  windows: 'Windows',
  'windows-mail': 'Windows Mail',
  'desktop-webmail': 'Web',
  'mobile-webmail': 'Mobile Web'
};

export function parseClientName(name: string): ClientInfo {
  const [provider, platform] = name.split('.');
  const meta = PROVIDER_META[provider] ?? {
    label: provider,
    icon: '📧',
    color: '#888'
  };
  return {
    provider,
    platform,
    fullName: name,
    icon: meta.icon,
    label: `${meta.label} ${PLATFORM_LABELS[platform] ?? platform}`
  };
}

export function groupClientsByProvider(clients: string[]): Map<string, ClientInfo[]> {
  const groups = new Map<string, ClientInfo[]>();
  for (const name of clients) {
    const info = parseClientName(name);
    if (!groups.has(info.provider)) {
      groups.set(info.provider, []);
    }
    groups.get(info.provider)!.push(info);
  }
  return groups;
}
