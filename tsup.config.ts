import { polyfillNode } from 'esbuild-plugin-polyfill-node';
import path from 'node:path';
import { defineConfig } from 'tsup';

// esbuild plugin to replace the Node.js JSON loader (json.ts) with the browser-compatible one (json.browser.ts)
const browserJsonPlugin = {
  name: 'browser-json-alias',
  setup(build: any) {
    // Intercept imports of json.js (the compiled json.ts) and redirect to json.browser.ts
    build.onResolve({ filter: /\/json\.js$/ }, (args: any) => {
      if (args.importer && args.resolveDir) {
        return {
          path: path.resolve(args.resolveDir, args.path.replace(/\/json\.js$/, '/json.browser.ts'))
        };
      }
      return undefined;
    });
  }
};

export default defineConfig([
  // Browser ESM bundle — for import in frontend projects / bundlers
  {
    entry: { index: 'src/index.ts' },
    format: ['esm'],
    outDir: 'dist/browser',
    platform: 'browser',
    target: 'es2020',
    dts: true,
    splitting: false,
    treeshake: true,
    clean: true,
    minify: false,
    sourcemap: true,
    esbuildPlugins: [browserJsonPlugin, polyfillNode({ polyfills: { path: true, util: true } })],
    // Bundle all dependencies into a single file for browser use
    noExternal: [/.*/],
    outExtension: () => ({ js: '.mjs' })
  },
  // Browser IIFE bundle — for <script> tag / CDN usage
  {
    entry: { 'caniemail-tool': 'src/index.ts' },
    format: ['iife'],
    outDir: 'dist/browser',
    platform: 'browser',
    target: 'es2020',
    splitting: false,
    treeshake: true,
    clean: false, // Don't clean — ESM build already ran
    minify: true,
    sourcemap: true,
    globalName: 'CanIEmail',
    esbuildPlugins: [browserJsonPlugin, polyfillNode({ polyfills: { path: true, util: true } })],
    noExternal: [/.*/],
    outExtension: () => ({ js: '.global.js' })
  }
]);
