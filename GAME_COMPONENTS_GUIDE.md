# 🎮 GAME COMPONENTS - USAGE GUIDE

## Package Contents

**Game Components:**
- `Card.tsx` - Updated card component with custom backs
- `Card.css` - Card styling with animations

**Cosmetics Components:**
- `CardBackSelector.tsx` - Card back selection UI
- `CardBackSelector.css` - Card back selector styling
- `TableSkinSelector.tsx` - Table skin selection UI
- `TableSkinSelector.css` - Table skin selector styling

---

## 1. UPDATED CARD COMPONENT

### Basic Usage

```tsx
import { Card } from './components/game/Card';

// Face-up card with default back
<Card suit="hearts" rank="A" faceUp={true} />

// Face-down card with custom back
<Card 
  suit="spades" 
  rank="K" 
  faceUp={false}
  cardBack="gold-finale"
/>

// Card with animation delay (for dealing sequence)
<Card 
  suit="diamonds" 
  rank="10" 
  faceUp={true}
  delay={350} // Delay animation by 350ms
/>
```

### Card Back Options

```tsx
type CardBack = 'default' | 'pumpfun' | 'solana' | 'gold-finale';

// Default - FREE (Pump.fun × Cinque Terre)
<Card faceUp={false} cardBack="default" />

// Pump.fun - 0.01 SOL
<Card faceUp={false} cardBack="pumpfun" />

// Solana - 0.01 SOL
<Card faceUp={false} cardBack="solana" />

// Gold Finale - 0.1 SOL (Championship)
<Card faceUp={false} cardBack="gold-finale" />
```

### Deal Cards with Animation

```tsx
const dealCards = () => {
  return (
    <div className="card-hand">
      <Card suit="hearts" rank="A" delay={0} />
      <Card suit="spades" rank="K" delay={350} />
      <Card suit="diamonds" rank="Q" delay={700} />
      <Card suit="clubs" rank="J" delay={1050} />
    </div>
  );
};
```

---

## 2. CARD BACK SELECTOR

### Usage in Settings/Shop

```tsx
import { CardBackSelector } from './components/cosmetics/CardBackSelector';

function CosmeticsShop() {
  const [selectedCardBack, setSelectedCardBack] = useState<CardBack>('default');
  const [ownedCardBacks, setOwnedCardBacks] = useState<CardBack[]>(['default']);
  
  const handleSelect = (cardBack: CardBack) => {
    setSelectedCardBack(cardBack);
    // Save to backend
  };
  
  const handlePurchase = async (cardBack: CardBack) => {
    // Show wallet connection
    // Deduct SOL
    // Add to owned cards
    setOwnedCardBacks([...ownedCardBacks, cardBack]);
  };
  
  return (
    <CardBackSelector
      selectedCardBack={selectedCardBack}
      ownedCardBacks={ownedCardBacks}
      onSelect={handleSelect}
      onPurchase={handlePurchase}
    />
  );
}
```

### Integrating with User State

```tsx
// Store in user context or database
interface UserCosmetics {
  ownedCardBacks: CardBack[];
  selectedCardBack: CardBack;
  ownedTableSkins: TableSkin[];
  selectedTableSkin: TableSkin;
}

// Load from backend
const loadUserCosmetics = async (wallet: string): Promise<UserCosmetics> => {
  const response = await fetch(`/api/users/${wallet}/cosmetics`);
  return response.json();
};

// Save selection
const saveCardBackSelection = async (wallet: string, cardBack: CardBack) => {
  await fetch(`/api/users/${wallet}/cosmetics`, {
    method: 'PATCH',
    body: JSON.stringify({ selectedCardBack: cardBack }),
  });
};
```

---

## 3. TABLE SKIN SELECTOR

### Usage

```tsx
import { TableSkinSelector } from './components/cosmetics/TableSkinSelector';

function TableCustomization() {
  const [selectedTableSkin, setSelectedTableSkin] = useState<TableSkin>('default');
  const [ownedTableSkins, setOwnedTableSkins] = useState<TableSkin[]>(['default']);
  
  const handleSelect = (tableSkin: TableSkin) => {
    setSelectedTableSkin(tableSkin);
    // Save to backend
  };
  
  const handlePurchase = async (tableSkin: TableSkin) => {
    // Purchase logic
    setOwnedTableSkins([...ownedTableSkins, tableSkin]);
  };
  
  return (
    <TableSkinSelector
      selectedTableSkin={selectedTableSkin}
      ownedTableSkins={ownedTableSkins}
      onSelect={handleSelect}
      onPurchase={handlePurchase}
    />
  );
}
```

### Applying Table Skin to Game

```tsx
function GameTable({ userTableSkin, isTournamentFinals }) {
  // Auto-apply gold in finals
  const activeTableSkin = isTournamentFinals 
    ? 'gold-finale' 
    : userTableSkin;
  
  const tableBackground = {
    default: '/assets/tables/table-skin-default.jpg',
    'gold-finale': '/assets/tables/table-skin-gold-finale.jpg',
    'tokyo-neon': '/assets/tables/table-skin-tokyo-neon.jpg',
  }[activeTableSkin];
  
  return (
    <div 
      className="game-table"
      style={{
        backgroundImage: `url(${tableBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Game content */}
    </div>
  );
}
```

---

## 4. COMPLETE EXAMPLE: GAME WITH COSMETICS

```tsx
import React, { useState, useEffect } from 'react';
import { Card } from './components/game/Card';
import { useGameAudio } from './hooks/useGameAudio';

interface GameTableProps {
  userCardBack: CardBack;
  userTableSkin: TableSkin;
  isTournamentFinals: boolean;
}

function GameTable({ userCardBack, userTableSkin, isTournamentFinals }: GameTableProps) {
  const { playCardDeal } = useGameAudio();
  const [cards, setCards] = useState([]);
  
  // Auto-apply gold in finals
  const activeCardBack = isTournamentFinals ? 'gold-finale' : userCardBack;
  const activeTableSkin = isTournamentFinals ? 'gold-finale' : userTableSkin;
  
  const tableBackground = {
    default: '/assets/tables/table-skin-default.jpg',
    'gold-finale': '/assets/tables/table-skin-gold-finale.jpg',
    'tokyo-neon': '/assets/tables/table-skin-tokyo-neon.jpg',
  }[activeTableSkin];
  
  const dealCards = () => {
    playCardDeal();
    // Deal 4 cards with staggered animation
    const newCards = [
      { suit: 'hearts', rank: 'A', delay: 0 },
      { suit: 'spades', rank: 'K', delay: 350 },
      { suit: 'diamonds', rank: 'Q', delay: 700 },
      { suit: 'clubs', rank: 'J', delay: 1050 },
    ];
    setCards(newCards);
  };
  
  return (
    <div 
      className="game-table"
      style={{
        backgroundImage: `url(${tableBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '600px',
        borderRadius: '16px',
        padding: '32px',
      }}
    >
      {isTournamentFinals && (
        <div className="championship-banner">
          👑 CHAMPIONSHIP MATCH 👑
        </div>
      )}
      
      <div className="card-hand">
        {cards.map((card, index) => (
          <Card
            key={index}
            suit={card.suit}
            rank={card.rank}
            faceUp={true}
            cardBack={activeCardBack}
            delay={card.delay}
          />
        ))}
      </div>
      
      <button onClick={dealCards}>Deal Cards</button>
    </div>
  );
}

export default GameTable;
```

---

## 5. PURCHASE FLOW

### Frontend Purchase Handler

```tsx
const handlePurchaseCardBack = async (cardBack: CardBack) => {
  try {
    // 1. Get card back price
    const prices = {
      'default': 0,
      'pumpfun': 0.01,
      'solana': 0.01,
      'gold-finale': 0.1,
    };
    const price = prices[cardBack];
    
    if (price === 0) {
      // Free item, just add to owned
      setOwnedCardBacks([...ownedCardBacks, cardBack]);
      return;
    }
    
    // 2. Connect wallet (if not connected)
    if (!wallet.connected) {
      await wallet.connect();
    }
    
    // 3. Create transaction to fee wallet
    const feeWallet = '7KwQDkHVKGJ5BQ89JN83XeG1kvWdFHhf7QH5o67jiym4';
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: new PublicKey(feeWallet),
        lamports: price * LAMPORTS_PER_SOL,
      })
    );
    
    // 4. Send transaction
    const signature = await sendTransaction(transaction, connection);
    await connection.confirmTransaction(signature);
    
    // 5. Record purchase on backend
    await fetch('/api/cosmetics/purchase', {
      method: 'POST',
      body: JSON.stringify({
        wallet: wallet.publicKey.toString(),
        itemType: 'card_back',
        itemId: cardBack,
        priceSol: price,
        txSignature: signature,
      }),
    });
    
    // 6. Update owned items
    setOwnedCardBacks([...ownedCardBacks, cardBack]);
    
    // 7. Show success message
    alert(`Successfully purchased ${cardBack} card back!`);
    
  } catch (error) {
    console.error('Purchase failed:', error);
    alert('Purchase failed. Please try again.');
  }
};
```

---

## 6. BACKEND INTEGRATION

### Database Schema

```sql
-- Add to users table
ALTER TABLE users 
ADD COLUMN owned_card_backs TEXT[] DEFAULT ARRAY['default'],
ADD COLUMN selected_card_back TEXT DEFAULT 'default',
ADD COLUMN owned_table_skins TEXT[] DEFAULT ARRAY['default'],
ADD COLUMN selected_table_skin TEXT DEFAULT 'default';

-- Purchase history table
CREATE TABLE cosmetic_purchases (
  id SERIAL PRIMARY KEY,
  user_wallet TEXT NOT NULL,
  item_type TEXT NOT NULL, -- 'card_back' or 'table_skin'
  item_id TEXT NOT NULL,
  price_sol DECIMAL NOT NULL,
  tx_signature TEXT NOT NULL,
  purchased_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints

```typescript
// GET /api/users/:wallet/cosmetics
app.get('/api/users/:wallet/cosmetics', async (req, res) => {
  const { wallet } = req.params;
  const user = await db.query(
    'SELECT owned_card_backs, selected_card_back, owned_table_skins, selected_table_skin FROM users WHERE wallet = $1',
    [wallet]
  );
  res.json(user.rows[0]);
});

// PATCH /api/users/:wallet/cosmetics
app.patch('/api/users/:wallet/cosmetics', async (req, res) => {
  const { wallet } = req.params;
  const { selectedCardBack, selectedTableSkin } = req.body;
  
  await db.query(
    'UPDATE users SET selected_card_back = COALESCE($1, selected_card_back), selected_table_skin = COALESCE($2, selected_table_skin) WHERE wallet = $3',
    [selectedCardBack, selectedTableSkin, wallet]
  );
  
  res.json({ success: true });
});

// POST /api/cosmetics/purchase
app.post('/api/cosmetics/purchase', async (req, res) => {
  const { wallet, itemType, itemId, priceSol, txSignature } = req.body;
  
  // Record purchase
  await db.query(
    'INSERT INTO cosmetic_purchases (user_wallet, item_type, item_id, price_sol, tx_signature) VALUES ($1, $2, $3, $4, $5)',
    [wallet, itemType, itemId, priceSol, txSignature]
  );
  
  // Add to owned items
  if (itemType === 'card_back') {
    await db.query(
      'UPDATE users SET owned_card_backs = array_append(owned_card_backs, $1) WHERE wallet = $2',
      [itemId, wallet]
    );
  } else {
    await db.query(
      'UPDATE users SET owned_table_skins = array_append(owned_table_skins, $1) WHERE wallet = $2',
      [itemId, wallet]
    );
  }
  
  res.json({ success: true });
});
```

---

## 7. TESTING CHECKLIST

- [ ] Cards display correctly (face-up and face-down)
- [ ] All 4 card backs load properly
- [ ] Card deal animation plays smoothly
- [ ] Custom card backs show when selected
- [ ] CardBackSelector displays all options
- [ ] Purchase button works
- [ ] Selection updates in real-time
- [ ] TableSkinSelector displays all tables
- [ ] Table skins apply to game
- [ ] Gold finale auto-applies in finals
- [ ] Owned items persist after refresh
- [ ] Mobile responsive design works

---

🎉 **Game components ready to integrate!**
