-- Create payment_logs table for audit trail
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS payment_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('create_payment', 'confirm_payment', 'payment_failed', 'payment_success', 'rate_limit_exceeded')),
  transaction_id TEXT,
  plan_id TEXT,
  amount DECIMAL(10, 2),
  currency TEXT DEFAULT 'USD',
  payment_method TEXT,
  ip_address TEXT,
  user_agent TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_payment_logs_user_id ON payment_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_transaction_id ON payment_logs(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_action ON payment_logs(action);
CREATE INDEX IF NOT EXISTS idx_payment_logs_created_at ON payment_logs(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can insert/read (logs are server-side only)
CREATE POLICY "Service role can manage payment logs"
  ON payment_logs
  FOR ALL
  USING (auth.role() = 'service_role');

-- Optional: Policy for users to view their own logs (if you want to show them)
-- CREATE POLICY "Users can view their own payment logs"
--   ON payment_logs
--   FOR SELECT
--   USING (auth.uid()::text = user_id);

COMMENT ON TABLE payment_logs IS 'Audit trail for all payment-related actions';
COMMENT ON COLUMN payment_logs.action IS 'Type of action: create_payment, confirm_payment, payment_failed, payment_success, rate_limit_exceeded';
COMMENT ON COLUMN payment_logs.metadata IS 'Additional context data as JSON';
