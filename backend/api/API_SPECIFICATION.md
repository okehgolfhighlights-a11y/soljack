# 🔌 SOLJACK RIVIERA - API ENDPOINTS

Complete API specification for cosmetics, stats, and user data.

---

## BASE URL

```
Production: https://api.soljack.online
Development: http://localhost:3000
```

---

## AUTHENTICATION

All endpoints require wallet signature verification.

```typescript
// Headers required
{
  'x-wallet-address': string,
  'x-wallet-signature': string,
  'x-message': string
}
```

---

## 1. USER COSMETICS

### GET `/api/users/:wallet/cosmetics`

**Description:** Get user's owned and selected cosmetics

**Response:**
```json
{
  "ownedCardBacks": ["default", "pumpfun", "gold-finale"],
  "selectedCardBack": "gold-finale",
  "ownedTableSkins": ["default", "tokyo-neon"],
  "selectedTableSkin": "default",
  "totalSpent": 0.12,
  "cosmeticsPurchased": 3
}
```

**Implementation:**
```typescript
app.get('/api/users/:wallet/cosmetics', async (req, res) => {
  const { wallet } = req.params;
  
  const result = await db.query(`
    SELECT 
      owned_card_backs as "ownedCardBacks",
      selected_card_back as "selectedCardBack",
      owned_table_skins as "ownedTableSkins",
      selected_table_skin as "selectedTableSkin",
      total_spent_sol as "totalSpent",
      cosmetics_purchased as "cosmeticsPurchased"
    FROM users 
    WHERE wallet = $1
  `, [wallet]);
  
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json(result.rows[0]);
});
```

---

### PATCH `/api/users/:wallet/cosmetics`

**Description:** Update selected cosmetics

**Request Body:**
```json
{
  "selectedCardBack": "gold-finale",
  "selectedTableSkin": "default"
}
```

**Response:**
```json
{
  "success": true,
  "selectedCardBack": "gold-finale",
  "selectedTableSkin": "default"
}
```

**Implementation:**
```typescript
app.patch('/api/users/:wallet/cosmetics', async (req, res) => {
  const { wallet } = req.params;
  const { selectedCardBack, selectedTableSkin } = req.body;
  
  // Verify user owns the cosmetics
  const user = await db.query(`
    SELECT owned_card_backs, owned_table_skins 
    FROM users WHERE wallet = $1
  `, [wallet]);
  
  if (user.rows.length === 0) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const { owned_card_backs, owned_table_skins } = user.rows[0];
  
  if (selectedCardBack && !owned_card_backs.includes(selectedCardBack)) {
    return res.status(400).json({ error: 'Card back not owned' });
  }
  
  if (selectedTableSkin && !owned_table_skins.includes(selectedTableSkin)) {
    return res.status(400).json({ error: 'Table skin not owned' });
  }
  
  // Update selections
  await db.query(`
    UPDATE users 
    SET 
      selected_card_back = COALESCE($1, selected_card_back),
      selected_table_skin = COALESCE($2, selected_table_skin)
    WHERE wallet = $3
  `, [selectedCardBack, selectedTableSkin, wallet]);
  
  res.json({
    success: true,
    selectedCardBack: selectedCardBack || user.rows[0].selected_card_back,
    selectedTableSkin: selectedTableSkin || user.rows[0].selected_table_skin
  });
});
```

---

## 2. COSMETIC PURCHASES

### POST `/api/cosmetics/purchase`

**Description:** Record a cosmetic purchase

**Request Body:**
```json
{
  "wallet": "7KwQ...jiym4",
  "itemType": "card_back",
  "itemId": "gold-finale",
  "priceSol": 0.1,
  "txSignature": "5Xm...abc123"
}
```

**Response:**
```json
{
  "success": true,
  "purchaseId": 42,
  "itemAdded": true
}
```

**Implementation:**
```typescript
app.post('/api/cosmetics/purchase', async (req, res) => {
  const { wallet, itemType, itemId, priceSol, txSignature } = req.body;
  
  // Validate item type
  if (!['card_back', 'table_skin'].includes(itemType)) {
    return res.status(400).json({ error: 'Invalid item type' });
  }
  
  // Validate price
  const validPrices = {
    'card_back': {
      'default': 0,
      'pumpfun': 0.01,
      'solana': 0.01,
      'gold-finale': 0.1
    },
    'table_skin': {
      'default': 0,
      'gold-finale': 0.1,
      'tokyo-neon': 0.01
    }
  };
  
  const expectedPrice = validPrices[itemType][itemId];
  if (expectedPrice === undefined) {
    return res.status(400).json({ error: 'Invalid item ID' });
  }
  
  if (priceSol !== expectedPrice) {
    return res.status(400).json({ error: 'Invalid price' });
  }
  
  // Verify transaction on Solana blockchain
  const txValid = await verifyTransaction(txSignature, wallet, priceSol);
  if (!txValid) {
    return res.status(400).json({ error: 'Invalid transaction' });
  }
  
  try {
    // Use database function to record purchase
    const result = await db.query(`
      SELECT record_cosmetic_purchase($1, $2, $3, $4, $5) as success
    `, [wallet, itemType, itemId, priceSol, txSignature]);
    
    if (!result.rows[0].success) {
      return res.status(500).json({ error: 'Failed to record purchase' });
    }
    
    // Get purchase ID
    const purchase = await db.query(`
      SELECT id FROM cosmetic_purchases 
      WHERE tx_signature = $1
    `, [txSignature]);
    
    res.json({
      success: true,
      purchaseId: purchase.rows[0].id,
      itemAdded: true
    });
    
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({ error: 'Purchase failed' });
  }
});
```

---

### GET `/api/cosmetics/available`

**Description:** Get all available cosmetics with prices

**Response:**
```json
{
  "cardBacks": [
    { "id": "default", "name": "Pump.fun × Cinque Terre", "price": 0 },
    { "id": "pumpfun", "name": "Pump.fun Pill", "price": 0.01 },
    { "id": "solana", "name": "Solana Edition", "price": 0.01 },
    { "id": "gold-finale", "name": "All Gold Finale", "price": 0.1 }
  ],
  "tableSkins": [
    { "id": "default", "name": "Mediterranean Coastal", "price": 0 },
    { "id": "gold-finale", "name": "All Gold Finale", "price": 0.1 },
    { "id": "tokyo-neon", "name": "Tokyo Neon", "price": 0.01 }
  ]
}
```

---

## 3. LIVE STATS

### GET `/api/stats`

**Description:** Get live platform statistics

**Response:**
```json
{
  "totalPlayers": 15234,
  "onlinePlayers": 423,
  "totalVolume": 12547.5,
  "cosmeticsRevenue": 234.8,
  "newPlayers24h": 89
}
```

**Implementation:**
```typescript
app.get('/api/stats', async (req, res) => {
  const stats = await db.query(`SELECT * FROM live_stats`);
  res.json(stats.rows[0]);
});
```

---

## 4. RECENT WINNERS

### GET `/api/winners/recent`

**Description:** Get recent winners for homepage ticker

**Response:**
```json
{
  "winners": [
    {
      "wallet": "7KwQ...jiym4",
      "amount": 1.5,
      "type": "Tournament",
      "wonAt": "2024-02-15T10:30:00Z"
    }
  ]
}
```

**Implementation:**
```typescript
app.get('/api/winners/recent', async (req, res) => {
  const winners = await db.query(`
    SELECT * FROM recent_winners LIMIT 10
  `);
  res.json({ winners: winners.rows });
});
```

---

## 5. LEADERBOARDS

### GET `/api/leaderboard/:type`

**Description:** Get leaderboard by type

**Types:** `tournament-champions`, `pvp-masters`, `profit-kings`

**Response:**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "wallet": "7KwQ...jiym4",
      "username": "ChampionPlayer",
      "tournamentWins": 12,
      "totalWins": 234
    }
  ]
}
```

**Implementation:**
```typescript
app.get('/api/leaderboard/:type', async (req, res) => {
  const { type } = req.params;
  
  const viewMap = {
    'tournament-champions': 'leaderboard_tournament_champions',
    'pvp-masters': 'leaderboard_pvp_masters',
    'profit-kings': 'leaderboard_profit_kings'
  };
  
  const view = viewMap[type];
  if (!view) {
    return res.status(400).json({ error: 'Invalid leaderboard type' });
  }
  
  const leaderboard = await db.query(`SELECT * FROM ${view} LIMIT 100`);
  res.json({ leaderboard: leaderboard.rows });
});
```

---

## 6. USER STATS

### GET `/api/users/:wallet/stats`

**Description:** Get detailed user statistics

**Response:**
```json
{
  "totalHandsPlayed": 1523,
  "totalWins": 789,
  "totalLosses": 734,
  "winRate": 0.518,
  "biggestWin": 2.5,
  "longestWinStreak": 12,
  "currentWinStreak": 3,
  "tournamentWins": 5,
  "pvpWins": 784,
  "lifetimeProfit": 45.7
}
```

**Implementation:**
```typescript
app.get('/api/users/:wallet/stats', async (req, res) => {
  const { wallet } = req.params;
  
  const stats = await db.query(`
    SELECT 
      total_hands_played as "totalHandsPlayed",
      total_wins as "totalWins",
      total_losses as "totalLosses",
      CASE 
        WHEN total_hands_played > 0 
        THEN CAST(total_wins AS DECIMAL) / total_hands_played 
        ELSE 0 
      END as "winRate",
      biggest_win_sol as "biggestWin",
      longest_win_streak as "longestWinStreak",
      current_win_streak as "currentWinStreak",
      tournament_wins as "tournamentWins",
      pvp_wins as "pvpWins",
      (total_winnings_sol - total_wagered_sol) as "lifetimeProfit"
    FROM users
    WHERE wallet = $1
  `, [wallet]);
  
  if (stats.rows.length === 0) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json(stats.rows[0]);
});
```

---

## WEBSOCKET EVENTS

### Live Stats Updates

```typescript
// Server
wss.on('connection', (ws) => {
  const statsInterval = setInterval(async () => {
    const stats = await db.query('SELECT * FROM live_stats');
    ws.send(JSON.stringify({
      type: 'stats_update',
      data: stats.rows[0]
    }));
  }, 30000); // Every 30 seconds
  
  ws.on('close', () => clearInterval(statsInterval));
});

// Client
const ws = new WebSocket('wss://api.soljack.online/ws');
ws.onmessage = (event) => {
  const { type, data } = JSON.parse(event.data);
  if (type === 'stats_update') {
    updateStats(data);
  }
};
```

### Recent Winners Stream

```typescript
// Server - emit when game completes
function broadcastWinner(winner) {
  wss.clients.forEach(client => {
    client.send(JSON.stringify({
      type: 'new_winner',
      data: winner
    }));
  });
}

// Client
ws.onmessage = (event) => {
  const { type, data } = JSON.parse(event.data);
  if (type === 'new_winner') {
    addWinnerToTicker(data);
  }
};
```

---

## ERROR RESPONSES

All endpoints return consistent error format:

```json
{
  "error": "Error message here",
  "code": "ERROR_CODE"
}
```

**Common Error Codes:**
- `USER_NOT_FOUND` - Wallet not in database
- `INVALID_SIGNATURE` - Wallet signature verification failed
- `ITEM_NOT_OWNED` - User doesn't own the cosmetic
- `INVALID_TRANSACTION` - Blockchain tx verification failed
- `DUPLICATE_PURCHASE` - Transaction already recorded

---

## RATE LIMITING

```
- 100 requests per minute per IP
- 1000 requests per hour per wallet
- WebSocket: 1 connection per wallet
```

---

## EXAMPLE: COMPLETE PURCHASE FLOW

```typescript
// 1. Frontend - initiate purchase
const purchaseCardBack = async (cardBackId: string) => {
  const price = PRICES[cardBackId];
  
  // Create Solana transaction
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: FEE_WALLET,
      lamports: price * LAMPORTS_PER_SOL
    })
  );
  
  // Send transaction
  const signature = await sendTransaction(transaction, connection);
  await connection.confirmTransaction(signature);
  
  // Record purchase on backend
  const response = await fetch('/api/cosmetics/purchase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      wallet: wallet.publicKey.toString(),
      itemType: 'card_back',
      itemId: cardBackId,
      priceSol: price,
      txSignature: signature
    })
  });
  
  const result = await response.json();
  
  if (result.success) {
    // Update local state
    updateOwnedCosmetics();
    showSuccessMessage();
  }
};
```

---

🔌 **API COMPLETE!**

All endpoints documented with implementations and examples.
