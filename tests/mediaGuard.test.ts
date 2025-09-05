import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { unstable_dev } from 'wrangler'

// Note: we run the built worker entry (_worker.js) via wrangler's unstable_dev
// This avoids importing the TS app directly and matches runtime behavior.

describe('media guard', () => {
  let server: any

  beforeAll(async () => {
    server = await unstable_dev('dist/_worker.js', {
      ip: '127.0.0.1',
      experimental: { disableExperimentalWarning: true },
      inspect: false,
    })
  }, 30000)

  afterAll(async () => {
    if (server) await server.stop()
  })

  it('blocks /api/media/*', async () => {
    const res = await server.fetch('/api/media/test')
    expect(res.status).toBe(405)
    const json = await res.json()
    expect(json.ok).toBe(false)
  })

  it('blocks /api/generate-audio', async () => {
    const res = await server.fetch('/api/generate-audio')
    expect(res.status).toBe(405)
  })

  it('blocks /api/generate-video', async () => {
    const res = await server.fetch('/api/generate-video')
    expect(res.status).toBe(405)
  })
})
