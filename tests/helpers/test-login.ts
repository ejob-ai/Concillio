import { APIRequestContext } from '@playwright/test'

export async function helperLogin(request: APIRequestContext, baseURL: string, token?: string) {
  if (!token) return { ok: false as const, reason: 'no TEST_LOGIN_TOKEN' as const }
  const url = baseURL ? `${baseURL}/api/test/login` : '/api/test/login'
  const res = await request.post(url, {
    headers: { 'x-test-auth': token },
  })
  return { ok: res.ok(), status: res.status() }
}
