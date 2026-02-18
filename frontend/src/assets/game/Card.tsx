import React from 'react';
import './Card.css';

export type CardSuit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type CardRank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
export type CardBack = 'default' | 'pumpfun' | 'solana' | 'gold-finale';

export interface CardProps {
  suit: CardSuit;
  rank: CardRank;
  faceUp?: boolean;
  cardBack?: CardBack;
  className?: string;
  onClick?: () => void;
  delay?: number; // Animation delay in ms
}

// Card back image paths
const CARD_BACK_PATHS: Record<CardBack, string> = {
  'default': '/assets/cards/card-back-default.png',
  'pumpfun': '/assets/cards/card-back-pumpfun.png',
  'solana': '/assets/cards/card-back-solana.png',
  'gold-finale': '/assets/cards/card-back-gold-finale.png',
};

export const Card: React.FC<CardProps> = ({
  suit,
  rank,
  faceUp = true,
  cardBack = 'default',
  className = '',
  onClick,
  delay = 0,
}) => {
  const isRed = suit === 'hearts' || suit === 'diamonds';
  
  const getSuitSymbol = () => {
    switch (suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
    }
  };
  
  const classes = [
    'sj-card',
    faceUp ? 'sj-card--face-up' : 'sj-card--face-down',
    isRed ? 'sj-card--red' : 'sj-card--black',
    onClick && 'sj-card--clickable',
    'sj-card-enter', // Add enter animation
    className,
  ]
    .filter(Boolean)
    .join(' ');
  
  return (
    <div 
      className={classes}
      onClick={onClick}
      style={{ animationDelay: `${delay}ms` }}
    >
      {faceUp ? (
        // Face up - show rank and suit
        <div className="sj-card__face">
          <div className="sj-card__corner sj-card__corner--top">
            <div className="sj-card__rank">{rank}</div>
            <div className="sj-card__suit">{getSuitSymbol()}</div>
          </div>
          
          <div className="sj-card__center">
            <div className="sj-card__suit sj-card__suit--large">
              {getSuitSymbol()}
            </div>
          </div>
          
          <div className="sj-card__corner sj-card__corner--bottom">
            <div className="sj-card__rank">{rank}</div>
            <div className="sj-card__suit">{getSuitSymbol()}</div>
          </div>
        </div>
      ) : (
        // Face down - show card back
        <div className="sj-card__back">
          <img 
            src={CARD_BACK_PATHS[cardBack]} 
            alt="Card back"
            className="sj-card__back-image"
            draggable={false}
          />
        </div>
      )}
    </div>
  );
};

export default Card;
