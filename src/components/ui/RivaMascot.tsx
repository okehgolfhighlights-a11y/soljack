import React, { useEffect, useState } from 'react';
import './RivaMascot.css';

export type RivaAnimation = 
  | 'swimming' 
  | 'lounging' 
  | 'waving' 
  | 'celebrating' 
  | 'thinking' 
  | 'sleeping' 
  | 'sympathetic'
  | 'icon';

export type RivaSize = 'tiny' | 'small' | 'medium' | 'large';

export type RivaPosition = 
  | 'top-left' 
  | 'top-right' 
  | 'bottom-left' 
  | 'bottom-right' 
  | 'center';

export interface RivaMascotProps {
  animation: RivaAnimation;
  size?: RivaSize;
  position?: RivaPosition;
  interactive?: boolean;
  loop?: boolean;
  className?: string;
  onEasterEgg?: () => void;
}

// Asset paths mapping
const RIVA_ASSETS: Record<RivaAnimation, string> = {
  swimming: '/assets/riva/riva-swimming-sprite.png',
  lounging: '/assets/riva/riva-lounging.png',
  waving: '/assets/riva/riva-waving.png',
  celebrating: '/assets/riva/riva-celebrating-sprite.png',
  thinking: '/assets/riva/riva-thinking.png',
  sleeping: '/assets/riva/riva-sleeping.png',
  sympathetic: '/assets/riva/riva-sympathetic.png',
  icon: '/assets/riva/riva-icon.png',
};

export const RivaMascot: React.FC<RivaMascotProps> = ({
  animation,
  size = 'medium',
  position,
  interactive = false,
  loop = true,
  className = '',
  onEasterEgg,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Easter egg: Click Riva 5 times quickly
  useEffect(() => {
    if (clickCount >= 5) {
      onEasterEgg?.();
      setClickCount(0);
    }
  }, [clickCount, onEasterEgg]);

  // Reset click count after 2 seconds
  useEffect(() => {
    if (clickCount > 0 && clickCount < 5) {
      const timer = setTimeout(() => {
        setClickCount(0);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [clickCount]);

  const handleClick = () => {
    if (interactive) {
      setClickCount((prev) => prev + 1);
    }
  };

  const classes = [
    'riva-mascot',
    `riva-mascot--${size}`,
    `riva-mascot--${animation}`,
    position && `riva-mascot--${position}`,
    interactive && 'riva-mascot--interactive',
    loop && 'riva-mascot--loop',
    isHovered && 'riva-mascot--hovered',
    !imageLoaded && 'riva-mascot--loading',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const imageSrc = RIVA_ASSETS[animation];
  const altText = `Riva the sea dragon, ${animation}`;

  return (
    <div
      className={classes}
      onClick={handleClick}
      onMouseEnter={() => interactive && setIsHovered(true)}
      onMouseLeave={() => interactive && setIsHovered(false)}
      role={interactive ? 'button' : 'img'}
      aria-label={altText}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={(e) => {
        if (interactive && (e.key === 'Enter' || e.key === ' ')) {
          handleClick();
        }
      }}
    >
      <img 
        src={imageSrc}
        alt={altText}
        className="riva-image"
        onLoad={() => setImageLoaded(true)}
        draggable={false}
      />

      {/* Sparkle effect on hover (if interactive) */}
      {interactive && isHovered && (
        <div className="riva-sparkles">
          <span className="sparkle sparkle-1">✨</span>
          <span className="sparkle sparkle-2">✨</span>
          <span className="sparkle sparkle-3">✨</span>
        </div>
      )}

      {/* Click counter for easter egg */}
      {interactive && clickCount > 0 && clickCount < 5 && (
        <div className="riva-click-counter">{clickCount}/5</div>
      )}
    </div>
  );
};

export default RivaMascot;
