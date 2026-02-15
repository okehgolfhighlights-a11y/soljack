import React, { useEffect, useState } from 'react';
import { RivaMascot } from '../components/ui/RivaMascot';
import { PremiumButton } from '../components/ui/PremiumButton';
import { CoastalHero } from '../components/home/CoastalHero';
import { LiveStats } from '../components/home/LiveStats';
import { FeatureGrid } from '../components/home/FeatureGrid';
import { RecentWinners } from '../components/home/RecentWinners';
import { useMusicPlayer } from '../hooks/useGameAudio';
import './HomePage.css';

interface HomePageProps {
  onPlayNow: () => void;
  totalPlayers?: number;
  onlinePlayers?: number;
  totalVolume?: number;
}

export const HomePage: React.FC<HomePageProps> = ({
  onPlayNow,
  totalPlayers = 0,
  onlinePlayers = 0,
  totalVolume = 0,
}) => {
  const [showRiva, setShowRiva] = useState(false);
  const music = useMusicPlayer();
  
  // Show swimming Riva after page loads
  useEffect(() => {
    const timer = setTimeout(() => setShowRiva(true), 1000);
    return () => clearTimeout(timer);
  }, []);
  
  // Start lobby music
  useEffect(() => {
    music.play();
    return () => music.pause();
  }, []);
  
  return (
    <div className="homepage">
      {/* Hero Section with Coastal Background */}
      <CoastalHero>
        <div className="hero-content">
          {/* Logo */}
          <div className="hero-logo">
            <h1 className="hero-title">
              <span className="hero-title__sol">Sol</span>
              <span className="hero-title__jack">Jack</span>
            </h1>
            <p className="hero-subtitle">RIVIERA</p>
          </div>
          
          {/* Tagline */}
          <p className="hero-tagline">
            Mediterranean Luxury × Solana Blackjack
          </p>
          
          {/* Swimming Riva */}
          {showRiva && (
            <div className="hero-riva">
              <RivaMascot 
                animation="swimming" 
                size="large"
                loop={true}
              />
            </div>
          )}
          
          {/* CTA Buttons */}
          <div className="hero-actions">
            <PremiumButton
              variant="primary"
              size="lg"
              onClick={onPlayNow}
            >
              🎰 Play Now
            </PremiumButton>
            
            <PremiumButton
              variant="secondary"
              size="lg"
              onClick={() => {/* Scroll to how it works */}}
            >
              Learn More
            </PremiumButton>
          </div>
          
          {/* Live Stats Counter */}
          <LiveStats
            totalPlayers={totalPlayers}
            onlinePlayers={onlinePlayers}
            totalVolume={totalVolume}
          />
        </div>
      </CoastalHero>
      
      {/* Features Section */}
      <section className="homepage-section homepage-section--features">
        <div className="container">
          <h2 className="section-title">
            🌊 Premium Solana Blackjack
          </h2>
          <p className="section-subtitle">
            Experience the Mediterranean coast meets crypto culture
          </p>
          
          <FeatureGrid />
        </div>
      </section>
      
      {/* Game Modes */}
      <section className="homepage-section homepage-section--modes">
        <div className="container">
          <h2 className="section-title">
            🎮 Game Modes
          </h2>
          
          <div className="game-modes">
            <div className="game-mode">
              <div className="game-mode__icon">🎯</div>
              <h3 className="game-mode__title">Practice</h3>
              <p className="game-mode__description">
                Perfect your strategy against AI opponents
              </p>
              <ul className="game-mode__features">
                <li>3 difficulty levels</li>
                <li>Free to play</li>
                <li>Learn the ropes</li>
              </ul>
            </div>
            
            <div className="game-mode game-mode--featured">
              <div className="game-mode__badge">⚡ POPULAR</div>
              <div className="game-mode__icon">🎰</div>
              <h3 className="game-mode__title">PvP Matches</h3>
              <p className="game-mode__description">
                Challenge real players in Best of 3 matches
              </p>
              <ul className="game-mode__features">
                <li>0.01 - 1 SOL buy-ins</li>
                <li>Modified blackjack rules</li>
                <li>10-second shot clock</li>
              </ul>
            </div>
            
            <div className="game-mode">
              <div className="game-mode__icon">🏆</div>
              <h3 className="game-mode__title">Tournaments</h3>
              <p className="game-mode__description">
                Compete for glory and prize pools
              </p>
              <ul className="game-mode__features">
                <li>8-player brackets</li>
                <li>Championship finals</li>
                <li>All Gold Finale table</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      
      {/* Recent Winners */}
      <section className="homepage-section homepage-section--winners">
        <div className="container">
          <h2 className="section-title">
            🎉 Recent Champions
          </h2>
          <RecentWinners />
        </div>
      </section>
      
      {/* Mascot Section */}
      <section className="homepage-section homepage-section--mascot">
        <div className="container">
          <div className="mascot-showcase">
            <div className="mascot-showcase__riva">
              <RivaMascot 
                animation="lounging" 
                size="large"
              />
            </div>
            <div className="mascot-showcase__content">
              <h2 className="section-title">
                Meet Riva, Your Sea Dragon Guide
              </h2>
              <p className="mascot-text">
                Riva is the friendly Mediterranean sea dragon who'll guide you 
                through your SolJack Riviera journey. From celebrating your wins 
                to cheering you on through tough hands, Riva brings the coastal 
                charm to every game.
              </p>
              <p className="mascot-text">
                Unlock premium cosmetics to customize your experience and show 
                off your style at the tables!
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Final CTA */}
      <section className="homepage-section homepage-section--cta">
        <div className="container">
          <div className="final-cta">
            <RivaMascot 
              animation="waving" 
              size="medium"
            />
            <h2 className="final-cta__title">
              Ready to Play?
            </h2>
            <p className="final-cta__subtitle">
              Connect your Solana wallet and join the Riviera
            </p>
            <PremiumButton
              variant="primary"
              size="lg"
              onClick={onPlayNow}
            >
              🎰 Start Playing Now
            </PremiumButton>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="homepage-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>SolJack Riviera</h3>
              <p>Mediterranean luxury × Solana blackjack</p>
            </div>
            
            <div className="footer-links">
              <div className="footer-column">
                <h4>Game</h4>
                <ul>
                  <li><a href="/practice">Practice</a></li>
                  <li><a href="/pvp">PvP Matches</a></li>
                  <li><a href="/tournaments">Tournaments</a></li>
                </ul>
              </div>
              
              <div className="footer-column">
                <h4>Community</h4>
                <ul>
                  <li><a href="/leaderboard">Leaderboard</a></li>
                  <li><a href="https://twitter.com/soljack" target="_blank">Twitter</a></li>
                  <li><a href="https://discord.gg/soljack" target="_blank">Discord</a></li>
                </ul>
              </div>
              
              <div className="footer-column">
                <h4>Info</h4>
                <ul>
                  <li><a href="/how-it-works">How It Works</a></li>
                  <li><a href="/provably-fair">Provably Fair</a></li>
                  <li><a href="/terms">Terms</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>© 2024 SolJack Riviera. Built on Solana.</p>
            <div className="footer-badges">
              <span className="badge badge--pumpfun">Powered by Pump.fun</span>
              <span className="badge badge--solana">Built on Solana</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
