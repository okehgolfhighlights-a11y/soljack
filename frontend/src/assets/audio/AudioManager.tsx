import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

// Sound effect types
export type SoundEffect = 
  | 'card-shuffle'
  | 'card-slide'
  | 'chip-clink'
  | 'clock-beep'
  | 'bust'
  | 'win-chime'
  | 'notification';

// Audio paths
const SOUND_PATHS: Record<SoundEffect, string> = {
  'card-shuffle': '/assets/sounds/sfx/sfx-card-shuffle.wav',
  'card-slide': '/assets/sounds/sfx/sfx-card-slide.wav',
  'chip-clink': '/assets/sounds/sfx/sfx-chip-clink.wav',
  'clock-beep': '/assets/sounds/sfx/sfx-clock-beep.wav',
  'bust': '/assets/sounds/sfx/sfx-bust.wav',
  'win-chime': '/assets/sounds/sfx/sfx-win-chime.wav',
  'notification': '/assets/sounds/sfx/sfx-notification.wav',
};

const MUSIC_PATH = '/assets/sounds/music/lobby-main.mp3';

interface AudioContextType {
  // Sound effects
  playSound: (effect: SoundEffect) => void;
  
  // Music
  playMusic: () => void;
  pauseMusic: () => void;
  stopMusic: () => void;
  isMusicPlaying: boolean;
  
  // Volume controls
  sfxVolume: number;
  musicVolume: number;
  setSfxVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  
  // Mute controls
  isSfxMuted: boolean;
  isMusicMuted: boolean;
  toggleSfxMute: () => void;
  toggleMusicMute: () => void;
  
  // Master mute
  isMasterMuted: boolean;
  toggleMasterMute: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within AudioProvider');
  }
  return context;
};

interface AudioProviderProps {
  children: React.ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  // Volume states
  const [sfxVolume, setSfxVolume] = useState(0.7);
  const [musicVolume, setMusicVolume] = useState(0.3);
  
  // Mute states
  const [isSfxMuted, setIsSfxMuted] = useState(false);
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  const [isMasterMuted, setIsMasterMuted] = useState(false);
  
  // Music player state
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  
  // Audio element refs
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const soundCache = useRef<Map<SoundEffect, HTMLAudioElement>>(new Map());
  
  // Initialize music player
  useEffect(() => {
    musicRef.current = new Audio(MUSIC_PATH);
    musicRef.current.loop = true;
    musicRef.current.volume = musicVolume;
    
    return () => {
      musicRef.current?.pause();
      musicRef.current = null;
    };
  }, []);
  
  // Preload all sound effects
  useEffect(() => {
    Object.entries(SOUND_PATHS).forEach(([effect, path]) => {
      const audio = new Audio(path);
      audio.preload = 'auto';
      soundCache.current.set(effect as SoundEffect, audio);
    });
  }, []);
  
  // Update music volume
  useEffect(() => {
    if (musicRef.current) {
      musicRef.current.volume = isMusicMuted || isMasterMuted ? 0 : musicVolume;
    }
  }, [musicVolume, isMusicMuted, isMasterMuted]);
  
  // Play sound effect
  const playSound = (effect: SoundEffect) => {
    if (isSfxMuted || isMasterMuted) return;
    
    const audio = soundCache.current.get(effect);
    if (audio) {
      // Clone the audio to allow overlapping sounds
      const sound = audio.cloneNode() as HTMLAudioElement;
      sound.volume = sfxVolume;
      sound.play().catch(err => {
        console.warn('Failed to play sound:', effect, err);
      });
    }
  };
  
  // Music controls
  const playMusic = () => {
    if (musicRef.current && !isMusicPlaying) {
      musicRef.current.play().catch(err => {
        console.warn('Failed to play music:', err);
      });
      setIsMusicPlaying(true);
    }
  };
  
  const pauseMusic = () => {
    if (musicRef.current && isMusicPlaying) {
      musicRef.current.pause();
      setIsMusicPlaying(false);
    }
  };
  
  const stopMusic = () => {
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current.currentTime = 0;
      setIsMusicPlaying(false);
    }
  };
  
  // Mute toggles
  const toggleSfxMute = () => setIsSfxMuted(prev => !prev);
  const toggleMusicMute = () => setIsMusicMuted(prev => !prev);
  const toggleMasterMute = () => setIsMasterMuted(prev => !prev);
  
  const value: AudioContextType = {
    playSound,
    playMusic,
    pauseMusic,
    stopMusic,
    isMusicPlaying,
    sfxVolume,
    musicVolume,
    setSfxVolume,
    setMusicVolume,
    isSfxMuted,
    isMusicMuted,
    toggleSfxMute,
    toggleMusicMute,
    isMasterMuted,
    toggleMasterMute,
  };
  
  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};

export default AudioProvider;
