# 🏆 TOURNAMENT FINALS - USAGE GUIDE

## Package Contents

**Components:**
- `TournamentFinalsTransition.tsx` - Epic transition to finals
- `TournamentFinalsTransition.css` - Transition animations
- `TournamentMatch.tsx` - Updated match component with auto-gold
- `TournamentMatch.css` - Match styling

**Features:**
- ✅ Automatic gold table in finals
- ✅ Automatic gold cards in finals
- ✅ Epic 7-second transition animation
- ✅ Championship banner and effects
- ✅ Confetti and sparkles
- ✅ Riva celebration

---

## THE BIG FEATURE: AUTO-GOLD FINALS

### How It Works

When a player reaches the tournament finals, **EVERYTHING automatically turns gold!**

```tsx
// In TournamentMatch component
const isFinals = round === 'finals';

// 🏆 CRITICAL: Auto-apply gold in finals!
const activeCardBack: CardBack = isFinals ? 'gold-finale' : userCardBack;
const activeTableSkin: TableSkin = isFinals ? 'gold-finale' : userTableSkin;
```

**Result:**
- Table switches to All Gold Finale (black felt + gold border)
- Cards switch to All Gold Finale (championship gold backs)
- Special championship banner appears
- Golden glow effects
- Player feels like ABSOLUTE CHAMPION!

---

## 1. FINALS TRANSITION

### Basic Usage

```tsx
import { TournamentFinalsTransition } from './components/tournament/TournamentFinalsTransition';

function TournamentFlow() {
  const [showTransition, setShowTransition] = useState(false);
  
  // When player wins semifinals
  const handleSemifinalsWin = () => {
    setShowTransition(true);
  };
  
  return (
    <>
      {showTransition && (
        <TournamentFinalsTransition 
          onComplete={() => {
            setShowTransition(false);
            // Start finals match
            startFinalsMatch();
          }}
          playerName="YourUsername"
        />
      )}
    </>
  );
}
```

### Transition Phases

The transition has 3 phases over 7 seconds:

**Phase 1 (0-2s): Entrance**
- "ADVANCING TO..." text appears
- Golden background fades in
- Sparkles begin

**Phase 2 (2-4s): Celebration**
- "THE FINALS!" title explodes onto screen
- Riva does backflip celebration
- Confetti starts falling

**Phase 3 (4-7s): Announcement**
- Championship badge appears
- Shows "All Gold Finale Table"
- Shows "Championship Card Backs"
- "Get ready..." message

**After 7s:**
- `onComplete()` callback fires
- Match begins with gold table + cards

---

## 2. TOURNAMENT MATCH COMPONENT

### Usage

```tsx
import { TournamentMatch } from './components/tournament/TournamentMatch';

function Tournament() {
  const [currentRound, setCurrentRound] = useState<TournamentRound>('quarterfinals');
  const [userCardBack, setUserCardBack] = useState<CardBack>('default');
  const [userTableSkin, setUserTableSkin] = useState<TableSkin>('default');
  
  return (
    <TournamentMatch
      round={currentRound}
      matchNumber={1}
      playerWallet={wallet.publicKey.toString()}
      opponentWallet={opponentWallet}
      userCardBack={userCardBack}
      userTableSkin={userTableSkin}
      onMatchComplete={(winner) => {
        if (winner === wallet.publicKey.toString()) {
          // Player won!
          if (currentRound === 'semifinals') {
            // Advance to finals
            setCurrentRound('finals');
          }
        }
      }}
    />
  );
}
```

### Tournament Rounds

```tsx
type TournamentRound = 'quarterfinals' | 'semifinals' | 'finals';

// Round detection
const isFinals = round === 'finals';
const isSemifinals = round === 'semifinals';
const isQuarterfinals = round === 'quarterfinals';
```

### Auto-Gold Logic

```tsx
// This happens automatically in TournamentMatch component!

// User has selected 'tokyo-neon' table and 'pumpfun' cards
userTableSkin = 'tokyo-neon';
userCardBack = 'pumpfun';

// In quarterfinals/semifinals:
activeTableSkin = 'tokyo-neon';  // User's choice
activeCardBack = 'pumpfun';      // User's choice

// In FINALS:
activeTableSkin = 'gold-finale'; // 🏆 AUTO-APPLIED!
activeCardBack = 'gold-finale';  // 🏆 AUTO-APPLIED!
```

---

## 3. COMPLETE TOURNAMENT FLOW

### Full Example

```tsx
import React, { useState } from 'react';
import { TournamentMatch } from './components/tournament/TournamentMatch';
import { TournamentFinalsTransition } from './components/tournament/TournamentFinalsTransition';
import { useGameAudio } from './hooks/useGameAudio';

type TournamentRound = 'quarterfinals' | 'semifinals' | 'finals';

function TournamentSystem() {
  const [currentRound, setCurrentRound] = useState<TournamentRound>('quarterfinals');
  const [showFinalsTransition, setShowFinalsTransition] = useState(false);
  const [matchStarted, setMatchStarted] = useState(true);
  const { playWinSound, playNotification } = useGameAudio();
  
  const handleMatchComplete = (winner: string, playerWallet: string) => {
    if (winner === playerWallet) {
      // Player won!
      playWinSound();
      
      if (currentRound === 'quarterfinals') {
        // Advance to semifinals
        setCurrentRound('semifinals');
        setMatchStarted(true);
      } 
      else if (currentRound === 'semifinals') {
        // Advance to FINALS!
        playNotification();
        setMatchStarted(false);
        setShowFinalsTransition(true);
      }
      else if (currentRound === 'finals') {
        // WON THE TOURNAMENT!
        celebrateTournamentWin();
      }
    } else {
      // Player lost - eliminated from tournament
      handleElimination();
    }
  };
  
  const handleFinalsTransitionComplete = () => {
    setShowFinalsTransition(false);
    setCurrentRound('finals');
    setMatchStarted(true);
  };
  
  return (
    <div className="tournament-system">
      {showFinalsTransition ? (
        <TournamentFinalsTransition 
          onComplete={handleFinalsTransitionComplete}
          playerName={playerName}
        />
      ) : matchStarted ? (
        <TournamentMatch
          round={currentRound}
          matchNumber={getMatchNumber(currentRound)}
          playerWallet={playerWallet}
          opponentWallet={opponentWallet}
          userCardBack={userSelectedCardBack}
          userTableSkin={userSelectedTableSkin}
          onMatchComplete={(winner) => handleMatchComplete(winner, playerWallet)}
        />
      ) : (
        <div>Loading next match...</div>
      )}
    </div>
  );
}
```

---

## 4. INTEGRATION WITH AUDIO

### Playing Sounds During Finals

```tsx
import { useGameAudio } from './hooks/useGameAudio';

function TournamentMatch({ round }) {
  const { playWinSound, playCardShuffle } = useGameAudio();
  const isFinals = round === 'finals';
  
  useEffect(() => {
    if (isFinals) {
      // Epic win sound when entering finals
      playWinSound();
      
      // Shuffle sound when game starts
      setTimeout(() => playCardShuffle(), 1000);
    }
  }, [isFinals]);
}
```

---

## 5. VISUAL EFFECTS

### Finals-Specific Styling

The component automatically adds special styling for finals:

**Gold Border:**
```css
.tournament-match--finals .tournament-match__table {
  box-shadow: 0 20px 60px rgba(255, 215, 0, 0.4);
  border: 3px solid var(--gold);
}
```

**Glowing Effect:**
```css
.finals-glow {
  background: radial-gradient(
    circle at center,
    rgba(255, 215, 0, 0.2) 0%,
    transparent 70%
  );
  animation: glowPulse 4s ease-in-out infinite;
}
```

**Championship Banner:**
```tsx
{isFinals && (
  <div className="finals-banner">
    👑 CHAMPIONSHIP MATCH
  </div>
)}
```

---

## 6. TOURNAMENT PROGRESSION

### Round Flow

```
8 Players Enter
    ↓
Quarterfinals (4 matches)
    ↓
4 Winners → Semifinals (2 matches)
    ↓
2 Winners → 🎬 FINALS TRANSITION (7 seconds)
    ↓
🏆 FINALS MATCH (Gold Table + Gold Cards!)
    ↓
1 CHAMPION!
```

### Match Numbers

```tsx
const getMatchNumber = (round: TournamentRound, playerPosition: number) => {
  if (round === 'quarterfinals') {
    // Matches 1-4
    return Math.floor(playerPosition / 2) + 1;
  }
  if (round === 'semifinals') {
    // Matches 1-2
    return Math.floor(playerPosition / 4) + 1;
  }
  if (round === 'finals') {
    // Match 1 (THE finals)
    return 1;
  }
};
```

---

## 7. TESTING THE FINALS EXPERIENCE

### Quick Test

```tsx
// Set round to 'finals' to test immediately
<TournamentMatch
  round="finals"  // ← Test finals!
  matchNumber={1}
  playerWallet={testWallet}
  opponentWallet={testOpponent}
  userCardBack="tokyo-neon"  // Will be overridden to 'gold-finale'
  userTableSkin="default"    // Will be overridden to 'gold-finale'
  onMatchComplete={() => {}}
/>
```

### Verify Auto-Gold

**Checklist:**
- [ ] Round is 'finals'
- [ ] Finals transition plays (7 seconds)
- [ ] Riva celebrates during transition
- [ ] Table background is gold-finale.jpg
- [ ] Card backs are gold-finale.png
- [ ] Championship banner shows
- [ ] Golden glow effect visible
- [ ] Match info shows "🏆 All Gold Finale"

---

## 8. CUSTOMIZATION

### Adjust Transition Duration

```tsx
// In TournamentFinalsTransition.tsx
useEffect(() => {
  const timer1 = setTimeout(() => setPhase('celebration'), 2000);  // ← Change timing
  const timer2 = setTimeout(() => setPhase('announcement'), 4000); // ← Change timing
  const timer3 = setTimeout(() => onComplete(), 7000);             // ← Total duration
}, []);
```

### Custom Finals Banner

```tsx
// In TournamentMatch.tsx
{isFinals && (
  <div className="finals-banner">
    {/* Add your custom content */}
    <h2>ULTIMATE SHOWDOWN</h2>
    <p>Winner takes {prizePot} SOL!</p>
  </div>
)}
```

---

## 9. IMPORTANT NOTES

### User's Selections Are Preserved

```tsx
// User bought and selected Tokyo Neon table
userTableSkin = 'tokyo-neon';

// In quarterfinals/semifinals
activeTableSkin = 'tokyo-neon'; // User's choice is used

// In FINALS
activeTableSkin = 'gold-finale'; // Auto-override

// After tournament
userTableSkin = 'tokyo-neon'; // Still user's selection for future games
```

**User doesn't lose their selection - it's just overridden for finals!**

### Gold Items Still Purchasable

Players can still buy "All Gold Finale" items for:
- Regular matches (if they want to flex)
- Practice games
- PvP matches

Finals just **auto-applies** them for the championship experience.

---

## 10. BACKEND TRACKING

### Record Finals Matches

```typescript
// When finals match starts
await db.query(`
  INSERT INTO tournament_matches 
  (tournament_id, round, player1, player2, table_skin, card_back)
  VALUES ($1, 'finals', $2, $3, 'gold-finale', 'gold-finale')
`, [tournamentId, player1Wallet, player2Wallet]);
```

### Tournament Winners Table

```sql
CREATE TABLE tournament_winners (
  id SERIAL PRIMARY KEY,
  tournament_id INTEGER,
  winner_wallet TEXT,
  prize_sol DECIMAL,
  finals_match_id INTEGER,
  won_at TIMESTAMP DEFAULT NOW()
);
```

---

## 11. TROUBLESHOOTING

**Finals transition doesn't show:**
- Check `round === 'finals'`
- Verify `showFinalsTransition` state
- Check console for errors

**Gold table/cards don't apply:**
- Verify `isFinals = true`
- Check `activeCardBack` and `activeTableSkin` values
- Ensure assets exist at paths

**Transition too long/short:**
- Adjust timeouts in `useEffect`
- Change phase durations

---

## 12. COMPLETE FILES CHECKLIST

After installing this package:

- [ ] `TournamentFinalsTransition.tsx` in `src/components/tournament/`
- [ ] `TournamentFinalsTransition.css` in `src/components/tournament/`
- [ ] `TournamentMatch.tsx` in `src/components/tournament/`
- [ ] `TournamentMatch.css` in `src/components/tournament/`
- [ ] Import RivaMascot (from Package 1)
- [ ] Import Card component (from Package 4)
- [ ] Import useGameAudio (from Package 3)
- [ ] Assets in `/public/assets/tables/table-skin-gold-finale.jpg`
- [ ] Assets in `/public/assets/cards/card-back-gold-finale.png`

---

🏆 **TOURNAMENT FINALS SYSTEM COMPLETE!**

**The most epic feature of SolJack Riviera - when players reach finals, EVERYTHING turns gold and they feel like absolute champions!**
