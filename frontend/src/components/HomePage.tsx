// src/components/HomePage.tsx
import { HomePage as NewHomePage } from '../pages/HomePage-New';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const [stats, setStats] = useState({
    totalPlayers: 15234,
    onlinePlayers: 423,
    totalVolume: 12547
  });

  const handlePlayNow = () => {
    // Your existing play now logic - maybe navigate to lobby?
    console.log('Play Now clicked!');
    // If you have routing: navigate('/lobby');
  };

  return (
    <NewHomePage
      onPlayNow={handlePlayNow}
      totalPlayers={stats.totalPlayers}
      onlinePlayers={stats.onlinePlayers}
      totalVolume={stats.totalVolume}
    />
  );
}