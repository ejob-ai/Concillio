import { defineConfig } from 'vite'
import cloudflarePages from '@hono/vite-build/cloudflare-pages'
import path from 'node:path'

export default defineConfig({
  plugins: [cloudflarePages({ entry: 'src/index.tsx' })],
  resolve: {
    alias: {
      // Alla importer av 'ulid' går via vår Workers-säkra variant
      ulid: path.resolve(__dirname, 'src/lib/ulid.ts'),
    },
  },
  build: { outDir: 'dist' },
})
