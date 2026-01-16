import type { GadgetId } from "@/lib/game/constants";

type AudioAsset = {
  src: string;
  volume: number;
  loop?: boolean;
};

export const AUDIO_LIBRARY = {
  "music-canopy-pursuit": {
    src: "/assets/audio/music-canopy-pursuit.mp3",
    volume: 0.32,
    loop: true,
  },
  "sfx-capture-lasso": {
    src: "/assets/audio/sfx-capture-lasso.wav",
    volume: 0.7,
  },
  "sfx-pulse-baton": {
    src: "/assets/audio/sfx-pulse-baton.wav",
    volume: 0.7,
  },
  "sfx-sonic-beacon": {
    src: "/assets/audio/sfx-sonic-beacon.wav",
    volume: 0.6,
  },
  "sfx-grapple-line": {
    src: "/assets/audio/sfx-grapple-line.wav",
    volume: 0.6,
  },
  "sfx-skitterling-chirp": {
    src: "/assets/audio/sfx-skitterling-chirp.wav",
    volume: 0.55,
  },
  "sfx-skitterling-stunned": {
    src: "/assets/audio/sfx-skitterling-stunned.wav",
    volume: 0.6,
  },
  "sfx-skitterling-captured": {
    src: "/assets/audio/sfx-skitterling-captured.wav",
    volume: 0.65,
  },
  "sfx-bark-bouncer-hop": {
    src: "/assets/audio/sfx-bark-bouncer-hop.wav",
    volume: 0.6,
  },
  "sfx-bark-bouncer-stunned": {
    src: "/assets/audio/sfx-bark-bouncer-stunned.wav",
    volume: 0.65,
  },
  "sfx-bark-bouncer-captured": {
    src: "/assets/audio/sfx-bark-bouncer-captured.wav",
    volume: 0.7,
  },
  "sfx-inkspawn-gurgle": {
    src: "/assets/audio/sfx-inkspawn-gurgle.wav",
    volume: 0.55,
  },
  "sfx-inkspawn-stunned": {
    src: "/assets/audio/sfx-inkspawn-stunned.wav",
    volume: 0.6,
  },
  "sfx-inkspawn-captured": {
    src: "/assets/audio/sfx-inkspawn-captured.wav",
    volume: 0.7,
  },
  "sfx-bolt-runner-burst": {
    src: "/assets/audio/sfx-bolt-runner-burst.wav",
    volume: 0.6,
  },
  "sfx-bolt-runner-stunned": {
    src: "/assets/audio/sfx-bolt-runner-stunned.wav",
    volume: 0.65,
  },
  "sfx-bolt-runner-captured": {
    src: "/assets/audio/sfx-bolt-runner-captured.wav",
    volume: 0.7,
  },
  "sfx-ui-pause-open": {
    src: "/assets/audio/sfx-ui-pause-open.wav",
    volume: 0.55,
  },
  "sfx-ui-pause-close": {
    src: "/assets/audio/sfx-ui-pause-close.wav",
    volume: 0.55,
  },
} satisfies Record<string, AudioAsset>;

export type AudioId = keyof typeof AUDIO_LIBRARY;

export type CreatureAudioKey =
  | "skitterling"
  | "bark-bouncer"
  | "inkspawn"
  | "bolt-runner";

export const SOUNDTRACK_ID: AudioId = "music-canopy-pursuit";

export const GADGET_SFX: Record<GadgetId, AudioId> = {
  "capture-lasso": "sfx-capture-lasso",
  "pulse-baton": "sfx-pulse-baton",
  "sonic-beacon": "sfx-sonic-beacon",
  "grapple-line": "sfx-grapple-line",
};

export const CREATURE_SFX: Record<
  CreatureAudioKey,
  { idle: AudioId; stunned: AudioId; captured: AudioId }
> = {
  skitterling: {
    idle: "sfx-skitterling-chirp",
    stunned: "sfx-skitterling-stunned",
    captured: "sfx-skitterling-captured",
  },
  "bark-bouncer": {
    idle: "sfx-bark-bouncer-hop",
    stunned: "sfx-bark-bouncer-stunned",
    captured: "sfx-bark-bouncer-captured",
  },
  inkspawn: {
    idle: "sfx-inkspawn-gurgle",
    stunned: "sfx-inkspawn-stunned",
    captured: "sfx-inkspawn-captured",
  },
  "bolt-runner": {
    idle: "sfx-bolt-runner-burst",
    stunned: "sfx-bolt-runner-stunned",
    captured: "sfx-bolt-runner-captured",
  },
};

export const UI_SFX = {
  pauseOpen: "sfx-ui-pause-open",
  pauseClose: "sfx-ui-pause-close",
} satisfies Record<string, AudioId>;

const CREATURE_AUDIO_KEYS: CreatureAudioKey[] = [
  "skitterling",
  "bark-bouncer",
  "inkspawn",
  "bolt-runner",
];

export const resolveCreatureAudioKey = (
  creatureId: string
): CreatureAudioKey =>
  CREATURE_AUDIO_KEYS.find((key) => creatureId.startsWith(key)) ??
  "skitterling";
