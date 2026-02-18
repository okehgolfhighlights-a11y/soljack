import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { MEDIA, MusicKey, SfxKey } from "../assets/media";

type AudioCtx = {
  isUnlocked: boolean;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  musicVolume: number; // 0..1
  sfxVolume: number;   // 0..1
  unlockAudio: () => Promise<void>;
  setMusicEnabled: (v: boolean) => void;
  setSfxEnabled: (v: boolean) => void;
  setMusicVolume: (v: number) => void;
  setSfxVolume: (v: number) => void;
  playSfx: (key: SfxKey) => void;
  playMusic: (key: MusicKey) => void;
  stopMusic: () => void;
};

const Ctx = createContext<AudioCtx | null>(null);

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState(false);

  const [musicEnabled, setMusicEnabled] = useState(true);
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const [musicVolume, setMusicVolume] = useState(0.35);
  const [sfxVolume, setSfxVolume] = useState(0.7);

  const musicRef = useRef<HTMLAudioElement | null>(null);
  const currentTrackRef = useRef<MusicKey | null>(null);

  // Preload SFX players (cheap + fast)
  const sfxPlayers = useRef<Record<string, HTMLAudioElement>>({});

  useEffect(() => {
    // Precreate audio elements (no autoplay)
    const keys = Object.keys(MEDIA.sfx) as SfxKey[];
    keys.forEach((k) => {
      const a = new Audio(MEDIA.sfx[k]);
      a.preload = "auto";
      sfxPlayers.current[k] = a;
    });

    const m = new Audio();
    m.preload = "auto";
    m.loop = true;
    musicRef.current = m;
  }, []);

  useEffect(() => {
    if (musicRef.current) musicRef.current.volume = clamp01(musicVolume);
  }, [musicVolume]);

  const unlockAudio = async () => {
    // Browser requires a user gesture. We "prime" by playing silent then pausing.
    try {
      const a = new Audio();
      a.volume = 0;
      await a.play();
      a.pause();
      setIsUnlocked(true);
    } catch {
      // If it fails, user needs another gesture (click/tap)
      setIsUnlocked(false);
    }
  };

  const playSfx = (key: SfxKey) => {
    if (!sfxEnabled) return;
    const player = sfxPlayers.current[key];
    if (!player) return;

    try {
      player.currentTime = 0;
      player.volume = clamp01(sfxVolume);
      void player.play();
    } catch {
      // ignore (autoplay restrictions until unlocked)
    }
  };

  const playMusic = (key: MusicKey) => {
    if (!musicEnabled) return;
    const m = musicRef.current;
    if (!m) return;

    const src = MEDIA.music[key];
    if (currentTrackRef.current !== key) {
      m.src = src;
      currentTrackRef.current = key;
    }

    m.volume = clamp01(musicVolume);

    try {
      void m.play();
    } catch {
      // ignore (autoplay restrictions until unlocked)
    }
  };

  const stopMusic = () => {
    const m = musicRef.current;
    if (!m) return;
    try {
      m.pause();
    } catch {
      // ignore
    }
  };

  const value = useMemo<AudioCtx>(
    () => ({
      isUnlocked,
      musicEnabled,
      sfxEnabled,
      musicVolume,
      sfxVolume,
      unlockAudio,
      setMusicEnabled,
      setSfxEnabled,
      setMusicVolume: (v) => setMusicVolume(clamp01(v)),
      setSfxVolume: (v) => setSfxVolume(clamp01(v)),
      playSfx,
      playMusic,
      stopMusic,
    }),
    [isUnlocked, musicEnabled, sfxEnabled, musicVolume, sfxVolume]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAudio() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAudio must be used inside <AudioProvider />");
  return ctx;
}