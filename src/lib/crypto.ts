// src/lib/crypto.ts
// Workers‑safe RNG helper using Web Crypto
export const secureFloat = (): number => {
  const u = new Uint32Array(1)
  crypto.getRandomValues(u)
  return u[0] / 2 ** 32
}
