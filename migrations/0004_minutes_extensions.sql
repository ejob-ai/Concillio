-- Extend minutes with lineup snapshot and consensus weights
ALTER TABLE minutes ADD COLUMN lineup_snapshot TEXT;
ALTER TABLE minutes ADD COLUMN consensus_weights TEXT;
