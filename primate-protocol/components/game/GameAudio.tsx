"use client";

import { useEffect, useRef, useState } from "react";
import { useGameStore } from "@/lib/game/state";
import { AUDIO_LIBRARY, SOUNDTRACK_ID } from "@/lib/game/audio";

export default function GameAudio() {
  const isPaused = useGameStore((state) => state.isPaused);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const musicRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const track = AUDIO_LIBRARY[SOUNDTRACK_ID];
    const audio = new Audio(track.src);
    audio.loop = true;
    audio.volume = track.volume;
    audio.preload = "auto";
    musicRef.current = audio;

    const unlockAudio = () => {
      setIsUnlocked(true);
      audio.play().catch(() => undefined);
    };

    window.addEventListener("pointerdown", unlockAudio, { once: true });
    window.addEventListener("keydown", unlockAudio, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      audio.pause();
      audio.src = "";
    };
  }, []);

  useEffect(() => {
    const audio = musicRef.current;
    if (!audio || !isUnlocked) {
      return;
    }
    if (isPaused) {
      audio.pause();
    } else {
      audio.play().catch(() => undefined);
    }
  }, [isPaused, isUnlocked]);

  return null;
}
