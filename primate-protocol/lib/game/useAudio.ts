import { useCallback, useRef } from "react";
import { AUDIO_LIBRARY, type AudioId } from "@/lib/game/audio";

const createAudio = (id: AudioId) => {
  const asset = AUDIO_LIBRARY[id];
  const audio = new Audio(asset.src);
  audio.volume = asset.volume;
  audio.loop = asset.loop ?? false;
  audio.preload = "auto";
  return audio;
};

export const useSoundEffects = () => {
  const poolRef = useRef<Map<AudioId, HTMLAudioElement>>(new Map());

  const getBaseAudio = useCallback((id: AudioId) => {
    const cached = poolRef.current.get(id);
    if (cached) {
      return cached;
    }
    const created = createAudio(id);
    poolRef.current.set(id, created);
    return created;
  }, []);

  const playSfx = useCallback(
    (id: AudioId) => {
      const base = getBaseAudio(id);
      const instance = base.paused
        ? base
        : (base.cloneNode(true) as HTMLAudioElement);

      instance.loop = false;
      instance.currentTime = 0;
      instance.volume = base.volume;
      instance.play().catch(() => undefined);
    },
    [getBaseAudio]
  );

  return { playSfx };
};
