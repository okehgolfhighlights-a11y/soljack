import React, { useEffect, useState } from 'react';
import { RivaMascot } from '../ui/RivaMascot';
import './TournamentFinalsTransition.css';

interface TournamentFinalsTransitionProps {
  onComplete: () => void;
  playerName?: string;
}

export const TournamentFinalsTransition: React.FC<TournamentFinalsTransitionProps> = ({
  onComplete,
  playerName = 'Champion',
}) => {
  const [phase, setPhase] = useState<'entrance' | 'celebration' | 'announcement'>('entrance');
  
  useEffect(() => {
    // Phase 1: Entrance (2s)
    const timer1 = setTimeout(() => {
      setPhase('celebration');
    }, 2000);
    
    // Phase 2: Celebration (2s)
    const timer2 = setTimeout(() => {
      setPhase('announcement');
    }, 4000);
    
    // Phase 3: Complete (3s)
    const timer3 = setTimeout(() => {
      onComplete();
    }, 7000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);
  
  return (
    <div className="tournament-finals-transition">
      {/* Golden background */}
      <div className="finals-background">
        <div className="finals-background__gradient" />
        <div className="finals-background__sparkles">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              className="sparkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            >
              ✨
            </div>
          ))}
        </div>
      </div>
      
      {/* Content */}
      <div className="finals-content">
        {phase === 'entrance' && (
          <div className="finals-phase finals-phase--entrance">
            <h1 className="finals-title finals-title--entrance">
              ADVANCING TO...
            </h1>
          </div>
        )}
        
        {phase === 'celebration' && (
          <div className="finals-phase finals-phase--celebration">
            <RivaMascot 
              animation="celebrating" 
              size="large"
              loop={true}
            />
            <h1 className="finals-title finals-title--celebration">
              THE FINALS!
            </h1>
          </div>
        )}
        
        {phase === 'announcement' && (
          <div className="finals-phase finals-phase--announcement">
            <div className="championship-badge">
              <div className="championship-badge__crown">👑</div>
              <h1 className="championship-badge__title">CHAMPIONSHIP MATCH</h1>
              <p className="championship-badge__subtitle">
                {playerName} vs Opponent
              </p>
            </div>
            
            <div className="finals-features">
              <div className="finals-feature">
                <div className="finals-feature__icon">🎰</div>
                <div className="finals-feature__text">All Gold Finale Table</div>
              </div>
              <div className="finals-feature">
                <div className="finals-feature__icon">🃏</div>
                <div className="finals-feature__text">Championship Card Backs</div>
              </div>
              <div className="finals-feature">
                <div className="finals-feature__icon">🏆</div>
                <div className="finals-feature__text">Winner Takes All</div>
              </div>
            </div>
            
            <div className="finals-ready">
              <p>Get ready for the match of your life...</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Confetti */}
      <div className="confetti-container">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="confetti"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
              backgroundColor: ['#FFD700', '#FF7F50', '#0077BE', '#FFD835'][Math.floor(Math.random() * 4)],
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default TournamentFinalsTransition;
