// src/lib/ulid.ts – Crockford's Base32 ULID (26 chars)
const CHARS = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

function encodeTime(t: number, len = 10) {
  let out = ''
  for (let i = len - 1; i >= 0; i--) {
    out = CHARS[t % 32] + out
    t = Math.floor(t / 32)
  }
  return out
}

function encodeRandom(len = 16) {
  const bytes = new Uint8Array(len)
  crypto.getRandomValues(bytes)
  let bits = 0, value = 0, out = ''
  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i]
    bits += 8
    while (bits >= 5) {
      out += CHARS[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) out += CHARS[(value << (5 - bits)) & 31]
  return out.slice(0, len)
}

export function ulid(now = Date.now()) {
  return encodeTime(now, 10) + encodeRandom(16)
}
