// src/lib/db.ts
export type Env = {
  DB: D1Database;                  // D1 binding
  SESSIONS_KV: KVNamespace;        // idempotency / dedup
  RATE_KV?: KVNamespace;           // rate limiting (optional here)
};

export type DecisionSession = {
  id: string;
  topic: string;
  status: 'created' | 'running' | 'failed' | 'done';
  plan: string | null;
  meta: string | null;            // JSON string
  created_at: number;
  updated_at: number;
};

export type DecisionStep = {
  id: string;
  session_id: string;
  phase: 'intro'|'analysis'|'challenge'|'synthesis'|'consensus';
  role: string;
  input: string | null;           // JSON
  output: string | null;          // JSON
  cost_cents: number | null;
  duration_ms: number | null;
  status: 'pending'|'ok'|'error'|'skipped';
  created_at: number;
};

export async function createDecisionSession(env: Env, { id, topic, plan, metaJson }: {
  id: string; topic: string; plan?: string | null; metaJson?: string | null;
}): Promise<void> {
  const stmt = env.DB.prepare(`
    INSERT INTO decision_sessions (id, topic, status, plan, meta)
    VALUES (?1, ?2, 'created', ?3, ?4)
  `);
  await stmt.bind(id, topic, plan ?? null, metaJson ?? null).run();
}

export async function updateSessionStatus(env: Env, id: string, status: DecisionSession['status']) {
  await env.DB.prepare(`UPDATE decision_sessions SET status=?2 WHERE id=?1`).bind(id, status).run();
}

export async function appendStep(env: Env, step: Omit<DecisionStep,'created_at'>) {
  const stmt = env.DB.prepare(`
    INSERT INTO decision_session_steps
    (id, session_id, phase, role, input, output, cost_cents, duration_ms, status)
    VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
  `);
  await stmt
    .bind(
      step.id, step.session_id, step.phase, step.role,
      step.input ?? null, step.output ?? null,
      step.cost_cents ?? 0, step.duration_ms ?? 0, step.status
    )
    .run();
}

export async function setOutcome(env: Env, sessionId: string, data: {
  consensus?: string; recommendations?: string; risks?: string;
}) {
  await env.DB.prepare(`
    INSERT INTO outcomes (session_id, consensus, recommendations, risks)
    VALUES (?1, ?2, ?3, ?4)
    ON CONFLICT(session_id) DO UPDATE SET
      consensus=excluded.consensus,
      recommendations=excluded.recommendations,
      risks=excluded.risks
  `).bind(sessionId, data.consensus ?? null, data.recommendations ?? null, data.risks ?? null).run();
}

export async function getOutcome(env: Env, sessionId: string) {
  const row = await env.DB.prepare(`SELECT * FROM outcomes WHERE session_id=?1`).bind(sessionId).first();
  return row as { session_id: string; consensus: string|null; recommendations: string|null; risks: string|null } | null;
}

export async function getSession(env: Env, id: string) {
  const row = await env.DB.prepare(`SELECT * FROM decision_sessions WHERE id=?1`).bind(id).first();
  return row as DecisionSession | null;
}

export async function listSteps(env: Env, sessionId: string) {
  const rs = await env.DB.prepare(`
    SELECT * FROM decision_session_steps
    WHERE session_id=?1
    ORDER BY created_at ASC
  `).bind(sessionId).all();
  return (rs.results ?? []) as DecisionStep[];
}

// Simple rate limit helper using RATE_KV
export async function rateLimit(env: Env, key: string, max: number, windowSec: number) {
  const now = Math.floor(Date.now() / 1000);
  const bucket = `${now - (now % windowSec)}`;
  const kvKey = `rl:${key}:${bucket}`;
  const kv = env.RATE_KV as KVNamespace | undefined;
  if (!kv) return true; // if not bound, don't block
  const curr = Number((await kv.get(kvKey)) ?? '0') + 1;
  await kv.put(kvKey, String(curr), { expirationTtl: windowSec });
  return curr <= max;
}

// Idempotency helper using SESSIONS_KV
export async function once(env: Env, scope: string, id: string, ttlSec: number) {
  const key = `once:${scope}:${id}`;
  const exists = await env.SESSIONS_KV.get(key);
  if (exists) return false;
  await env.SESSIONS_KV.put(key, '1', { expirationTtl: ttlSec });
  return true;
}

// ULID moved to dedicated module (spec‑compliant)
export { ulid } from './ulid';
