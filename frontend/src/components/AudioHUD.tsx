import { useEffect } from "react";
import { useAudio } from "../context/AudioContext";

export default function AudioHUD() {
  const {
    isUnlocked,
    unlockAudio,
    musicEnabled,
    sfxEnabled,
    setMusicEnabled,
    setSfxEnabled,
    playMusic,
    stopMusic,
    playSfx,
  } = useAudio();

  // Default: lobby music when enabled
  useEffect(() => {
    if (musicEnabled) playMusic("lobbyMain");
    else stopMusic();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [musicEnabled]);

  return (
    <div style={styles.wrap}>
      <button
        style={{ ...styles.btn, ...(isUnlocked ? {} : styles.btnWarn) }}
        onClick={async () => {
          await unlockAudio();
          playSfx("notification");
        }}
        title="Click once to enable audio (browser requirement)"
      >
        {isUnlocked ? "🔊 Audio" : "🔒 Audio"}
      </button>

      <button
        style={styles.btn}
        onClick={() => {
          setMusicEnabled(!musicEnabled);
          playSfx("chipClink");
        }}
        title="Toggle music"
      >
        {musicEnabled ? "🎵 On" : "🎵 Off"}
      </button>

      <button
        style={styles.btn}
        onClick={() => {
          setSfxEnabled(!sfxEnabled);
          playSfx("chipClink");
        }}
        title="Toggle sound effects"
      >
        {sfxEnabled ? "✨ SFX" : "🚫 SFX"}
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    position: "fixed",
    right: 14,
    bottom: 14,
    zIndex: 9999,
    display: "flex",
    gap: 10,
    padding: 10,
    borderRadius: 14,
    background: "rgba(0,0,0,0.35)",
    backdropFilter: "blur(10px)",
  },
  btn: {
    border: "1px solid rgba(255,255,255,0.25)",
    background: "rgba(255,255,255,0.08)",
    color: "white",
    padding: "10px 12px",
    borderRadius: 12,
    fontWeight: 800,
    cursor: "pointer",
  },
  btnWarn: {
    borderColor: "rgba(255,200,0,0.55)",
  },
};