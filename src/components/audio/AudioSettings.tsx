import React from 'react';
import { useAudio } from './AudioManager';
import './AudioSettings.css';

export const AudioSettings: React.FC = () => {
  const {
    sfxVolume,
    musicVolume,
    setSfxVolume,
    setMusicVolume,
    isSfxMuted,
    isMusicMuted,
    isMasterMuted,
    toggleSfxMute,
    toggleMusicMute,
    toggleMasterMute,
    playSound,
  } = useAudio();
  
  return (
    <div className="audio-settings">
      <h3 className="audio-settings__title">🔊 Audio Settings</h3>
      
      {/* Master Mute */}
      <div className="audio-setting">
        <label className="audio-setting__label">
          <span>Master Audio</span>
          <button 
            className={`mute-toggle ${isMasterMuted ? 'muted' : ''}`}
            onClick={toggleMasterMute}
          >
            {isMasterMuted ? '🔇' : '🔊'}
          </button>
        </label>
      </div>
      
      {/* Sound Effects Volume */}
      <div className="audio-setting">
        <label className="audio-setting__label">
          <span>Sound Effects</span>
          <button 
            className={`mute-toggle ${isSfxMuted ? 'muted' : ''}`}
            onClick={toggleSfxMute}
          >
            {isSfxMuted ? '🔇' : '🔊'}
          </button>
        </label>
        <div className="volume-control">
          <input
            type="range"
            min="0"
            max="100"
            value={sfxVolume * 100}
            onChange={(e) => setSfxVolume(Number(e.target.value) / 100)}
            disabled={isSfxMuted || isMasterMuted}
            className="volume-slider"
          />
          <span className="volume-value">{Math.round(sfxVolume * 100)}%</span>
        </div>
        <button 
          className="test-button"
          onClick={() => playSound('win-chime')}
          disabled={isSfxMuted || isMasterMuted}
        >
          Test Sound
        </button>
      </div>
      
      {/* Music Volume */}
      <div className="audio-setting">
        <label className="audio-setting__label">
          <span>Background Music</span>
          <button 
            className={`mute-toggle ${isMusicMuted ? 'muted' : ''}`}
            onClick={toggleMusicMute}
          >
            {isMusicMuted ? '🔇' : '🎵'}
          </button>
        </label>
        <div className="volume-control">
          <input
            type="range"
            min="0"
            max="100"
            value={musicVolume * 100}
            onChange={(e) => setMusicVolume(Number(e.target.value) / 100)}
            disabled={isMusicMuted || isMasterMuted}
            className="volume-slider"
          />
          <span className="volume-value">{Math.round(musicVolume * 100)}%</span>
        </div>
      </div>
    </div>
  );
};

export default AudioSettings;
