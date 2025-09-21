import { promises as fs } from 'node:fs'
import type { Page } from '@playwright/test'

export async function captureDebug(page: Page, name = 'fail') {
  if (!process.env.CI) return
  await fs.mkdir('test-results', { recursive: true })
  await page.screenshot({ path: `test-results/${name}.png`, fullPage: true })
  const html = await page.content()
  await fs.writeFile(`test-results/${name}.html`, html)
}
