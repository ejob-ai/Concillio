import { defineConfig } from 'vite'
import cloudflare from '@hono/vite-build/cloudflare-pages'

export default defineConfig({
  plugins: [cloudflare({ entry: 'src/index.tsx' })],
  build: { outDir: 'dist' }
})
