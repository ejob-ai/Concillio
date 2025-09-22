import { describe, it, expect } from 'vitest'
import { readdirSync, statSync, readFileSync } from 'fs'
import { join, extname } from 'path'

// Directories to scan
const ROOTS = ['src', 'public', 'templates', 'views']
// Skip build and tooling outputs
const SKIP_DIRS = new Set([
  'node_modules', '.wrangler', 'dist', 'tmp', 'coverage', '.vite', '.next', 'out', '.cache', 'build'
])
// Allowed file extensions
const EXT_WHITELIST = new Set(['.ts', '.tsx', '.js', '.jsx', '.html', '.md'])
// Pattern matching any form of Tailwind CDN script tag
const pattern = /cdn\.tailwindcss\.com|<script[^>]+tailwindcss\.com/i

function walk(dir: string, hits: string[] = []): string[] {
  const entries = readdirSync(dir)
  for (const name of entries) {
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) {
      if (SKIP_DIRS.has(name)) continue
      walk(p, hits)
    } else {
      if (!EXT_WHITELIST.has(extname(name))) continue
      const text = readFileSync(p, 'utf8')
      if (pattern.test(text)) hits.push(p)
    }
  }
  return hits
}

describe('Policy: no Tailwind CDN', () => {
  it('repository must not contain Tailwind CDN references', () => {
    const hits: string[] = []
    for (const root of ROOTS) {
      try { walk(join(process.cwd(), root), hits) } catch {}
    }
    // Also check root index.html if present
    try {
      const idx = join(process.cwd(), 'index.html')
      const text = readFileSync(idx, 'utf8')
      if (pattern.test(text)) hits.push('index.html')
    } catch {}

    if (hits.length) {
      throw new Error(`Found Tailwind CDN references in files:\n${hits.join('\n')}`)
    }
    expect(hits.length).toBe(0)
  })
})
