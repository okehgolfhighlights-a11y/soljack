# 🔊 AUDIO SYSTEM - USAGE GUIDE

## Installation

Package includes:
- `AudioManager.tsx` - Main audio context provider
- `AudioSettings.tsx` - UI component for audio controls
- `AudioSettings.css` - Styling for audio controls
- `useGameAudio.ts` - Custom hooks for easy audio usage

---

## Setup

### 1. Wrap your app with AudioProvider

```tsx
// In your main App.tsx or index.tsx
import { AudioProvider } from './components/audio/AudioManager';

function App() {
  return (
    <AudioProvider>
      {/* Your app components */}
    </AudioProvider>
  );
}
```

### 2. Add AudioSettings to your Settings page

```tsx
import { AudioSettings } from './components/audio/AudioSettings';

function SettingsPage() {
  return (
    <div>
      <h1>Settings</h1>
      <AudioSettings />
    </div>
  );
}
```

---

## Using Audio in Components

### Method 1: useGameAudio Hook (Recommended)

```tsx
import { useGameAudio } from './hooks/useGameAudio';

function GameTable() {
  const {
    playCardDeal,
    playChipSound,
    playWinSound,
    playBustSound,
  } = useGameAudio();
  
  const dealCard = () => {
    playCardDeal(); // Play card slide sound
    // ... deal card logic
  };
  
  const placeBet = (amount) => {
    playChipSound(); // Play chip clink sound
    // ... betting logic
  };
  
  const handleWin = () => {
    playWinSound(); // Play win chime
    // ... win logic
  };
  
  const handleBust = () => {
    playBustSound(); // Play bust sound
    // ... bust logic
  };
  
  return (
    // ... your component JSX
  );
}
```

### Method 2: Direct useAudio Hook

```tsx
import { useAudio } from './components/audio/AudioManager';

function MyComponent() {
  const { playSound } = useAudio();
  
  const handleAction = () => {
    playSound('notification'); // Play any sound directly
  };
  
  return (
    // ... your component JSX
  );
}
```

---

## Available Sound Effects

All sound effects are typed and available:

```tsx
type SoundEffect = 
  | 'card-shuffle'    // Shuffling deck
  | 'card-slide'      // Card being dealt/slid
  | 'chip-clink'      // Poker chips clinking
  | 'clock-beep'      // Shot clock warning (3s remaining)
  | 'bust'            // Player busts (gentle sound)
  | 'win-chime'       // Hand win
  | 'notification';   // Friend request, challenge, etc.
```

---

## Background Music

### Playing Lobby Music

```tsx
import { useMusicPlayer } from './hooks/useGameAudio';

function Lobby() {
  const music = useMusicPlayer();
  
  useEffect(() => {
    music.play(); // Start music when entering lobby
    
    return () => {
      music.pause(); // Pause when leaving lobby
    };
  }, []);
  
  return (
    <div>
      <h1>Lobby</h1>
      {music.isPlaying && <p>🎵 Music playing...</p>}
    </div>
  );
}
```

### Music Controls

```tsx
const music = useMusicPlayer();

music.play();         // Start/resume music
music.pause();        // Pause music
music.stop();         // Stop and reset to beginning
music.isPlaying;      // Boolean - is music currently playing
```

---

## Volume Controls

### Getting/Setting Volumes

```tsx
import { useAudio } from './components/audio/AudioManager';

function VolumeControls() {
  const {
    sfxVolume,
    musicVolume,
    setSfxVolume,
    setMusicVolume,
  } = useAudio();
  
  return (
    <div>
      <input 
        type="range" 
        min={0} 
        max={1} 
        step={0.01}
        value={sfxVolume}
        onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
      />
      <input 
        type="range" 
        min={0} 
        max={1} 
        step={0.01}
        value={musicVolume}
        onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
      />
    </div>
  );
}
```

### Mute Controls

```tsx
const {
  isSfxMuted,
  isMusicMuted,
  isMasterMuted,
  toggleSfxMute,
  toggleMusicMute,
  toggleMasterMute,
} = useAudio();

// Mute all sound effects
<button onClick={toggleSfxMute}>
  {isSfxMuted ? '🔇' : '🔊'} SFX
</button>

// Mute background music
<button onClick={toggleMusicMute}>
  {isMusicMuted ? '🔇' : '🎵'} Music
</button>

// Mute everything
<button onClick={toggleMasterMute}>
  {isMasterMuted ? '🔇' : '🔊'} All Audio
</button>
```

---

## Complete Example: Game Table with Audio

```tsx
import React, { useEffect } from 'react';
import { useGameAudio, useMusicPlayer } from './hooks/useGameAudio';

function GameTable() {
  const {
    playCardShuffle,
    playCardDeal,
    playChipSound,
    playWinSound,
    playBustSound,
    playClockWarning,
  } = useGameAudio();
  
  const music = useMusicPlayer();
  
  // Start music when table loads
  useEffect(() => {
    music.play();
    return () => music.pause();
  }, []);
  
  const handleDeal = () => {
    playCardShuffle(); // Shuffle sound
    setTimeout(() => {
      playCardDeal(); // Deal first card
      setTimeout(() => playCardDeal(), 350); // Deal second card
      setTimeout(() => playCardDeal(), 700); // Deal third card
      setTimeout(() => playCardDeal(), 1050); // Deal fourth card
    }, 500);
  };
  
  const handleBet = (amount: number) => {
    playChipSound();
    // ... betting logic
  };
  
  const handleGameEnd = (won: boolean) => {
    if (won) {
      playWinSound();
    } else {
      playBustSound();
    }
  };
  
  const handleClockTick = (secondsRemaining: number) => {
    if (secondsRemaining === 3) {
      playClockWarning(); // Warning beep at 3 seconds
    }
  };
  
  return (
    <div className="game-table">
      <button onClick={handleDeal}>Deal Cards</button>
      <button onClick={() => handleBet(0.1)}>Bet 0.1 SOL</button>
    </div>
  );
}
```

---

## Tournament Finals Enhancement

Add dramatic audio for finals:

```tsx
function TournamentMatch({ isFinals }) {
  const { playWinSound } = useGameAudio();
  
  useEffect(() => {
    if (isFinals) {
      // Play epic win sound when entering finals
      playWinSound();
    }
  }, [isFinals]);
  
  return (
    // ... component
  );
}
```

---

## Best Practices

### 1. Preloading
Audio files are automatically preloaded by AudioManager on app load.

### 2. Sound Timing
Stagger multiple sounds to avoid overlap:
```tsx
playCardDeal();
setTimeout(() => playCardDeal(), 350); // Wait 350ms between cards
```

### 3. User Interaction Required
Modern browsers require user interaction before playing audio. 
The first sound won't play until the user clicks something.

### 4. Mobile Considerations
- Keep sound effects short
- Test volume levels on mobile devices
- Respect system mute switches

### 5. Performance
- Sounds are cloned before playing (allows overlapping)
- Music loops automatically
- All audio files are cached

---

## Troubleshooting

**Sounds don't play:**
- Check browser console for errors
- Ensure user has interacted with page
- Verify asset files exist in `/public/assets/sounds/`

**Music doesn't loop:**
- Music is set to loop by default
- Check if pauseMusic() was called

**Volume doesn't change:**
- Check if audio is muted
- Verify volume value is between 0 and 1

---

## File Structure

After installation:
```
src/
├── components/
│   └── audio/
│       ├── AudioManager.tsx
│       ├── AudioSettings.tsx
│       └── AudioSettings.css
└── hooks/
    └── useGameAudio.ts

public/
└── assets/
    └── sounds/
        ├── sfx/
        │   ├── sfx-card-shuffle.wav
        │   ├── sfx-card-slide.wav
        │   ├── sfx-chip-clink.wav
        │   ├── sfx-clock-beep.wav
        │   ├── sfx-bust.wav
        │   ├── sfx-win-chime.wav
        │   └── sfx-notification.wav
        └── music/
            └── lobby-main.mp3
```

---

## Complete Integration Checklist

- [ ] Wrap app with `<AudioProvider>`
- [ ] Add `<AudioSettings />` to settings page
- [ ] Use `useGameAudio()` in game components
- [ ] Play card sounds on deal
- [ ] Play chip sound on betting
- [ ] Play win/bust sounds on game end
- [ ] Play clock warning at 3 seconds
- [ ] Start/stop music in lobby/game
- [ ] Test all volume controls
- [ ] Test all mute toggles
- [ ] Verify sounds on mobile

---

🎉 **Audio system complete and ready to use!**
