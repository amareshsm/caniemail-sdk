// Browser entry point for JSON data loading.
// This file is used by the browser build (tsup) as an alias for json.ts.
// The bundler inlines the JSON data directly into the output bundle,
// so there are no filesystem or Node.js dependencies.
// @ts-expect-error - JSON import handled by bundler (tsup/esbuild)
import data from '../data/caniemail.json';

import type { CanIEmailJson, RawFeatureData, RawFeatureStats, SupportType } from './json.js';

export type { CanIEmailJson, RawFeatureData, RawFeatureStats, SupportType };

export const caniEmailJson = data as unknown as CanIEmailJson;
