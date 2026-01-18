"use client";

import { useMemo, useState, useEffect } from "react";

import { useGameStore, selectSaveData } from "@/lib/game/state";
import { CONTROLS, GADGETS } from "@/lib/game/constants";
import { LEVELS } from "@/lib/game/LEVELS.1";
import { isSaveSupported, loadGame, saveGame } from "@/lib/save/save";

export default function HUD() {
  /* =========================
     Store state (stable)
     ========================= */
  const levelId = useGameStore((state) => state.activeLevelId);
  const activeGadget = useGameStore((state) => state.activeGadget);
  const gadgetsUnlocked = useGameStore((state) => state.gadgetsUnlocked);
  const capturedCount = useGameStore((state) => state.capturedCount);
  const lastSaveAt = useGameStore((state) => state.lastSaveAt);

  const applySaveData = useGameStore((state) => state.applySaveData);
  const markSaved = useGameStore((state) => state.markSaved);
  const saveData = useGameStore(selectSaveData);

  /* =========================
     Local UI state
     ========================= */
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  /* =========================
     Derived data
     ========================= */
  const level = useMemo(
    () => LEVELS.find((item: { id: any; }) => item.id === levelId) ?? null,
    [levelId]
  );

  const unlockedGadgets = useMemo(
    () => GADGETS.filter((g) => gadgetsUnlocked[g.id]),
    [gadgetsUnlocked]
  );

  const activeGadgetName = useMemo(
    () => GADGETS.find((g) => g.id === activeGadget)?.name ?? "None",
    [activeGadget]
  );

  const availableControls = useMemo(() => {
    return CONTROLS.filter(
      (c) =>
        ["Capture", "Stun", "Lure", "Grapple"].includes(c.action)
          ? gadgetsUnlocked[c.action.toLowerCase() as keyof typeof gadgetsUnlocked]
          : true
    );
  }, [gadgetsUnlocked]);

  /* =========================
     Auto-clear save status
     ========================= */
  useEffect(() => {
    if (!saveStatus) return;
    const timer = setTimeout(() => setSaveStatus(null), 3000);
    return () => clearTimeout(timer);
  }, [saveStatus]);

  /* =========================
     Save / Load handlers
     ========================= */
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
    } catch (err) {
      console.warn("Save failed:", err);
      setSaveStatus("Save failed.");
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
      if (!loaded) {
        setSaveStatus("No save found.");
        return;
      }
      applySaveData(loaded);
      setSaveStatus("Loaded save.");
    } catch (err) {
      console.warn("Load failed:", err);
      setSaveStatus("Load failed.");
    }
  };

  /* =========================
     Render
     ========================= */
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4">
      {/* ================= TOP ================= */}
      <div className="flex flex-wrap gap-4">
        {/* Level */}
        <div className="rounded-2xl border border-slate-700/70 bg-slate-950/70 px-4 py-3 text-xs text-slate-200 shadow">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
            Level
          </p>
          <p className="text-sm font-semibold text-white">
            {level?.title ?? level?.name ?? "Unknown"}
          </p>
          <p className="text-[11px] text-slate-400">
            Captured: {capturedCount}
          </p>
        </div>

        {/* Gadget */}
        <div className="rounded-2xl border border-slate-700/70 bg-slate-950/70 px-4 py-3 text-xs text-slate-200 shadow">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
            Active Gadget
          </p>
          <p className="text-sm font-semibold text-white">
            {activeGadgetName}
          </p>
          <p className="text-[11px] text-slate-400">
            Unlocked: {unlockedGadgets.length}
          </p>
        </div>
      </div>

      {/* ================= BOTTOM ================= */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        {/* Controls */}
        <div className="rounded-2xl border border-slate-700/70 bg-slate-950/70 px-4 py-3 text-[11px] text-slate-300 shadow">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
            Controls
          </p>
          <ul className="mt-2 space-y-1">
            {availableControls.map((control) => (
              <li key={control.action} className="flex gap-2">
                <span className="w-20 text-slate-400">{control.label}</span>
                <span>{control.keys.join(" / ")}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Save */}
        <div className="pointer-events-auto rounded-2xl border border-slate-700/70 bg-slate-950/70 px-4 py-3 text-[11px] text-slate-300 shadow">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
            Local Save
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="rounded-full border border-slate-600 px-3 py-1 text-[11px] font-semibold text-slate-200 transition hover:border-emerald-400 hover:text-emerald-200"
            >
              Save
            </button>

            <button
              type="button"
              onClick={handleLoad}
              className="rounded-full border border-slate-600 px-3 py-1 text-[11px] font-semibold text-slate-200 transition hover:border-emerald-400 hover:text-emerald-200"
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