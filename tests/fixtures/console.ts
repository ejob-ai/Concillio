import { test as base, expect } from '@playwright/test'
import { promises as fs } from 'node:fs'
import path from 'node:path'

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

type Fixtures = {
  consoleBuffer: string[]
}

export const test = base.extend<Fixtures>({
  consoleBuffer: async ({ page }, use, testInfo) => {
    const logs: string[] = []
    const handler = (msg: any) => {
      logs.push(`[${msg.type()}] ${msg.text()}`)
    }
    page.on('console', handler)

    await use(logs)

    page.off('console', handler)

    // On failure, dump logs to artifact
    if (process.env.CI && testInfo.status !== testInfo.expectedStatus) {
      await fs.mkdir('test-results', { recursive: true })
      const file = path.join('test-results', `${slug(testInfo.title)}.console.txt`)
      await fs.writeFile(file, logs.join('\n') || '(no console logs)', 'utf8')
    }
  },
})

export { expect }
