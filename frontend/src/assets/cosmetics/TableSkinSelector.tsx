import React from 'react';
import './TableSkinSelector.css';

export type TableSkin = 'default' | 'gold-finale' | 'tokyo-neon';

interface TableSkinOption {
  id: TableSkin;
  name: string;
  price: number; // SOL
  image: string;
  description: string;
}

const TABLE_SKINS: TableSkinOption[] = [
  {
    id: 'default',
    name: 'Mediterranean Coastal',
    price: 0,
    image: '/assets/tables/table-skin-default.jpg',
    description: 'Ocean blue elegance with gold accents',
  },
  {
    id: 'gold-finale',
    name: 'All Gold Finale',
    price: 0.1,
    image: '/assets/tables/table-skin-gold-finale.jpg',
    description: '👑 Championship table - Auto-applied in tournament finals!',
  },
  {
    id: 'tokyo-neon',
    name: 'Tokyo Neon',
    price: 0.01,
    image: '/assets/tables/table-skin-tokyo-neon.jpg',
    description: 'Cyberpunk vibes with neon pink and cyan',
  },
];

interface TableSkinSelectorProps {
  selectedTableSkin: TableSkin;
  ownedTableSkins: TableSkin[];
  onSelect: (tableSkin: TableSkin) => void;
  onPurchase: (tableSkin: TableSkin) => void;
}

export const TableSkinSelector: React.FC<TableSkinSelectorProps> = ({
  selectedTableSkin,
  ownedTableSkins,
  onSelect,
  onPurchase,
}) => {
  const isOwned = (tableSkin: TableSkin) => ownedTableSkins.includes(tableSkin);
  const isSelected = (tableSkin: TableSkin) => selectedTableSkin === tableSkin;
  
  return (
    <div className="table-skin-selector">
      <h3 className="table-skin-selector__title">🎰 Table Skins</h3>
      <p className="table-skin-selector__subtitle">
        Customize your game table - show off your style!
      </p>
      
      <div className="table-skin-grid">
        {TABLE_SKINS.map((tableSkin) => {
          const owned = isOwned(tableSkin.id);
          const selected = isSelected(tableSkin.id);
          
          return (
            <div 
              key={tableSkin.id}
              className={`table-skin-option ${selected ? 'selected' : ''} ${!owned ? 'locked' : ''}`}
            >
              <div className="table-skin-option__preview">
                <img 
                  src={tableSkin.image} 
                  alt={tableSkin.name}
                  className="table-skin-option__image"
                />
                {selected && (
                  <div className="table-skin-option__selected-badge">
                    ✓ ACTIVE
                  </div>
                )}
                {!owned && (
                  <div className="table-skin-option__locked-overlay">
                    🔒
                  </div>
                )}
              </div>
              
              <div className="table-skin-option__info">
                <h4 className="table-skin-option__name">{tableSkin.name}</h4>
                <p className="table-skin-option__description">{tableSkin.description}</p>
                
                <div className="table-skin-option__actions">
                  {owned ? (
                    <button
                      className={`btn-select ${selected ? 'selected' : ''}`}
                      onClick={() => onSelect(tableSkin.id)}
                      disabled={selected}
                    >
                      {selected ? 'Active' : 'Activate'}
                    </button>
                  ) : (
                    <button
                      className="btn-purchase"
                      onClick={() => onPurchase(tableSkin.id)}
                    >
                      {tableSkin.price === 0 ? 'FREE' : `${tableSkin.price} SOL`}
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

export default TableSkinSelector;
