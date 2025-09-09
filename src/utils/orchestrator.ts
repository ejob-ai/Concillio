type Json = Record<string, any>;

// Adapter + plugins
import { completeJSON } from '../llm/provider'
import { rolesRegistry } from '../plugins'

type LLMUsage = { prompt_tokens?: number; completion_tokens?: number; cost_usd?: number };
type LLMResult<T extends Json> = { json: T; latency_ms: number; usage: LLMUsage };

const MODEL = "gpt-4o-mini";
const TEMPERATURE = 0.2;
const MAX_OUTPUT_TOKENS = 1200;

// USD per 1K tokens (example values)
const PRICE_USD: Record<string, { input: number; output: number }> = {
  "gpt-4o-mini": { input: 0.0005, output: 0.0015 },
};

function estimateCost(model: string, usage?: LLMUsage): LLMUsage {
  const p = PRICE_USD[model];
  if (!p || !usage) return usage ?? {};
  const inK = (usage.prompt_tokens ?? 0) / 1000;
  const outK = (usage.completion_tokens ?? 0) / 1000;
  const cost = inK * p.input + outK * p.output;
  return { ...usage, cost_usd: +cost.toFixed(6) };
}

async function openAIJsonCall<T extends Json>(args: {
  system: string;
  user: string;
  apiKey: string;
  schemaName: string;                 // for log/repair
  repairOnce?: boolean;
}): Promise<LLMResult<T>> {
  const { system, user, apiKey, schemaName, repairOnce = true } = args;
  const t0 = Date.now();

  async function call(): Promise<{ data: any; usage: LLMUsage }> {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: TEMPERATURE,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user }
        ],
        max_tokens: MAX_OUTPUT_TOKENS,
      }),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`openai_http_${res.status}: ${txt.slice(0,500)}`);
    }
    const body = await res.json();
    const content = body.choices?.[0]?.message?.content ?? "{}";
    const usage: LLMUsage = {
      prompt_tokens: body.usage?.prompt_tokens,
      completion_tokens: body.usage?.completion_tokens,
    };
    let data: any;
    try { data = JSON.parse(content); }
    catch { data = content; }
    return { data, usage };
  }

  // 1st attempt
  let { data, usage } = await call();
  // If not object, try one repair
  if (repairOnce && (typeof data !== "object" || data === null)) {
    const repair = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.0,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You repair malformed JSON outputs. Return a strictly valid JSON object with no extra commentary." },
          { role: "user", content: `Repair this into valid JSON object for schema ${schemaName}:\n\n${typeof data === "string" ? data : JSON.stringify(data)}` }
        ],
        max_tokens: MAX_OUTPUT_TOKENS,
      }),
    });
    const repBody = await repair.json();
    const repContent = repBody.choices?.[0]?.message?.content ?? "{}";
    try { data = JSON.parse(repContent); } catch { /* leave */ }
    usage.prompt_tokens = (usage.prompt_tokens ?? 0) + (repBody.usage?.prompt_tokens ?? 0);
    usage.completion_tokens = (usage.completion_tokens ?? 0) + (repBody.usage?.completion_tokens ?? 0);
  }

  const latency_ms = Date.now() - t0;
  return { json: data as T, latency_ms, usage: estimateCost(MODEL, usage) };
}

/* ---------- PUBLIC API ---------- */

export async function callRole<T extends Json>(
  roleKey: string,
  question: string,
  context: any,
  env: any,
  opts: {
    validate: (obj: any) => Promise<T>;    // Zod/Ajv parseAsync
    systemPrompt?: string;                  // optional when using plugin
    onUsage?: (u: { prompt_tokens?: number; completion_tokens?: number; cost_usd?: number; model?: string }) => void;
  }
): Promise<LLMResult<T>> {
  const plugin: any = (rolesRegistry as any)[roleKey]
  const system = plugin?.systemPrompt || opts.systemPrompt || ''
  const userMsg = plugin?.buildUserPrompt ? plugin.buildUserPrompt({ question, context }) : JSON.stringify({ question, context })

  let usageLocal: LLMUsage = {}
  const t0 = Date.now()
  const jsonAny = await completeJSON(env, {
    model: (env as any).MODEL_NAME || MODEL,
    system,
    user: userMsg,
    schemaName: plugin?.schemaName || roleKey,
    temperature: TEMPERATURE,
    maxTokens: MAX_OUTPUT_TOKENS,
    onUsage: (u: any) => { usageLocal = u; opts.onUsage?.(u) }
  })
  const latency_ms = Date.now() - t0
  const parsed = await opts.validate(jsonAny as T)
  return { json: parsed, latency_ms, usage: usageLocal }
}

export async function callSummarizer<T extends Json>(
  payload: { roles_json: Json; weights: Record<string, number>; question: string; context: any },
  env: any,
  opts: { validate: (obj: any) => Promise<T>; systemPrompt: string; onUsage?: (u: { prompt_tokens?: number; completion_tokens?: number; cost_usd?: number; model?: string }) => void }
): Promise<LLMResult<T>> {
  const userMsg = JSON.stringify(payload)
  let usageLocal: LLMUsage = {}
  const t0 = Date.now()
  const jsonAny = await completeJSON(env, {
    model: (env as any).MODEL_NAME || MODEL,
    system: opts.systemPrompt,
    user: userMsg,
    schemaName: 'SUMMARIZER',
    temperature: TEMPERATURE,
    maxTokens: MAX_OUTPUT_TOKENS,
    onUsage: (u: any) => { usageLocal = u; opts.onUsage?.(u) }
  })
  const latency_ms = Date.now() - t0
  const parsed = await opts.validate(jsonAny as T)
  return { json: parsed, latency_ms, usage: usageLocal }
}
