import React from 'react';
import './FeatureGrid.css';

const FEATURES = [
  {
    icon: '🎴',
    title: 'Custom Card Backs',
    description: 'Unlock premium card backs including Pump.fun, Solana, and the legendary All Gold Finale.'
  },
  {
    icon: '🎰',
    title: 'Premium Table Skins',
    description: 'Play on Mediterranean coastal, cyberpunk Tokyo Neon, or championship gold tables.'
  },
  {
    icon: '🏆',
    title: 'Tournament Championships',
    description: 'Compete in 8-player brackets where finals automatically feature the All Gold Finale setup.'
  },
  {
    icon: '🐉',
    title: 'Riva the Sea Dragon',
    description: 'Your friendly Mediterranean mascot celebrates wins and supports you through losses.'
  },
  {
    icon: '🔊',
    title: 'Immersive Audio',
    description: 'Casino-quality sound effects and Italian lofi house background music.'
  },
  {
    icon: '⚡',
    title: 'Built on Solana',
    description: 'Lightning-fast transactions, minimal fees, and provably fair gameplay.'
  }
];

export const FeatureGrid: React.FC = () => {
  return (
    <div className="feature-grid">
      {FEATURES.map((feature, index) => (
        <div key={index} className="feature-card">
          <div className="feature-card__icon">{feature.icon}</div>
          <h3 className="feature-card__title">{feature.title}</h3>
          <p className="feature-card__description">{feature.description}</p>
        </div>
      ))}
    </div>
  );
};

export default FeatureGrid;
