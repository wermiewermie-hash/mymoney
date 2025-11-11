-- Drop existing table if it exists (this will cascade and remove all policies)
DROP TABLE IF EXISTS stock_gifts CASCADE;

-- Create the stock_gifts table
CREATE TABLE stock_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_email TEXT NOT NULL,
  to_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  parent_name TEXT NOT NULL,
  stock_amount INTEGER NOT NULL CHECK (stock_amount > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_stock_gifts_to_email ON stock_gifts(to_email);
CREATE INDEX idx_stock_gifts_from_user_id ON stock_gifts(from_user_id);
CREATE INDEX idx_stock_gifts_status ON stock_gifts(status);

-- Enable Row Level Security
ALTER TABLE stock_gifts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view gifts they sent
CREATE POLICY "Users can view gifts they sent"
  ON stock_gifts
  FOR SELECT
  USING (auth.uid() = from_user_id);

-- Users can view gifts sent to their email
CREATE POLICY "Users can view gifts sent to them"
  ON stock_gifts
  FOR SELECT
  USING (
    auth.jwt() ->> 'email' IS NOT NULL
    AND LOWER(TRIM(to_email)) = LOWER(TRIM(auth.jwt() ->> 'email'))
  );

-- Users can insert gifts they're sending
CREATE POLICY "Users can insert gifts"
  ON stock_gifts
  FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

-- Users can update gifts sent to their email (to accept/reject)
CREATE POLICY "Users can update gifts sent to them"
  ON stock_gifts
  FOR UPDATE
  USING (
    auth.jwt() ->> 'email' IS NOT NULL
    AND LOWER(TRIM(to_email)) = LOWER(TRIM(auth.jwt() ->> 'email'))
  );

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_stock_gifts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_stock_gifts_updated_at_trigger
  BEFORE UPDATE ON stock_gifts
  FOR EACH ROW
  EXECUTE FUNCTION update_stock_gifts_updated_at();
