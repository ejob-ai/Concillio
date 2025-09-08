export function scrubPII(input: unknown): unknown {
  try {
    const s = typeof input === 'string' ? input : JSON.stringify(input)
    const masked = s
      // Emails
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/ig, '[email]')
      // Phone numbers (very permissive)
      .replace(/(\+?\d[\d\s()-]{7,}\d)/g, '[phone]')
      // Swedish personnummer-like: YYMMDD-XXXX or YYYYMMDD-XXXX
      .replace(/(?:19|20)?\d{6}[-+]\d{4}/g, '[ssn]')
      // UUID/GUID v1-5
      .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/ig, '[id]')
    return typeof input === 'string' ? masked : JSON.parse(masked)
  } catch {
    return input
  }
}
