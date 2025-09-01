// Crypto utilities for Cloudflare Workers (Web Crypto API)
export async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder()
  const data = enc.encode(input)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, '0')).join('')
}

// AES-GCM encryption helpers. PROMPT_KMS_KEY expected as base64 string (32 bytes for AES-256)
async function importAesKey(base64Key: string) {
  const raw = Uint8Array.from(atob(base64Key), c => c.charCodeAt(0))
  return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt'])
}

export async function aesGcmEncrypt(plainText: string, base64Key: string): Promise<string> {
  const key = await importAesKey(base64Key)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const enc = new TextEncoder()
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(plainText))
  const out = {
    iv: btoa(String.fromCharCode(...iv)),
    data: btoa(String.fromCharCode(...new Uint8Array(cipher)))
  }
  return JSON.stringify(out)
}

export async function aesGcmDecrypt(payload: string, base64Key: string): Promise<string> {
  const parsed = JSON.parse(payload)
  const key = await importAesKey(base64Key)
  const iv = Uint8Array.from(atob(parsed.iv), c => c.charCodeAt(0))
  const data = Uint8Array.from(atob(parsed.data), c => c.charCodeAt(0))
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data)
  return new TextDecoder().decode(plain)
}
