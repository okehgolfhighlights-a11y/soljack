// Centralized asset URLs for Vite (works in dev + Netlify build)
const u = (p: string) => new URL(p, import.meta.url).toString();

export const MEDIA = {
  backgrounds: {
    day1: u("./backgrounds/cinque-terre-day-1.jpg"),
    day2: u("./backgrounds/cinque-terre-day-2.jpg"),
    goldenHour: u("./backgrounds/cinque-terre-golden-hour.jpg"),
    sunset: u("./backgrounds/cinque-terre-sunset.jpg"),
  },

  cardBacks: {
    default: u("./cards/card-back-default.png"),
    solana: u("./cards/card-back-solana.png"),
    pumpfun: u("./cards/card-back-pumpfun.png"),
    goldFinale: u("./cards/card-back-gold-finale.png"),
  },

  riva: {
    icon: u("./riva/riva-icon.png"),
    lounging: u("./riva/riva-lounging.png"),
    sleeping: u("./riva/riva-sleeping.png"),
    sympathetic: u("./riva/riva-sympathetic.png"),
    thinking: u("./riva/riva-thinking.png"),
    waving: u("./riva/riva-waving.png"),
    celebratingSprite: u("./riva/riva-celebrating-sprite.png"),
    swimmingSprite: u("./riva/riva-swimming-sprite.png"),
  },

  music: {
    lobbyMain: u("./sounds/music/lobby-main.mp3"),
  },

  sfx: {
    bust: u("./sounds/sfx/sfx-bust.wav"),
    shuffle: u("./sounds/sfx/sfx-card-shuffle.wav"),
    cardSlide: u("./sounds/sfx/sfx-card-slide.wav"),
    chipClink: u("./sounds/sfx/sfx-chip-clink.wav"),
    clockBeep: u("./sounds/sfx/sfx-clock-beep.wav"),
    notification: u("./sounds/sfx/sfx-notification.wav"),
    winChime: u("./sounds/sfx/sfx-win-chime.wav"),
  },
} as const;

export type SfxKey = keyof typeof MEDIA.sfx;
export type MusicKey = keyof typeof MEDIA.music;