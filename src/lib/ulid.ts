// src/lib/ulid.ts
import { monotonicFactory } from 'ulid'

// Kryptosäker PRNG för Workers (float i [0,1))
const securePrng = () => {
  const buf = new Uint32Array(1)
  crypto.getRandomValues(buf)
  return buf[0] / 2**32
}

export const ulid = monotonicFactory(securePrng)
