-- Create stock_gifts table for tracking gift stock transfers
CREATE TABLE IF NOT EXISTS stock_gifts (
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

-- Create index on to_email for faster lookups
CREATE INDEX idx_stock_gifts_to_email ON stock_gifts(to_email);

-- Create index on to_user_id for faster lookups
CREATE INDEX idx_stock_gifts_to_user_id ON stock_gifts(to_user_id);

-- Create index on status for faster filtering
CREATE INDEX idx_stock_gifts_status ON stock_gifts(status);

-- Enable Row Level Security
ALTER TABLE stock_gifts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see gifts they sent
CREATE POLICY "Users can view gifts they sent"
  ON stock_gifts
  FOR SELECT
  USING (auth.uid() = from_user_id);

-- Policy: Users can see gifts sent to their email
CREATE POLICY "Users can view gifts sent to them"
  ON stock_gifts
  FOR SELECT
  USING (
    to_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR to_user_id = auth.uid()
  );

-- Policy: Users can insert gifts
CREATE POLICY "Users can send gifts"
  ON stock_gifts
  FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

-- Policy: Recipients can update gift status
CREATE POLICY "Recipients can update gift status"
  ON stock_gifts
  FOR UPDATE
  USING (
    to_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR to_user_id = auth.uid()
  )
  WITH CHECK (
    to_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR to_user_id = auth.uid()
  );

-- Function to automatically set to_user_id when gift is accepted
CREATE OR REPLACE FUNCTION set_gift_recipient_user_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND NEW.to_user_id IS NULL THEN
    NEW.to_user_id := auth.uid();
    NEW.accepted_at := NOW();
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update to_user_id and timestamps
CREATE TRIGGER update_stock_gift_user_id
  BEFORE UPDATE ON stock_gifts
  FOR EACH ROW
  EXECUTE FUNCTION set_gift_recipient_user_id();
