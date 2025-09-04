export type ConsensusV2 = {
  decision?: string;
  summary?: string;
  consensus_bullets?: string[];
  top_risks?: string[];
  conditions?: string[];
  rationale_bullets?: string[];
  disagreements?: string[];
  review_horizon_days?: number;
  confidence?: number; // 0..1
  source_map?: {
    STRATEGIST?: string[];
    FUTURIST?: string[];
    PSYCHOLOGIST?: string[];
  };
};

export function isConsensusV2(x: any): x is ConsensusV2 {
  if (!x || typeof x !== 'object') return false;
  // minimal signal: presence of any v2 field
  return (
    'decision' in x || 'consensus_bullets' in x || 'rationale_bullets' in x ||
    'disagreements' in x || 'review_horizon_days' in x || 'confidence' in x
  );
}

export function confidencePct(x?: number) {
  if (typeof x !== 'number' || isNaN(x)) return null;
  return Math.round(Math.min(1, Math.max(0, x)) * 100);
}
