import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: [
        'src/app/components/ui/**',
        'src/**/*.d.ts',
        'src/app/lib/supabase.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src/app'),
    },
  },
})
