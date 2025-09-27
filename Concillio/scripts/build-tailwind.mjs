import { execSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

function run(cmd){ execSync(cmd, { stdio: 'inherit' }) }

// Build Tailwind from src/styles/tailwind.css into public/static/tailwind.css
const out = 'public/static/tailwind.css'
mkdirSync(dirname(out), { recursive: true })
const cli = './node_modules/tailwindcss/dist/cli.js'
run(`node ${cli} -c ./tailwind.config.js -i ./src/styles/tailwind.css -o ./public/static/tailwind.css --minify`)

// Touch a build marker for cache busting if needed
writeFileSync('./public/static/tw.build.txt', new Date().toISOString())
