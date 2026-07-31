import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
  test: {
    include: ['src/**/*.test.ts'],
    exclude: ['src/api/router.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/usecases/**/*.ts'],
      exclude: ['**/*.test.ts', '**/types.ts', 'src/usecases/errors.ts'],
    },
  },
});
