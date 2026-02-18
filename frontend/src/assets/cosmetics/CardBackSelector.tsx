import React from 'react';
import './CardBackSelector.css';

export type CardBack = 'default' | 'pumpfun' | 'solana' | 'gold-finale';

interface CardBackOption {
  id: CardBack;
  name: string;
  price: number; // SOL
  image: string;
  description: string;
}

const CARD_BACKS: CardBackOption[] = [
  {
    id: 'default',
    name: 'Pump.fun × Cinque Terre',
    price: 0,
    image: '/assets/cards/card-back-default.png',
    description: 'Mediterranean luxury meets crypto culture',
  },
  {
    id: 'pumpfun',
    name: 'Pump.fun Pill Edition',
    price: 0.01,
    image: '/assets/cards/card-back-pumpfun.png',
    description: 'Celebrate the memecoin revolution',
  },
  {
    id: 'solana',
    name: 'Solana Edition',
    price: 0.01,
    image: '/assets/cards/card-back-solana.png',
    description: 'Built on the fastest blockchain',
  },
  {
    id: 'gold-finale',
    name: 'All Gold Finale',
    price: 0.1,
    image: '/assets/cards/card-back-gold-finale.png',
    description: '👑 Championship exclusive - Auto-applied in tournament finals',
  },
];

interface CardBackSelectorProps {
  selectedCardBack: CardBack;
  ownedCardBacks: CardBack[];
  onSelect: (cardBack: CardBack) => void;
  onPurchase: (cardBack: CardBack) => void;
}

export const CardBackSelector: React.FC<CardBackSelectorProps> = ({
  selectedCardBack,
  ownedCardBacks,
  onSelect,
  onPurchase,
}) => {
  const isOwned = (cardBack: CardBack) => ownedCardBacks.includes(cardBack);
  const isSelected = (cardBack: CardBack) => selectedCardBack === cardBack;
  
  return (
    <div className="card-back-selector">
      <h3 className="card-back-selector__title">🎴 Card Backs</h3>
      <p className="card-back-selector__subtitle">
        Customize your cards - opponents see your selected card back!
      </p>
      
      <div className="card-back-grid">
        {CARD_BACKS.map((cardBack) => {
          const owned = isOwned(cardBack.id);
          const selected = isSelected(cardBack.id);
          
          return (
            <div 
              key={cardBack.id}
              className={`card-back-option ${selected ? 'selected' : ''} ${!owned ? 'locked' : ''}`}
            >
              <div className="card-back-option__preview">
                <img 
                  src={cardBack.image} 
                  alt={cardBack.name}
                  className="card-back-option__image"
                />
                {selected && (
                  <div className="card-back-option__selected-badge">
                    ✓ EQUIPPED
                  </div>
                )}
                {!owned && (
                  <div className="card-back-option__locked-overlay">
                    🔒
                  </div>
                )}
              </div>
              
              <div className="card-back-option__info">
                <h4 className="card-back-option__name">{cardBack.name}</h4>
                <p className="card-back-option__description">{cardBack.description}</p>
                
                <div className="card-back-option__actions">
                  {owned ? (
                    <button
                      className={`btn-select ${selected ? 'selected' : ''}`}
                      onClick={() => onSelect(cardBack.id)}
                      disabled={selected}
                    >
                      {selected ? 'Equipped' : 'Equip'}
                    </button>
                  ) : (
                    <button
                      className="btn-purchase"
                      onClick={() => onPurchase(cardBack.id)}
                    >
                      {cardBack.price === 0 ? 'FREE' : `${cardBack.price} SOL`}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CardBackSelector;
