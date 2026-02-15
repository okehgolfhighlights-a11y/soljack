# 🏠 HOMEPAGE REDESIGN - USAGE GUIDE

## Package Contents

**Pages:**
- `HomePage.tsx` - Complete homepage redesign
- `HomePage.css` - Coastal theme styling

**Components:**
- `CoastalHero.tsx` - Hero section with background
- `CoastalHero.css` - Hero styling
- `LiveStats.tsx` - Real-time player stats
- `LiveStats.css` - Stats styling
- `FeatureGrid.tsx` - Feature cards grid
- `FeatureGrid.css` - Feature grid styling
- `RecentWinners.tsx` - Winner ticker
- `RecentWinners.css` - Ticker animation

---

## Features

✅ **Cinque Terre Hero Background**
✅ **Swimming Riva Animation**
✅ **Live Player Stats**
✅ **Game Modes Showcase**
✅ **Feature Grid**
✅ **Recent Winners Ticker**
✅ **Mascot Showcase Section**
✅ **Final CTA**
✅ **Complete Footer**
✅ **Premium Animations**
✅ **Fully Responsive**

---

## Installation

```bash
cd your-soljack-project/frontend
unzip package-6-homepage.zip
```

---

## Usage

### Basic Setup

```tsx
import { HomePage } from './pages/HomePage';

function App() {
  return (
    <HomePage
      onPlayNow={() => navigate('/lobby')}
      totalPlayers={15234}
      onlinePlayers={423}
      totalVolume={12547}
    />
  );
}
```

### With Live Data

```tsx
import { useState, useEffect } from 'react';
import { HomePage } from './pages/HomePage';

function App() {
  const [stats, setStats] = useState({
    totalPlayers: 0,
    onlinePlayers: 0,
    totalVolume: 0,
  });
  
  // Fetch live stats
  useEffect(() => {
    const fetchStats = async () => {
      const response = await fetch('/api/stats');
      const data = await response.json();
      setStats(data);
    };
    
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Update every 30s
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <HomePage
      onPlayNow={() => navigate('/lobby')}
      {...stats}
    />
  );
}
```

---

## Sections Breakdown

### 1. Hero Section

**Features:**
- Full-height section
- Cinque Terre sunset background
- Gradient overlay
- SolJack Riviera logo
- Swimming Riva animation
- Primary & secondary CTAs
- Live stats counter

**Customization:**
```tsx
// Change background image
// In CoastalHero.tsx, line 12:
src="/assets/backgrounds/cinque-terre-golden-hour.jpg"
```

### 2. Features Section

**Shows 6 key features:**
- Custom Card Backs
- Premium Table Skins
- Tournament Championships
- Riva the Sea Dragon
- Immersive Audio
- Built on Solana

**Add more features:**
```tsx
// In FeatureGrid.tsx, add to FEATURES array:
{
  icon: '🎁',
  title: 'Your Feature',
  description: 'Your description'
}
```

### 3. Game Modes

**Three modes displayed:**
- Practice (Free)
- PvP Matches (Popular)
- Tournaments (Championship)

**Customize:**
Edit the game-modes section in HomePage.tsx

### 4. Recent Winners

**Ticker animation:**
- Shows recent wins
- Auto-scrolls
- 20s loop

**Connect to backend:**
```tsx
<RecentWinners winners={liveWinners} />
```

### 5. Mascot Showcase

**Features Riva lounging:**
- Shows personality
- Explains cosmetics
- Engages users

### 6. Footer

**Includes:**
- Navigation links
- Social links
- Pump.fun & Solana badges
- Copyright

---

## Dependencies

**Required Components:**
- `RivaMascot` (from Package 1)
- `PremiumButton` (from Package 1)
- `useMusicPlayer` (from Package 3)

**Required Assets:**
- `/assets/backgrounds/cinque-terre-sunset.jpg`
- All Riva images
- Design system CSS (variables.css)

---

## Customization

### Change Hero Background

```tsx
// In CoastalHero.tsx
<img src="/assets/backgrounds/cinque-terre-day-1.jpg" />
```

### Adjust Colors

All colors use CSS variables from `variables.css`:
```css
--ocean-blue: #0077BE
--limoncello-yellow: #FFD835
--coral-pink: #FF7F50
--gold: #FFD700
--navy-deep: #1A3A52
```

### Modify Animations

```css
/* Adjust hero animation timing */
.hero-logo {
  animation: fadeInDown 1s ease-out; /* Change duration */
}
```

### Update Footer Links

```tsx
// In HomePage.tsx, footer section
<a href="/your-link">Your Link</a>
```

---

## Live Stats Integration

### Backend Endpoint

```typescript
// GET /api/stats
app.get('/api/stats', async (req, res) => {
  const stats = await db.query(`
    SELECT 
      COUNT(DISTINCT wallet) as total_players,
      COUNT(DISTINCT CASE WHEN last_active > NOW() - INTERVAL '5 minutes' THEN wallet END) as online_players,
      SUM(volume_sol) as total_volume
    FROM users
  `);
  
  res.json(stats.rows[0]);
});
```

### WebSocket Updates (Real-time)

```tsx
useEffect(() => {
  const ws = new WebSocket('wss://your-server/stats');
  
  ws.onmessage = (event) => {
    const stats = JSON.parse(event.data);
    setStats(stats);
  };
  
  return () => ws.close();
}, []);
```

---

## Recent Winners Integration

### Backend Endpoint

```typescript
// GET /api/recent-winners
app.get('/api/recent-winners', async (req, res) => {
  const winners = await db.query(`
    SELECT 
      winner_wallet as wallet,
      prize_sol as amount,
      game_type as type
    FROM games
    WHERE winner_wallet IS NOT NULL
    ORDER BY created_at DESC
    LIMIT 10
  `);
  
  res.json(winners.rows);
});
```

### Real-time Winners

```tsx
const [winners, setWinners] = useState([]);

useEffect(() => {
  const ws = new WebSocket('wss://your-server/winners');
  
  ws.onmessage = (event) => {
    const newWinner = JSON.parse(event.data);
    setWinners(prev => [newWinner, ...prev].slice(0, 10));
  };
  
  return () => ws.close();
}, []);

<RecentWinners winners={winners} />
```

---

## Mobile Optimization

**Already includes:**
- ✅ Responsive grid layouts
- ✅ Flexible typography (clamp)
- ✅ Mobile-first button sizing
- ✅ Stacked sections on mobile
- ✅ Touch-friendly spacing

**Test on:**
- iPhone (375px width)
- iPad (768px width)
- Desktop (1024px+ width)

---

## Performance Tips

### Lazy Load Images

```tsx
<img 
  loading="lazy"
  src="/assets/backgrounds/cinque-terre-sunset.jpg"
/>
```

### Optimize Background

```bash
# Compress background images
npx sharp-cli -i cinque-terre-sunset.jpg -o cinque-terre-sunset-optimized.jpg --quality 85
```

### Preload Critical Assets

```html
<link rel="preload" as="image" href="/assets/backgrounds/cinque-terre-sunset.jpg">
```

---

## Accessibility

**Included:**
- ✅ Semantic HTML
- ✅ Alt text on images
- ✅ Color contrast ratios
- ✅ Keyboard navigation
- ✅ Reduced motion support
- ✅ ARIA labels where needed

**Test with:**
```bash
npm run lighthouse
```

---

## SEO Optimization

### Add Meta Tags

```html
<head>
  <title>SolJack Riviera - Mediterranean Luxury Solana Blackjack</title>
  <meta name="description" content="Premium Solana blackjack with Mediterranean coastal theme. Play practice, PvP, or tournaments with custom cosmetics and championship finals.">
  <meta property="og:image" content="/og-image.jpg">
</head>
```

---

## Troubleshooting

**Hero background doesn't show:**
- Check asset path: `/assets/backgrounds/cinque-terre-sunset.jpg`
- Verify file exists in public folder
- Check browser console for 404

**Riva doesn't animate:**
- Ensure RivaMascot component imported
- Check Package 1 is installed
- Verify Riva assets exist

**Stats don't update:**
- Check API endpoint is working
- Verify WebSocket connection
- Check console for errors

**Music doesn't play:**
- User must interact with page first (browser policy)
- Check Package 3 is installed
- Verify music file exists

---

## Complete Integration Checklist

- [ ] HomePage.tsx in `src/pages/`
- [ ] All component files in `src/components/home/`
- [ ] Package 1 (RivaMascot) installed
- [ ] Package 2 (Assets) installed
- [ ] Package 3 (Audio) installed
- [ ] Background images exist
- [ ] Design system (variables.css) imported
- [ ] Live stats API endpoint created
- [ ] Recent winners API endpoint created
- [ ] Footer links updated
- [ ] Social media links added
- [ ] Navigation working
- [ ] Mobile tested
- [ ] Accessibility checked

---

🏠 **Homepage transformation complete!**

Mediterranean coastal luxury × premium gaming experience ready to launch!
