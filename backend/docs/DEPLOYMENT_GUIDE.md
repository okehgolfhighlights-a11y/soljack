# 🚀 DATABASE & BACKEND DEPLOYMENT GUIDE

Complete setup instructions for SolJack Riviera backend.

---

## PACKAGE CONTENTS

**Database:**
- `001_cosmetics_system.sql` - Complete migration

**API:**
- `API_SPECIFICATION.md` - All endpoints documented

**Docs:**
- This deployment guide

---

## 1. DATABASE SETUP

### Prerequisites

- PostgreSQL 14+ installed
- Existing SolJack database
- Admin access

### Run Migration

```bash
# Connect to database
psql -U your_user -d soljack_db

# Run migration
\i backend/migrations/001_cosmetics_system.sql
```

### Verify Migration

```sql
-- Check new columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name LIKE '%cosmetic%';

-- Check functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_type = 'FUNCTION' 
  AND routine_name LIKE '%cosmetic%';

-- Check views exist
SELECT table_name 
FROM information_schema.views 
WHERE table_name LIKE '%leaderboard%';
```

---

## 2. WHAT THE MIGRATION ADDS

### New User Columns

```sql
owned_card_backs    TEXT[]    -- Array of owned card back IDs
selected_card_back  TEXT      -- Currently selected card back
owned_table_skins   TEXT[]    -- Array of owned table skin IDs
selected_table_skin TEXT      -- Currently selected table skin
total_spent_sol     DECIMAL   -- Total SOL spent on cosmetics
cosmetics_purchased INTEGER   -- Number of cosmetics purchased
```

### New Tables

**cosmetic_purchases:**
- Tracks all cosmetic purchases
- Links to Solana transactions
- Prevents duplicate purchases

**referrals:**
- Tracks referrer/referred relationships
- Monitors referral volume
- Calculates rewards

### New Views

**live_stats:**
- Real-time player counts
- Total volume
- Cosmetics revenue
- New players (24h)

**recent_winners:**
- Last 20 wins
- Tournament + PvP
- 24-hour window

**Leaderboards:**
- Tournament Champions (by tournament wins)
- PvP Masters (by PvP wins)
- Profit Kings (by lifetime profit)

### Helper Functions

**add_cosmetic_to_user():**
- Adds cosmetic to user's owned array
- Prevents duplicates

**record_cosmetic_purchase():**
- Records purchase
- Adds cosmetic to user
- Updates user totals

**user_owns_cosmetic():**
- Checks if user owns a cosmetic
- Returns boolean

---

## 3. BACKEND API IMPLEMENTATION

### Tech Stack

**Recommended:**
- Node.js + Express
- TypeScript
- @solana/web3.js
- pg (PostgreSQL client)
- ws (WebSockets)

### Install Dependencies

```bash
npm install express pg ws @solana/web3.js
npm install --save-dev @types/express @types/pg @types/ws typescript
```

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/soljack_db

# Solana
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
FEE_WALLET=7KwQDkHVKGJ5BQ89JN83XeG1kvWdFHhf7QH5o67jiym4
REFERRAL_WALLET=4v4gxWYUFSQKhdSX2D94ciNxjK9Z4ZAq3wgm4Dm1rFni

# Server
PORT=3000
NODE_ENV=production
```

### Basic Server Setup

```typescript
import express from 'express';
import { Pool } from 'pg';
import { WebSocketServer } from 'ws';

const app = express();
const db = new Pool({ connectionString: process.env.DATABASE_URL });
const wss = new WebSocketServer({ port: 8080 });

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
```

---

## 4. IMPLEMENTING API ENDPOINTS

### Example: Get User Cosmetics

```typescript
app.get('/api/users/:wallet/cosmetics', async (req, res) => {
  const { wallet } = req.params;
  
  try {
    const result = await db.query(`
      SELECT 
        owned_card_backs,
        selected_card_back,
        owned_table_skins,
        selected_table_skin
      FROM users 
      WHERE wallet = $1
    `, [wallet]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});
```

### Example: Record Purchase

```typescript
import { Connection, PublicKey } from '@solana/web3.js';

const connection = new Connection(process.env.SOLANA_RPC_URL!);
const FEE_WALLET = new PublicKey(process.env.FEE_WALLET!);

app.post('/api/cosmetics/purchase', async (req, res) => {
  const { wallet, itemType, itemId, priceSol, txSignature } = req.body;
  
  try {
    // 1. Verify transaction on Solana
    const tx = await connection.getTransaction(txSignature);
    
    if (!tx) {
      return res.status(400).json({ error: 'Transaction not found' });
    }
    
    // 2. Verify amount and recipient
    const transfer = tx.meta?.preBalances && tx.meta?.postBalances
      ? (tx.meta.preBalances[0] - tx.meta.postBalances[0]) / 1e9
      : 0;
    
    if (Math.abs(transfer - priceSol) > 0.001) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    
    // 3. Record purchase using database function
    const result = await db.query(`
      SELECT record_cosmetic_purchase($1, $2, $3, $4, $5) as success
    `, [wallet, itemType, itemId, priceSol, txSignature]);
    
    res.json({ success: result.rows[0].success });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Purchase failed' });
  }
});
```

---

## 5. WEBSOCKET IMPLEMENTATION

### Live Stats Broadcasting

```typescript
// Broadcast stats every 30 seconds
setInterval(async () => {
  const stats = await db.query('SELECT * FROM live_stats');
  
  wss.clients.forEach(client => {
    if (client.readyState === 1) { // OPEN
      client.send(JSON.stringify({
        type: 'stats_update',
        data: stats.rows[0]
      }));
    }
  });
}, 30000);
```

### Recent Winners Broadcasting

```typescript
// Call this when a game completes
async function broadcastWinner(gameResult) {
  const winner = {
    wallet: gameResult.winnerWallet,
    amount: gameResult.prizeSol,
    type: gameResult.gameType,
    wonAt: new Date()
  };
  
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify({
        type: 'new_winner',
        data: winner
      }));
    }
  });
}
```

---

## 6. TESTING

### Test Migration

```sql
-- Test adding cosmetic to user
SELECT add_cosmetic_to_user(
  'test_wallet',
  'card_back',
  'gold-finale'
);

-- Verify it was added
SELECT owned_card_backs 
FROM users 
WHERE wallet = 'test_wallet';

-- Test purchase recording
SELECT record_cosmetic_purchase(
  'test_wallet',
  'table_skin',
  'tokyo-neon',
  0.01,
  'test_tx_signature_123'
);

-- Check purchase was recorded
SELECT * FROM cosmetic_purchases 
WHERE user_wallet = 'test_wallet';
```

### Test API Endpoints

```bash
# Test get cosmetics
curl http://localhost:3000/api/users/test_wallet/cosmetics

# Test update selection
curl -X PATCH http://localhost:3000/api/users/test_wallet/cosmetics \
  -H "Content-Type: application/json" \
  -d '{"selectedCardBack":"gold-finale"}'

# Test stats
curl http://localhost:3000/api/stats

# Test leaderboard
curl http://localhost:3000/api/leaderboard/tournament-champions
```

---

## 7. PRODUCTION DEPLOYMENT

### Database Backups

```bash
# Backup before migration
pg_dump soljack_db > backup_before_migration.sql

# Automated daily backups
0 2 * * * pg_dump soljack_db | gzip > /backups/soljack_$(date +\%Y\%m\%d).sql.gz
```

### Monitoring

```sql
-- Monitor cosmetic purchases
SELECT 
  DATE(purchased_at) as date,
  COUNT(*) as purchases,
  SUM(price_sol) as revenue
FROM cosmetic_purchases
GROUP BY DATE(purchased_at)
ORDER BY date DESC;

-- Monitor active users
SELECT COUNT(*) 
FROM users 
WHERE last_active > NOW() - INTERVAL '24 hours';

-- Check database size
SELECT pg_size_pretty(pg_database_size('soljack_db'));
```

### Performance

```sql
-- Add indexes if needed
CREATE INDEX IF NOT EXISTS idx_users_last_active 
  ON users(last_active DESC);

CREATE INDEX IF NOT EXISTS idx_games_completed 
  ON games(completed_at DESC) 
  WHERE winner_wallet IS NOT NULL;

-- Analyze tables
ANALYZE users;
ANALYZE cosmetic_purchases;
ANALYZE games;
```

---

## 8. TROUBLESHOOTING

### Migration Fails

**Problem:** Columns already exist
**Solution:**
```sql
-- Use IF NOT EXISTS in ALTER statements
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS owned_card_backs TEXT[];
```

**Problem:** Constraint violations
**Solution:**
```sql
-- Drop constraints first
ALTER TABLE users DROP CONSTRAINT IF EXISTS valid_selected_card_back;

-- Then add with proper checks
ALTER TABLE users
ADD CONSTRAINT valid_selected_card_back 
  CHECK (selected_card_back = ANY(owned_card_backs));
```

### Purchase Not Recording

**Problem:** Transaction verification failing
**Check:**
```typescript
console.log('TX:', tx);
console.log('Transfer amount:', transfer);
console.log('Expected:', priceSol);
```

**Problem:** Duplicate transaction error
**Solution:**
```sql
-- Check if already recorded
SELECT * FROM cosmetic_purchases 
WHERE tx_signature = 'your_signature';
```

### WebSocket Not Connecting

**Check:**
```bash
# Verify WebSocket server running
netstat -an | grep 8080

# Test connection
wscat -c ws://localhost:8080
```

---

## 9. SECURITY CHECKLIST

- [ ] SQL injection protection (use parameterized queries)
- [ ] Validate all user inputs
- [ ] Verify Solana transactions on-chain
- [ ] Rate limiting implemented
- [ ] CORS configured properly
- [ ] Environment variables secured
- [ ] Database credentials encrypted
- [ ] HTTPS in production
- [ ] WebSocket authentication
- [ ] Regular security audits

---

## 10. SCALABILITY

### Database Optimization

```sql
-- Partition large tables
CREATE TABLE cosmetic_purchases_2024 
  PARTITION OF cosmetic_purchases
  FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

-- Vacuum regularly
VACUUM ANALYZE cosmetic_purchases;
```

### Caching

```typescript
import Redis from 'redis';

const redis = Redis.createClient();

// Cache stats for 30 seconds
app.get('/api/stats', async (req, res) => {
  const cached = await redis.get('stats');
  
  if (cached) {
    return res.json(JSON.parse(cached));
  }
  
  const stats = await db.query('SELECT * FROM live_stats');
  await redis.setex('stats', 30, JSON.stringify(stats.rows[0]));
  
  res.json(stats.rows[0]);
});
```

---

## 11. COMPLETE DEPLOYMENT CHECKLIST

### Pre-Deployment

- [ ] Database backed up
- [ ] Migration tested on staging
- [ ] API endpoints tested
- [ ] WebSocket tested
- [ ] Environment variables configured
- [ ] Monitoring setup

### Deployment

- [ ] Run database migration
- [ ] Deploy backend code
- [ ] Start WebSocket server
- [ ] Verify all endpoints working
- [ ] Test purchase flow end-to-end
- [ ] Monitor for errors

### Post-Deployment

- [ ] Verify stats updating
- [ ] Check cosmetics purchases working
- [ ] Monitor database performance
- [ ] Check WebSocket connections
- [ ] Review logs for errors
- [ ] Test on production

---

🗄️ **DATABASE & BACKEND COMPLETE!**

Everything you need to deploy the SolJack Riviera backend!
