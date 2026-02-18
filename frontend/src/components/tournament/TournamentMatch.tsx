import React, { useState, useEffect } from 'react';
import { Card, CardBack } from '../../assets/game/Card';
import { TournamentFinalsTransition } from './TournamentFinalsTransition';
import { useGameAudio } from '../../hooks/useGameAudio';
import './TournamentMatch.css';

export type TournamentRound = 'quarterfinals' | 'semifinals' | 'finals';
export type TableSkin = 'default' | 'gold-finale' | 'tokyo-neon';

interface TournamentMatchProps {
  round: TournamentRound;
  matchNumber: number;
  playerWallet: string;
  opponentWallet: string;
  userCardBack?: CardBack;
  userTableSkin?: TableSkin;
  onMatchComplete: (winner: string) => void;
}

export const TournamentMatch: React.FC<TournamentMatchProps> = ({
  round,
  matchNumber,
  playerWallet,
  opponentWallet,
  userCardBack = 'default',
  userTableSkin = 'default',
  onMatchComplete,
}) => {
  const [showFinalsTransition, setShowFinalsTransition] = useState(false);
  const [matchStarted, setMatchStarted] = useState(false);
  const { playWinSound } = useGameAudio();
  
  // 🏆 CRITICAL: Auto-apply gold in finals!
  const isFinals = round === 'finals';
  const activeCardBack: CardBack = isFinals ? 'gold-finale' : userCardBack;
  const activeTableSkin: TableSkin = isFinals ? 'gold-finale' : userTableSkin;
  
  // Get table background image
  const getTableBackground = () => {
    const backgrounds: Record<TableSkin, string> = {
      'default': '/assets/tables/table-skin-default.jpg',
      'gold-finale': '/assets/tables/table-skin-gold-finale.jpg',
      'tokyo-neon': '/assets/tables/table-skin-tokyo-neon.jpg',
    };
    return backgrounds[activeTableSkin];
  };
  
  // Show finals transition when entering finals
  useEffect(() => {
    if (isFinals && !matchStarted) {
      setShowFinalsTransition(true);
      playWinSound(); // Epic sound on finals entrance
    }
  }, [isFinals, matchStarted, playWinSound]);
  
  const handleTransitionComplete = () => {
    setShowFinalsTransition(false);
    setMatchStarted(true);
  };
  
  // Get round display name
  const getRoundName = () => {
    switch (round) {
      case 'quarterfinals': return 'Quarterfinals';
      case 'semifinals': return 'Semifinals';
      case 'finals': return 'CHAMPIONSHIP FINALS';
    }
  };
  
  // Get match title
  const getMatchTitle = () => {
    if (isFinals) {
      return '👑 CHAMPIONSHIP MATCH 👑';
    }
    return `${getRoundName()} - Match ${matchNumber}`;
  };
  
  if (showFinalsTransition) {
    return (
      <TournamentFinalsTransition 
        onComplete={handleTransitionComplete}
        playerName={playerWallet.slice(0, 8)}
      />
    );
  }
  
  return (
    <div className={`tournament-match ${isFinals ? 'tournament-match--finals' : ''}`}>
      {/* Match Header */}
      <div className="tournament-match__header">
        <h2 className="tournament-match__title">{getMatchTitle()}</h2>
        <p className="tournament-match__round">{getRoundName()}</p>
      </div>
      
      {/* Finals Banner */}
      {isFinals && (
        <div className="finals-banner">
          <div className="finals-banner__content">
            <div className="finals-banner__icon">👑</div>
            <div className="finals-banner__text">
              <p className="finals-banner__title">CHAMPIONSHIP MATCH</p>
              <p className="finals-banner__subtitle">
                Playing on All Gold Finale Table with Championship Cards
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Game Table */}
      <div 
        className="tournament-match__table"
        style={{
          backgroundImage: `url(${getTableBackground()})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Table overlay for finals */}
        {isFinals && (
          <div className="finals-table-overlay">
            <div className="finals-glow" />
          </div>
        )}
        
        {/* Game content goes here */}
        <div className="tournament-match__game">
          {/* Example cards - replace with actual game logic */}
          <div className="card-area card-area--dealer">
            <p className="player-label">Opponent</p>
            <div className="card-hand">
              <Card suit="hearts" rank="K" faceUp={true} cardBack={activeCardBack} />
              <Card suit="diamonds" rank="Q" faceUp={true} cardBack={activeCardBack} />
            </div>
          </div>
          
          <div className="card-area card-area--player">
            <p className="player-label">You</p>
            <div className="card-hand">
              <Card suit="spades" rank="A" faceUp={true} cardBack={activeCardBack} />
              <Card suit="clubs" rank="10" faceUp={true} cardBack={activeCardBack} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Match Info */}
      <div className="tournament-match__info">
        <div className="match-stat">
          <span className="match-stat__label">Table:</span>
          <span className="match-stat__value">
            {isFinals ? '🏆 All Gold Finale' : activeTableSkin}
          </span>
        </div>
        <div className="match-stat">
          <span className="match-stat__label">Cards:</span>
          <span className="match-stat__value">
            {isFinals ? '👑 Championship Gold' : activeCardBack}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TournamentMatch;
