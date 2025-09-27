import cloudflare from '@hono/vite-build/cloudflare-pages'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [cloudflare({ entry: 'src/index.tsx' })],
  build: { outDir: 'dist' }
})
