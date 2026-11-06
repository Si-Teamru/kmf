import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

// Unit-тесты лежат рядом с кодом: src/**/*.test.ts. Браузерные проверки — scripts/check-layout.mjs.
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
  },
})
