import build from '@hono/vite-build/cloudflare-pages'
import devServer from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/cloudflare'
import { defineConfig } from 'vite'

const buildId = process.env.BUILD_ID || new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14)
const buildTime = new Date().toUTCString()

export default defineConfig({
  define: {
    __BUILD_ID__: JSON.stringify(buildId),
    __BUILD_TIME__: JSON.stringify(buildTime)
  },
  plugins: [
    build(),
    devServer({
      adapter,
      entry: 'src/index.tsx'
    })
  ]
})
