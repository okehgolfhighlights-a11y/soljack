import React from 'react';
import './CoastalHero.css';

interface CoastalHeroProps {
  children: React.ReactNode;
}

export const CoastalHero: React.FC<CoastalHeroProps> = ({ children }) => {
  return (
    <section className="coastal-hero">
      {/* Background Image */}
      <div className="coastal-hero__background">
        <img 
          src="/assets/backgrounds/cinque-terre-sunset.jpg"
          alt="Cinque Terre coastal background"
          className="coastal-hero__image"
        />
        <div className="coastal-hero__overlay" />
      </div>
      
      {/* Content */}
      <div className="coastal-hero__content">
        {children}
      </div>
    </section>
  );
};

export default CoastalHero;
