import { readFileSync } from 'node:fs';
import { defineConfig } from 'tsdown';

const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as {
  version: string;
};

export default defineConfig({
  entry: {
    index: './src/index.ts',
  },
  dts: true,
  exports: true,
  minify: false,
});
