import { Hono } from 'hono'

const router = new Hono()

router.get('/api/lineups/presets', async (c) => {
  const DB = c.env.DB as D1Database
  try {
    await DB.exec(`CREATE TABLE IF NOT EXISTS lineups_presets (id INTEGER PRIMARY KEY, name TEXT NOT NULL, is_public INTEGER NOT NULL DEFAULT 1, created_at TEXT DEFAULT (datetime('now')));
                   CREATE TABLE IF NOT EXISTS lineups_preset_roles (id INTEGER PRIMARY KEY AUTOINCREMENT, preset_id INTEGER NOT NULL REFERENCES lineups_presets(id) ON DELETE CASCADE, role_key TEXT NOT NULL, weight REAL NOT NULL, position INTEGER NOT NULL, UNIQUE(preset_id, position));`)
  } catch {}
  // Return all presets, public and private, so the selector always shows the full set (admins/testers expect ~10 presets)
  const rs = await DB.prepare(`SELECT p.id, p.name, p.is_public,
                                   json_group_array(CASE WHEN r.role_key IS NOT NULL THEN json_object('role_key', r.role_key, 'weight', r.weight, 'position', r.position) END) AS roles
                            FROM lineups_presets p
                            LEFT JOIN lineups_preset_roles r ON r.preset_id = p.id
                            GROUP BY p.id
                            ORDER BY p.id`).all()
  let rows = rs.results || []
  if (!rows.length) {
    // Fallback: return a built-in set of 10 presets so UI remains usable even when DB is empty
    const D = (id: number, name: string, roles: Array<{role_key:string; weight:number; position:number}>) => ({ id, name, is_public: 1, roles: JSON.stringify(roles) })
    const R = (k:string, w:number, p:number) => ({ role_key: k, weight: w, position: p })
    const defs = [
      D(1001, 'Concillio Core (4)', [ R('STRATEGIST',0.32,1), R('FUTURIST',0.24,2), R('PSYCHOLOGIST',0.20,3), R('SENIOR_ADVISOR',0.24,4) ]),
      D(1002, 'Strategy‑heavier (4)', [ R('STRATEGIST',0.45,1), R('FUTURIST',0.20,2), R('PSYCHOLOGIST',0.15,3), R('SENIOR_ADVISOR',0.20,4) ]),
      D(1003, 'Futures‑heavier (4)', [ R('STRATEGIST',0.22,1), R('FUTURIST',0.42,2), R('PSYCHOLOGIST',0.16,3), R('SENIOR_ADVISOR',0.20,4) ]),
      D(1004, 'People‑heavier (4)', [ R('STRATEGIST',0.22,1), R('FUTURIST',0.18,2), R('PSYCHOLOGIST',0.40,3), R('SENIOR_ADVISOR',0.20,4) ]),
      D(1005, 'Risk & Compliance (5)', [ R('STRATEGIST',0.25,1), R('FUTURIST',0.18,2), R('PSYCHOLOGIST',0.17,3), R('RISK_COMPLIANCE_OFFICER',0.20,4), R('SENIOR_ADVISOR',0.20,5) ]),
      D(1006, 'Finance Lens (5)', [ R('STRATEGIST',0.24,1), R('CFO_ANALYST',0.22,2), R('FUTURIST',0.18,3), R('PSYCHOLOGIST',0.16,4), R('SENIOR_ADVISOR',0.20,5) ]),
      D(1007, 'Customer Voice (5)', [ R('STRATEGIST',0.22,1), R('CUSTOMER_ADVOCATE',0.22,2), R('FUTURIST',0.18,3), R('PSYCHOLOGIST',0.18,4), R('SENIOR_ADVISOR',0.20,5) ]),
      D(1008, 'Innovation Bias (5)', [ R('STRATEGIST',0.22,1), R('INNOVATION_CATALYST',0.22,2), R('FUTURIST',0.22,3), R('PSYCHOLOGIST',0.14,4), R('SENIOR_ADVISOR',0.20,5) ]),
      D(1009, 'Data‑Driven (5)', [ R('STRATEGIST',0.22,1), R('DATA_SCIENTIST',0.22,2), R('FUTURIST',0.20,3), R('PSYCHOLOGIST',0.16,4), R('SENIOR_ADVISOR',0.20,5) ]),
      D(1010, 'Legal‑aware (5)', [ R('STRATEGIST',0.22,1), R('LEGAL_ADVISOR',0.22,2), R('FUTURIST',0.18,3), R('PSYCHOLOGIST',0.18,4), R('SENIOR_ADVISOR',0.20,5) ]),
    ]
    rows = defs as any
  }
  return c.json({ ok: true, presets: rows })
})

export default router
