// src/utils/auth.ts
import * as scrypt from 'scrypt-js'

export async function hashPassword(password: string, saltB64: string, pepper: string) {
  const salt = Uint8Array.from(atob(saltB64), c => c.charCodeAt(0))
  const data = new TextEncoder().encode(password + pepper)
  // Säkra men rimliga parametrar för Workers (kan höjas i prod):
  const N = 1 << 14, r = 8, p = 1, dkLen = 32
  const out = new Uint8Array(dkLen)
  await scrypt.scrypt(data, salt, N, r, p, out)
  return btoa(String.fromCharCode(...out)) // base64
}

export function makeSaltB64(): string {
  const buf = new Uint8Array(16)
  crypto.getRandomValues(buf)
  return btoa(String.fromCharCode(...buf))
}

export async function verifyPassword(password: string, saltB64: string, pepper: string, expectedHashB64: string) {
  const hashB64 = await hashPassword(password, saltB64, pepper)
  // constant-time compare
  if (hashB64.length !== expectedHashB64.length) return false
  let diff = 0
  for (let i = 0; i < hashB64.length; i++) diff |= (hashB64.charCodeAt(i) ^ expectedHashB64.charCodeAt(i))
  return diff === 0
}

export function sessionCookieAttrs(maxAgeSeconds: number) {
  return [
    `Path=/`,
    `HttpOnly`,
    `Secure`,
    `SameSite=Lax`,
    `Max-Age=${maxAgeSeconds}`
  ].join('; ')
}
