import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.tsx'],
  format: ['esm'],
  clean: true,
  dts: false,
  minify: false,
  sourcemap: true,
  external: ['ink', 'react'],
  banner: {
    js: '#!/usr/bin/env node',
  },
});
