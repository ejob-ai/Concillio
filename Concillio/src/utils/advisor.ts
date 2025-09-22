export function normalizeAdvisorBullets(advisor: any): string[] {
  const out: string[] = []

  try {
    // 1) bullets_by_role → flatten
    const byRole = advisor?.bullets_by_role
    if (byRole && typeof byRole === 'object') {
      for (const v of Object.values(byRole) as any[]) {
        if (Array.isArray(v)) out.push(...v.map(String))
      }
    }

    // 2) recommendations → bullets
    if (out.length === 0 && Array.isArray(advisor?.recommendations)) {
      out.push(...advisor.recommendations.map(String))
    }

    // 3) split analysis to bullets
    if (out.length === 0 && typeof advisor?.analysis === 'string') {
      out.push(
        ...advisor.analysis
          .split(/[\n•\-–—]|(?<=\.)\s+/)
          .map((s: string) => s.trim())
          .filter(Boolean)
      )
    }

    // 4) clean, dedupe, trim, min length
    const clean = Array.from(
      new Set(
        out
          .map((s) =>
            String(s || '')
              .replace(/\s+/g, ' ')
              .replace(/^[\-–—•]\s*/, '')
              .trim()
          )
          .filter((s) => s.length >= 5)
      )
    )

    // 5) enforce 3–5 items
    if (clean.length >= 5) return clean.slice(0, 5)
    if (clean.length >= 3) return clean
    while (clean.length < 3) clean.push(`Key point #${clean.length + 1}`)
    return clean.slice(0, 5)
  } catch {
    return ['Key point #1', 'Key point #2', 'Key point #3']
  }
}

// NEW (idempotent helpers)
export function padBullets(items: string[] | undefined, min = 3, max = 5, fillerPrefix = 'Key point #'): string[] {
  const uniq = Array.from(new Set((items ?? []).map(s => String(s).trim()).filter(Boolean)));
  if (uniq.length >= min) return uniq.slice(0, max);
  const out = [...uniq];
  let i = 1;
  while (out.length < min && i <= 10) {
    const candidate = `${fillerPrefix}${i}`;
    if (!out.includes(candidate)) out.push(candidate);
    i++;
  }
  return out.slice(0, max);
}

export function padByRole(byRole: Record<string, string[] | undefined>, min = 3, max = 5) {
  return Object.fromEntries(
    Object.entries(byRole).map(([k, v]) => [k, padBullets(v, min, max, `${k} point #`)])
  );
}
