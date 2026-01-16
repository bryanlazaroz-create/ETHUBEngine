"use client";

import { useMemo, useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import type { RigidBodyApi } from "@react-three/rapier";
import {
  GADGETS,
  GADGET_SETTINGS,
  type ControlName,
  type GadgetId,
} from "@/lib/game/constants";
import { useGameStore } from "@/lib/game/state";

type ControlState = Record<ControlName, boolean>;

type GadgetSystemProps = {
  playerRef: MutableRefObject<RigidBodyApi | null>;
};

const gadgetKeyMap: Record<GadgetId, ControlName> = {
  "capture-lasso": "capture",
  "pulse-baton": "stun",
  "sonic-beacon": "lure",
  "grapple-line": "grapple",
};

export default function GadgetSystem({ playerRef }: GadgetSystemProps) {
  const [, getKeys] = useKeyboardControls<ControlState>();
  const isPaused = useGameStore((state) => state.isPaused);
  const togglePause = useGameStore((state) => state.togglePause);
  const gadgetsUnlocked = useGameStore((state) => state.gadgetsUnlocked);
  const triggerGadgetEvent = useGameStore((state) => state.triggerGadgetEvent);

  const cooldowns = useMemo(
    () =>
      GADGETS.reduce<Record<GadgetId, number>>((acc, gadget) => {
        acc[gadget.id] = gadget.cooldownMs;
        return acc;
      }, {} as Record<GadgetId, number>),
    []
  );

  const lastPress = useRef<Record<ControlName, boolean>>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    sprint: false,
    capture: false,
    stun: false,
    lure: false,
    grapple: false,
    pause: false,
  });

  const nextReadyAt = useRef<Record<GadgetId, number>>({
    "capture-lasso": 0,
    "pulse-baton": 0,
    "sonic-beacon": 0,
    "grapple-line": 0,
  });

  useFrame(() => {
    const keys = getKeys();

    if (keys.pause && !lastPress.current.pause) {
      togglePause();
    }

    lastPress.current.pause = keys.pause;

    if (isPaused) {
      return;
    }

    const now = performance.now();
    (Object.keys(gadgetKeyMap) as GadgetId[]).forEach((gadgetId) => {
      const controlName = gadgetKeyMap[gadgetId];
      const pressed = keys[controlName];
      const wasPressed = lastPress.current[controlName];

      if (pressed && !wasPressed) {
        if (!gadgetsUnlocked[gadgetId]) {
          lastPress.current[controlName] = pressed;
          return;
        }
        if (now < nextReadyAt.current[gadgetId]) {
          lastPress.current[controlName] = pressed;
          return;
        }

        const body = playerRef.current;
        if (body) {
          const origin = body.translation();
          const radius =
            gadgetId === "capture-lasso"
              ? GADGET_SETTINGS.captureRadius
              : gadgetId === "pulse-baton"
                ? GADGET_SETTINGS.stunRadius
                : gadgetId === "sonic-beacon"
                  ? GADGET_SETTINGS.lureRadius
                  : GADGET_SETTINGS.grappleRange;
          triggerGadgetEvent(gadgetId, [origin.x, origin.y, origin.z], radius);
          nextReadyAt.current[gadgetId] = now + cooldowns[gadgetId];
        }
      }

      lastPress.current[controlName] = pressed;
    });
  });

  return null;
}
