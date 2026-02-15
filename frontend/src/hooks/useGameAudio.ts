// Custom hooks for using audio in game components

import { useCallback } from 'react';
import { useAudio } from '../components/audio/AudioManager';
import type { SoundEffect } from '../components/audio/AudioManager';

/**
 * Hook for game sound effects
 * Provides easy-to-use functions for common game actions
 */
export const useGameAudio = () => {
  const { playSound } = useAudio();
  
  // Card actions
  const playCardShuffle = useCallback(() => {
    playSound('card-shuffle');
  }, [playSound]);
  
  const playCardDeal = useCallback(() => {
    playSound('card-slide');
  }, [playSound]);
  
  // Betting actions
  const playChipSound = useCallback(() => {
    playSound('chip-clink');
  }, [playSound]);
  
  // Game events
  const playWinSound = useCallback(() => {
    playSound('win-chime');
  }, [playSound]);
  
  const playBustSound = useCallback(() => {
    playSound('bust');
  }, [playSound]);
  
  // UI events
  const playNotification = useCallback(() => {
    playSound('notification');
  }, [playSound]);
  
  const playClockWarning = useCallback(() => {
    playSound('clock-beep');
  }, [playSound]);
  
  return {
    playCardShuffle,
    playCardDeal,
    playChipSound,
    playWinSound,
    playBustSound,
    playNotification,
    playClockWarning,
  };
};

/**
 * Hook for background music control
 */
export const useMusicPlayer = () => {
  const {
    playMusic,
    pauseMusic,
    stopMusic,
    isMusicPlaying,
  } = useAudio();
  
  return {
    play: playMusic,
    pause: pauseMusic,
    stop: stopMusic,
    isPlaying: isMusicPlaying,
  };
};

export default useGameAudio;
