import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync, statSync } from "fs";
import { join, extname } from "path";

const ROOTS = ["src", "public", "templates", "views", "index.html", "src/renderer.tsx"];
const EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".html", ".htm", ".tsx"]);
const SKIP_DIRS = new Set(["node_modules", ".wrangler", "dist", "tmp", "coverage", ".vite", ".next", "out", ".cache", "build"]);

function walk(p: string, acc: string[] = []): string[] {
  const s = statSync(p, { throwIfNoEntry: false });
  if (!s) return acc;
  if (s.isFile()) { acc.push(p); return acc; }
  for (const name of readdirSync(p)) {
    if (SKIP_DIRS.has(name)) continue;
    walk(join(p, name), acc);
  }
  return acc;
}

function isCheckedFile(p: string) {
  const e = extname(p).toLowerCase();
  return EXTS.has(e);
}

describe("Policy: no Tailwind CDN", () => {
  it("repository must not reference cdn.tailwindcss.com", () => {
    const files = ROOTS.flatMap(r => walk(r))
      .filter(Boolean)
      .filter(isCheckedFile);

    const offenders: { file: string; line: number; snippet: string }[] = [];
    // Catch any direct cdn refs (including http:// and //) and any script tags to tailwindcss.com
    const pattern = /cdn\.tailwindcss\.com|<script[^>]+tailwindcss\.com/i;

    for (const f of files) {
      const txt = readFileSync(f, "utf8");
      if (pattern.test(txt)) {
        const lines = txt.split(/\r?\n/);
        lines.forEach((line, i) => {
          if (pattern.test(line)) offenders.push({ file: f, line: i + 1, snippet: line.trim() });
        });
      }
    }

    if (offenders.length) {
      const msg = offenders.map(o => ` - ${o.file}:${o.line}  ${o.snippet}`).join("\n");
      throw new Error(`Found forbidden Tailwind CDN references:\n${msg}`);
    }

    expect(offenders.length).toBe(0)
  });
});
