-- 🗄️ SOLJACK RIVIERA - COMPLETE DATABASE SCHEMA
-- PostgreSQL Migration for Cosmetics & User Data

-- ============================================
-- 1. USER COSMETICS SCHEMA
-- ============================================

-- Add cosmetics columns to existing users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS owned_card_backs TEXT[] DEFAULT ARRAY['default'],
ADD COLUMN IF NOT EXISTS selected_card_back TEXT DEFAULT 'default',
ADD COLUMN IF NOT EXISTS owned_table_skins TEXT[] DEFAULT ARRAY['default'],
ADD COLUMN IF NOT EXISTS selected_table_skin TEXT DEFAULT 'default',
ADD COLUMN IF NOT EXISTS total_spent_sol DECIMAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS cosmetics_purchased INTEGER DEFAULT 0;

-- Add constraints
ALTER TABLE users
ADD CONSTRAINT valid_selected_card_back 
  CHECK (selected_card_back = ANY(owned_card_backs)),
ADD CONSTRAINT valid_selected_table_skin 
  CHECK (selected_table_skin = ANY(owned_table_skins));

-- ============================================
-- 2. COSMETIC PURCHASES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS cosmetic_purchases (
  id SERIAL PRIMARY KEY,
  user_wallet TEXT NOT NULL,
  item_type TEXT NOT NULL, -- 'card_back' or 'table_skin'
  item_id TEXT NOT NULL,
  price_sol DECIMAL NOT NULL,
  tx_signature TEXT NOT NULL UNIQUE,
  purchased_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT fk_user_wallet 
    FOREIGN KEY (user_wallet) REFERENCES users(wallet) ON DELETE CASCADE,
  CONSTRAINT valid_item_type 
    CHECK (item_type IN ('card_back', 'table_skin')),
  CONSTRAINT valid_price 
    CHECK (price_sol >= 0)
);

-- Indexes for fast lookups
CREATE INDEX idx_cosmetic_purchases_wallet ON cosmetic_purchases(user_wallet);
CREATE INDEX idx_cosmetic_purchases_type ON cosmetic_purchases(item_type);
CREATE INDEX idx_cosmetic_purchases_date ON cosmetic_purchases(purchased_at DESC);

-- ============================================
-- 3. TOURNAMENT ENHANCEMENTS
-- ============================================

-- Add finals tracking to tournaments table
ALTER TABLE tournaments
ADD COLUMN IF NOT EXISTS finals_table_skin TEXT DEFAULT 'gold-finale',
ADD COLUMN IF NOT EXISTS finals_card_back TEXT DEFAULT 'gold-finale',
ADD COLUMN IF NOT EXISTS finals_started_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS finals_player1 TEXT,
ADD COLUMN IF NOT EXISTS finals_player2 TEXT;

-- Add finals flag to tournament_matches table
ALTER TABLE tournament_matches
ADD COLUMN IF NOT EXISTS is_finals BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS table_skin_used TEXT,
ADD COLUMN IF NOT EXISTS card_back_used TEXT;

-- ============================================
-- 4. STATS TRACKING
-- ============================================

-- Enhanced user stats
ALTER TABLE users
ADD COLUMN IF NOT EXISTS total_hands_played INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_wins INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_losses INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS biggest_win_sol DECIMAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_win_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_win_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tournament_wins INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS pvp_wins INTEGER DEFAULT 0;

-- ============================================
-- 5. REFERRAL SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS referrals (
  id SERIAL PRIMARY KEY,
  referrer_wallet TEXT NOT NULL,
  referred_wallet TEXT NOT NULL UNIQUE,
  referred_at TIMESTAMP DEFAULT NOW(),
  total_volume_sol DECIMAL DEFAULT 0,
  last_activity_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT fk_referrer 
    FOREIGN KEY (referrer_wallet) REFERENCES users(wallet) ON DELETE CASCADE,
  CONSTRAINT fk_referred 
    FOREIGN KEY (referred_wallet) REFERENCES users(wallet) ON DELETE CASCADE,
  CONSTRAINT no_self_referral 
    CHECK (referrer_wallet != referred_wallet)
);

CREATE INDEX idx_referrals_referrer ON referrals(referrer_wallet);
CREATE INDEX idx_referrals_referred ON referrals(referred_wallet);

-- ============================================
-- 6. LIVE STATS VIEW
-- ============================================

CREATE OR REPLACE VIEW live_stats AS
SELECT 
  COUNT(DISTINCT wallet) as total_players,
  COUNT(DISTINCT CASE 
    WHEN last_active > NOW() - INTERVAL '5 minutes' 
    THEN wallet 
  END) as online_players,
  COALESCE(SUM(total_wagered_sol), 0) as total_volume,
  COALESCE(SUM(total_spent_sol), 0) as cosmetics_revenue,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as new_players_24h
FROM users;

-- ============================================
-- 7. RECENT WINNERS VIEW
-- ============================================

CREATE OR REPLACE VIEW recent_winners AS
SELECT 
  g.winner_wallet as wallet,
  g.prize_sol as amount,
  CASE 
    WHEN g.game_type = 'tournament' THEN 'Tournament'
    WHEN g.game_type = 'pvp' THEN 'PvP'
    ELSE 'Practice'
  END as type,
  g.completed_at as won_at
FROM games g
WHERE g.winner_wallet IS NOT NULL
  AND g.completed_at > NOW() - INTERVAL '24 hours'
ORDER BY g.completed_at DESC
LIMIT 20;

-- ============================================
-- 8. LEADERBOARDS
-- ============================================

-- Tournament Champions Leaderboard
CREATE OR REPLACE VIEW leaderboard_tournament_champions AS
SELECT 
  wallet,
  username,
  tournament_wins,
  total_wins,
  ROW_NUMBER() OVER (ORDER BY tournament_wins DESC, total_wins DESC) as rank
FROM users
WHERE tournament_wins > 0
ORDER BY tournament_wins DESC, total_wins DESC
LIMIT 100;

-- PvP Masters Leaderboard
CREATE OR REPLACE VIEW leaderboard_pvp_masters AS
SELECT 
  wallet,
  username,
  pvp_wins,
  total_wins,
  ROW_NUMBER() OVER (ORDER BY pvp_wins DESC, total_wins DESC) as rank
FROM users
WHERE pvp_wins > 0
ORDER BY pvp_wins DESC, total_wins DESC
LIMIT 100;

-- Profit Kings Leaderboard
CREATE OR REPLACE VIEW leaderboard_profit_kings AS
SELECT 
  wallet,
  username,
  (total_winnings_sol - total_wagered_sol) as profit_sol,
  total_winnings_sol,
  total_wagered_sol,
  ROW_NUMBER() OVER (ORDER BY (total_winnings_sol - total_wagered_sol) DESC) as rank
FROM users
WHERE (total_winnings_sol - total_wagered_sol) > 0
ORDER BY (total_winnings_sol - total_wagered_sol) DESC
LIMIT 100;

-- ============================================
-- 9. HELPER FUNCTIONS
-- ============================================

-- Function to add cosmetic to user
CREATE OR REPLACE FUNCTION add_cosmetic_to_user(
  p_wallet TEXT,
  p_item_type TEXT,
  p_item_id TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  IF p_item_type = 'card_back' THEN
    UPDATE users 
    SET owned_card_backs = array_append(owned_card_backs, p_item_id)
    WHERE wallet = p_wallet
      AND NOT (p_item_id = ANY(owned_card_backs));
  ELSIF p_item_type = 'table_skin' THEN
    UPDATE users 
    SET owned_table_skins = array_append(owned_table_skins, p_item_id)
    WHERE wallet = p_wallet
      AND NOT (p_item_id = ANY(owned_table_skins));
  ELSE
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to record cosmetic purchase
CREATE OR REPLACE FUNCTION record_cosmetic_purchase(
  p_wallet TEXT,
  p_item_type TEXT,
  p_item_id TEXT,
  p_price_sol DECIMAL,
  p_tx_signature TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  -- Insert purchase record
  INSERT INTO cosmetic_purchases (
    user_wallet, item_type, item_id, price_sol, tx_signature
  ) VALUES (
    p_wallet, p_item_type, p_item_id, p_price_sol, p_tx_signature
  );
  
  -- Add cosmetic to user
  PERFORM add_cosmetic_to_user(p_wallet, p_item_type, p_item_id);
  
  -- Update user totals
  UPDATE users
  SET 
    total_spent_sol = total_spent_sol + p_price_sol,
    cosmetics_purchased = cosmetics_purchased + 1
  WHERE wallet = p_wallet;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user owns cosmetic
CREATE OR REPLACE FUNCTION user_owns_cosmetic(
  p_wallet TEXT,
  p_item_type TEXT,
  p_item_id TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_owns BOOLEAN;
BEGIN
  IF p_item_type = 'card_back' THEN
    SELECT p_item_id = ANY(owned_card_backs) INTO v_owns
    FROM users WHERE wallet = p_wallet;
  ELSIF p_item_type = 'table_skin' THEN
    SELECT p_item_id = ANY(owned_table_skins) INTO v_owns
    FROM users WHERE wallet = p_wallet;
  ELSE
    v_owns := FALSE;
  END IF;
  
  RETURN COALESCE(v_owns, FALSE);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 10. TRIGGERS
-- ============================================

-- Update last_active on any user activity
CREATE OR REPLACE FUNCTION update_last_active()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_active = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_last_active
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_last_active();

-- ============================================
-- 11. INITIAL DATA
-- ============================================

-- Ensure default cosmetics exist for all users
UPDATE users
SET 
  owned_card_backs = ARRAY['default']
WHERE owned_card_backs IS NULL OR array_length(owned_card_backs, 1) IS NULL;

UPDATE users
SET 
  owned_table_skins = ARRAY['default']
WHERE owned_table_skins IS NULL OR array_length(owned_table_skins, 1) IS NULL;

UPDATE users
SET 
  selected_card_back = 'default'
WHERE selected_card_back IS NULL;

UPDATE users
SET 
  selected_table_skin = 'default'
WHERE selected_table_skin IS NULL;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Verify migration
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Tables created/updated: users, cosmetic_purchases, referrals';
  RAISE NOTICE 'Views created: live_stats, recent_winners, leaderboards';
  RAISE NOTICE 'Functions created: add_cosmetic_to_user, record_cosmetic_purchase, user_owns_cosmetic';
END $$;
