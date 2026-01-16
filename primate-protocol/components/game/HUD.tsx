"use client";

import { useMemo, useState } from "react";
import { useGameStore, selectSaveData } from "@/lib/game/state";
import { CONTROLS, GADGETS, LEVELS } from "@/lib/game/constants";
import { isSaveSupported, loadGame, saveGame } from "@/lib/save/save";

export default function HUD() {
  const levelId = useGameStore((state) => state.activeLevelId);
  const activeGadget = useGameStore((state) => state.activeGadget);
  const gadgetsUnlocked = useGameStore((state) => state.gadgetsUnlocked);
  const capturedCount = useGameStore((state) => state.capturedCount);
  const lastSaveAt = useGameStore((state) => state.lastSaveAt);
  const applySaveData = useGameStore((state) => state.applySaveData);
  const markSaved = useGameStore((state) => state.markSaved);
  const saveData = useGameStore(selectSaveData);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const level = useMemo(
    () => LEVELS.find((item) => item.id === levelId),
    [levelId]
  );

  const unlockedGadgets = useMemo(
    () => GADGETS.filter((gadget) => gadgetsUnlocked[gadget.id]),
    [gadgetsUnlocked]
  );

  const handleSave = async () => {
    if (!isSaveSupported()) {
      setSaveStatus("Save unavailable in this environment.");
      return;
    }
    setSaveStatus("Saving...");
    try {
      await saveGame(saveData);
      markSaved(Date.now());
      setSaveStatus("Save complete.");
    } catch (error) {
      setSaveStatus("Save failed.");
      console.warn(error);
    }
  };

  const handleLoad = async () => {
    if (!isSaveSupported()) {
      setSaveStatus("Load unavailable in this environment.");
      return;
    }
    setSaveStatus("Loading...");
    try {
      const loaded = await loadGame();
      if (loaded) {
        applySaveData(loaded);
        setSaveStatus("Loaded save.");
      } else {
        setSaveStatus("No save found.");
      }
    } catch (error) {
      setSaveStatus("Load failed.");
      console.warn(error);
    }
  };

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4">
      <div className="flex flex-wrap gap-4">
        <div className="rounded-2xl border border-slate-700/70 bg-slate-950/70 px-4 py-3 text-xs text-slate-200 shadow">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
            Level
          </p>
          <p className="text-sm font-semibold text-white">
            {level?.name ?? "Unknown"}
          </p>
          <p className="text-[11px] text-slate-400">
            Captured: {capturedCount}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-700/70 bg-slate-950/70 px-4 py-3 text-xs text-slate-200 shadow">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
            Active Gadget
          </p>
          <p className="text-sm font-semibold text-white">
            {GADGETS.find((gadget) => gadget.id === activeGadget)?.name ??
              "None"}
          </p>
          <p className="text-[11px] text-slate-400">
            Unlocked: {unlockedGadgets.length}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="rounded-2xl border border-slate-700/70 bg-slate-950/70 px-4 py-3 text-[11px] text-slate-300 shadow">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
            Controls
          </p>
          <ul className="mt-2 space-y-1">
            {CONTROLS.map((control) => (
              <li key={control.action} className="flex gap-2">
                <span className="w-20 text-slate-400">{control.label}</span>
                <span>{control.keys.join(" / ")}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="pointer-events-auto rounded-2xl border border-slate-700/70 bg-slate-950/70 px-4 py-3 text-[11px] text-slate-300 shadow">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
            Local save
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              className="rounded-full border border-slate-600 px-3 py-1 text-[11px] font-semibold text-slate-200 transition hover:border-emerald-400 hover:text-emerald-200"
              type="button"
              onClick={handleSave}
            >
              Save
            </button>
            <button
              className="rounded-full border border-slate-600 px-3 py-1 text-[11px] font-semibold text-slate-200 transition hover:border-emerald-400 hover:text-emerald-200"
              type="button"
              onClick={handleLoad}
            >
              Load
            </button>
          </div>
          <p className="mt-2 text-[10px] text-slate-500">
            {saveStatus ??
              (lastSaveAt
                ? `Last save: ${new Date(lastSaveAt).toLocaleTimeString()}`
                : "No save yet.")}
          </p>
        </div>
      </div>
    </div>
  );
}
