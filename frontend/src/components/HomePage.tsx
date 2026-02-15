// src/components/HomePage.jsx
import { HomePage as NewHomePage } from '../pages/HomePage';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const [stats, setStats] = useState({
    totalPlayers: 15234,
    onlinePlayers: 423,
    totalVolume: 12547
  });

  const handlePlayNow = () => {
    // Your existing play now logic
    console.log('Play Now clicked!');
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