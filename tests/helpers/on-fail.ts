import { promises as fs } from 'node:fs'
import path from 'node:path'
import type { Page } from '@playwright/test'

export async function captureDebug(page: Page, name = 'fail') {
  if (!process.env.CI) return

  const outDir = 'test-results'
  await fs.mkdir(outDir, { recursive: true })

  // Screenshot
  await page.screenshot({ path: path.join(outDir, `${name}.png`), fullPage: true })

  // HTML dump
  const html = await page.content()
  await fs.writeFile(path.join(outDir, `${name}.html`), html, 'utf8')

  // Console log dump (best-effort; attaches listener at failure time)
  try {
    const logs: string[] = []
    page.on('console', (msg) => {
      logs.push(`[${msg.type()}] ${msg.text()}`)
    })
    const consoleDump = logs.join('\n') || '(no console logs captured)'
    await fs.writeFile(path.join(outDir, `${name}.console.txt`), consoleDump, 'utf8')
  } catch {
    // Swallow errors to avoid masking the original test failure
  }
}
