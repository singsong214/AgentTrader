/*
  # Create AI Trading Agent Schema

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `full_name` (text, optional)
      - `created_at` (timestamp with timezone)
      - `updated_at` (timestamp with timezone)
    
    - `wallets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `wallet_address` (text, unique)
      - `network` (text, default 'base-goerli')
      - `created_at` (timestamp with timezone)
      - `updated_at` (timestamp with timezone)
    
    - `trades`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `wallet_id` (uuid, references wallets)
      - `asset` (text, e.g., 'ETH', 'BTC')
      - `action` (text, 'buy', 'sell', or 'hold')
      - `amount` (numeric)
      - `price` (numeric, price at execution)
      - `total_value` (numeric, amount * price)
      - `ai_reason` (text, AI's reasoning for the trade)
      - `tx_hash` (text, nullable, blockchain transaction hash)
      - `status` (text, 'pending', 'completed', 'failed')
      - `error_message` (text, nullable)
      - `created_at` (timestamp with timezone)
    
    - `portfolio_snapshots`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `total_value_usd` (numeric)
      - `holdings` (jsonb, e.g., {"BTC": 0.1, "ETH": 2, "USDC": 500})
      - `created_at` (timestamp with timezone)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access only their own data
    
  3. Functions
    - Create trigger to automatically create user profile on signup
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create wallets table
CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  wallet_address text UNIQUE NOT NULL,
  network text DEFAULT 'base-goerli',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wallets"
  ON wallets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wallets"
  ON wallets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wallets"
  ON wallets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create trades table
CREATE TABLE IF NOT EXISTS trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  wallet_id uuid REFERENCES wallets(id) ON DELETE SET NULL,
  asset text NOT NULL,
  action text NOT NULL CHECK (action IN ('buy', 'sell', 'hold')),
  amount numeric NOT NULL DEFAULT 0,
  price numeric NOT NULL DEFAULT 0,
  total_value numeric NOT NULL DEFAULT 0,
  ai_reason text,
  tx_hash text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  error_message text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trades"
  ON trades FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trades"
  ON trades FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create portfolio_snapshots table
CREATE TABLE IF NOT EXISTS portfolio_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  total_value_usd numeric NOT NULL DEFAULT 0,
  holdings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE portfolio_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own portfolio snapshots"
  ON portfolio_snapshots FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own portfolio snapshots"
  ON portfolio_snapshots FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create function to handle user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_created_at ON trades(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_user_id ON portfolio_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_created_at ON portfolio_snapshots(created_at DESC);