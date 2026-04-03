// JSON data loading — supports both Node.js and browser environments.
// In Node.js: uses createRequire to load JSON synchronously (avoids Node v20/v22 divergence on `with`/`assert` for JSON imports).
// In browser: the bundler (tsup) replaces this with an inlined JSON import via the browser entry point.
import { createRequire } from 'node:module';

export type SupportType = string;

export interface RawFeatureStats {
  aol: {
    android: Record<string, SupportType>;
    'desktop-webmail': Record<string, SupportType>;
    ios: Record<string, SupportType>;
  };
  'apple-mail': {
    ios: Record<string, SupportType>;
    macos: Record<string, SupportType>;
  };
  fastmail: { 'desktop-webmail': Record<string, SupportType> };
  gmail: {
    android: Record<string, SupportType>;
    'desktop-webmail': Record<string, SupportType>;
    ios: Record<string, SupportType>;
    'mobile-webmail': Record<string, SupportType>;
  };
  hey: { 'desktop-webmail': Record<string, SupportType> };
  laposte: { 'desktop-webmail': Record<string, SupportType> };
  'mail-ru': { 'desktop-webmail': Record<string, SupportType> };
  orange: {
    android: Record<string, SupportType>;
    'desktop-webmail': Record<string, SupportType>;
    ios: Record<string, SupportType>;
  };
  outlook: {
    android: Record<string, SupportType>;
    ios: Record<string, SupportType>;
    macos: Record<string, SupportType>;
    'outlook-com': Record<string, SupportType>;
    windows: Record<string, SupportType>;
    'windows-mail': Record<string, SupportType>;
  };
  protonmail: {
    android: Record<string, SupportType>;
    'desktop-webmail': Record<string, SupportType>;
    ios: Record<string, SupportType>;
  };
  'samsung-email': { android: Record<string, SupportType> };
  sfr: {
    android: Record<string, SupportType>;
    'desktop-webmail': Record<string, SupportType>;
    ios: Record<string, SupportType>;
  };
  thunderbird: { macos: Record<string, SupportType> };
  yahoo: {
    android: Record<string, SupportType>;
    'desktop-webmail': Record<string, SupportType>;
    ios: Record<string, SupportType>;
  };
}

export interface RawFeatureData {
  category: 'html' | 'css' | 'image';
  description: string | null;
  keywords: string | null;
  last_test_date: string;
  notes: string | null;
  notes_by_num: null | Record<string, string>;
  slug: string;
  stats: RawFeatureStats;
  test_results_url: string | null;
  test_url: string;
  title: string;
  url: string;
}

export interface CanIEmailJson {
  api_version: string;
  data: RawFeatureData[];
  last_update_date: string;
  nice_names: any;
}

const require = createRequire(import.meta.url);
export const caniEmailJson = require('../data/caniemail.json') as CanIEmailJson;
