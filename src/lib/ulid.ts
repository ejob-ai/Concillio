// src/lib/ulid.ts (vendored, Workers-safe, no side effects)
// ULID specification: 26-char Crockford Base32 string
//  - First 10 chars: time in ms (48 bits)
//  - Last 16 chars: randomness (80 bits)
// Monotonic: if multiple ULIDs generated within the same ms, the random
//  part is incremented lexicographically. Uses crypto.getRandomValues only.

const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
const ENCODING_LEN = 32

// Encode a number (time in ms) into Base32 with fixed length (10)
function encodeTime(time: number, len = 10): string {
  let t = Math.floor(time)
  const out = Array<string>(len)
  for (let i = len - 1; i >= 0; i--) {
    out[i] = ENCODING[t % ENCODING_LEN]
    t = Math.floor(t / ENCODING_LEN)
  }
  return out.join('')
}

// Produce 16 Base32 indexes (0..31) from 80 random bits (10 bytes)
function randomIndexes16(): number[] {
  const bytes = new Uint8Array(10)
  crypto.getRandomValues(bytes)
  const idx: number[] = []
  let acc = 0
  let bits = 0
  for (let i = 0; i < bytes.length; i++) {
    acc = (acc << 8) | bytes[i]
    bits += 8
    while (bits >= 5) {
      bits -= 5
      idx.push((acc >> bits) & 0x1f)
      if (idx.length === 16) return idx
    }
  }
  if (idx.length < 16) {
    // pad remaining bits (shouldn't generally happen with 80->16*5 exact)
    idx.push((acc << (5 - bits)) & 0x1f)
    while (idx.length < 16) idx.push(0)
  }
  return idx
}

function indexesToString(idx: number[]): string {
  const out = Array<string>(idx.length)
  for (let i = 0; i < idx.length; i++) out[i] = ENCODING[idx[i] & 0x1f]
  return out.join('')
}

// Increment Base32 index array in-place (rightmost first). Return true if ok, false if overflow
function incrementBase32(idx: number[]): boolean {
  for (let i = idx.length - 1; i >= 0; i--) {
    if (idx[i] < ENCODING_LEN - 1) {
      idx[i]++
      for (let j = i + 1; j < idx.length; j++) idx[j] = 0
      return true
    }
  }
  return false // overflow
}

let lastTime = -1
let lastRand: number[] | null = null

export function ulid(): string {
  let now = Date.now()
  if (now < lastTime) {
    // Clock moved backwards – stick to lastTime for monotonicity
    now = lastTime
  }

  let randIdx: number[]
  if (now === lastTime && lastRand) {
    // Same ms: increment
    const next = lastRand.slice()
    const ok = incrementBase32(next)
    if (!ok) {
      // Overflow: advance time by 1ms and reset randomness
      now = lastTime + 1
      randIdx = new Array(16).fill(0)
    } else {
      randIdx = next
    }
  } else {
    randIdx = randomIndexes16()
  }

  lastTime = now
  lastRand = randIdx

  return encodeTime(now, 10) + indexesToString(randIdx)
}

export default ulid
