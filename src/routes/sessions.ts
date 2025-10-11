// src/routes/sessions.ts
import { Hono } from 'hono';
import { Env, ulid,
  createDecisionSession, updateSessionStatus, appendStep,
  setOutcome, getOutcome, getSession, listSteps
} from '../lib/db';

export const sessions = new Hono<{ Bindings: Env }>();

// POST /api/sessions  — skapa beslutssession
sessions.post('/sessions', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const topic = (body.topic ?? '').toString().trim();
  const plan  = (body.plan ?? null) as string | null;
  const meta  = body.meta ?? null;
  if (!topic) return c.json({ error: 'topic required' }, 400);

  const id = ulid();
  await createDecisionSession(c.env, { id, topic, plan, metaJson: meta ? JSON.stringify(meta) : null });
  return c.json({ id, topic, plan, status: 'created' }, 201);
});

// POST /api/sessions/:id/run  — kör en minimal “orchestrator v1 (mock)”
sessions.post('/sessions/:id/run', async (c) => {
  const id = c.req.param('id');
  const sess = await getSession(c.env, id);
  if (!sess) return c.json({ error: 'not found' }, 404);

  await updateSessionStatus(c.env, id, 'running');

  // Minimal “council” (mockad) — 3 roller/5 faser kan ersättas med riktig modell senare
  const phases: Array<'intro'|'analysis'|'challenge'|'synthesis'|'consensus'> =
    ['intro', 'analysis', 'challenge', 'synthesis', 'consensus'];
  const roles = ['strategist', 'risk_officer', 'advisor'];

  for (const phase of phases) {
    for (const role of roles) {
      const stepId = ulid();
      const started = Date.now();
      const input = { topic: sess.topic, plan: sess.plan, phase, role };
      // “Output” skulle i verkligheten komma från din modell/roll-adapter
      const output = {
        notes: `Mocked ${role} response for ${phase}`,
        rationale: `Placeholder analysis for topic "${sess.topic}".`,
      };
      await appendStep(c.env, {
        id: stepId,
        session_id: id,
        phase,
        role,
        input: JSON.stringify(input),
        output: JSON.stringify(output),
        cost_cents: 0,
        duration_ms: Date.now() - started,
        status: 'ok',
        created_at: 0 // ignored by DB default
      });
    }
  }

  // Minimal outcome (mock) — ersätt med verklig konsolidering
  await setOutcome(c.env, id, {
    consensus: `**Consensus**: Proceed cautiously on "${sess.topic}" with plan ${sess.plan ?? 'starter'}.`,
    recommendations: `- Validate assumptions\n- Pilot with 5 users\n- Revisit in 2 weeks`,
    risks: `- Budget overrun\n- Scope creep\n- Model hallucination risk`
  });

  await updateSessionStatus(c.env, id, 'done');
  return c.json({ id, status: 'done' }, 200);
});

// GET /api/sessions/:id/outcome  — hämta utfallet
sessions.get('/sessions/:id/outcome', async (c) => {
  const id = c.req.param('id');
  const data = await getOutcome(c.env, id);
  if (!data) return c.json({ error: 'not found' }, 404);
  return c.json(data, 200);
});

// GET /api/sessions/:id  — detaljer inkl. steps
sessions.get('/sessions/:id', async (c) => {
  const id = c.req.param('id');
  const sess = await getSession(c.env, id);
  if (!sess) return c.json({ error: 'not found' }, 404);
  const steps = await listSteps(c.env, id);
  return c.json({ session: sess, steps }, 200);
});

// GET /api/sessions/:id/protocol.md — enkel Markdown-export (server-render)
sessions.get('/sessions/:id/protocol.md', async (c) => {
  const id = c.req.param('id');
  const sess = await getSession(c.env, id);
  if (!sess) return c.text('Not found', 404);
  const steps = await listSteps(c.env, id);
  const out = await getOutcome(c.env, id);

  const lines: string[] = [];
  lines.push(`# Concillio Protocol — ${sess.topic}`);
  lines.push('');
  lines.push(`**Session**: ${sess.id}`);
  lines.push(`**Plan**: ${sess.plan ?? 'starter'}`);
  lines.push(`**Status**: ${sess.status}`);
  lines.push('');
  lines.push('## Steps');
  for (const s of steps) {
    const o = s.output ? JSON.parse(s.output) : null;
    lines.push(`- **${s.phase}/${s.role}**: ${o?.notes ?? '(no notes)'}`);
  }
  lines.push('');
  lines.push('## Outcome');
  lines.push(out?.consensus ?? '_pending_');
  lines.push('');
  lines.push('### Recommendations');
  lines.push(out?.recommendations ?? '_pending_');
  lines.push('');
  lines.push('### Risks');
  lines.push(out?.risks ?? '_pending_');

  return new Response(lines.join('\n'), {
    headers: { 'content-type': 'text/markdown; charset=utf-8' }
  });
});
