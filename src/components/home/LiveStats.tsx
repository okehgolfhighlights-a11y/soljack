import React from 'react';
import './LiveStats.css';

interface LiveStatsProps {
  totalPlayers: number;
  onlinePlayers: number;
  totalVolume: number;
}

export const LiveStats: React.FC<LiveStatsProps> = ({
  totalPlayers,
  onlinePlayers,
  totalVolume,
}) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };
  
  const formatSOL = (num: number) => {
    return `${num.toLocaleString()} SOL`;
  };
  
  return (
    <div className="live-stats">
      <div className="live-stat">
        <div className="live-stat__value">{formatNumber(totalPlayers)}</div>
        <div className="live-stat__label">Total Players</div>
      </div>
      
      <div className="live-stat live-stat--pulse">
        <div className="live-stat__value">
          <span className="pulse-dot"></span>
          {formatNumber(onlinePlayers)}
        </div>
        <div className="live-stat__label">Online Now</div>
      </div>
      
      <div className="live-stat">
        <div className="live-stat__value">{formatSOL(totalVolume)}</div>
        <div className="live-stat__label">Total Volume</div>
      </div>
    </div>
  );
};

export default LiveStats;
