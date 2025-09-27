-- Add Stripe customer id to users
ALTER TABLE users ADD COLUMN stripe_customer_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS users_stripe_customer_id_uq ON users(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;