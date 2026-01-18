"use client";

import { useMemo, useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { skip, useMutation, useQuery } from "convex/react";

import { useGameStore, selectSaveData } from "@/lib/game/state";
import { CONTROLS, GADGETS } from "@/lib/game/constants";
import { LEVELS } from "@/lib/game/LEVELS.1";
import { api } from "@/convex/_generated/api";
import { isAuthConfigured } from "@/lib/env";
import {
  isSaveSupported,
  loadGame,
  migrateSave,
  saveGame,
} from "@/lib/save/save";
import type { GameSave, GameSaveData } from "@/lib/save/save";

type SavePanelProps = {
  saveData: GameSaveData;
  applySaveData: (data: GameSaveData) => void;
  markSaved: (timestamp: number) => void;
  lastSaveAt: number | null;
};

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
     Derived data
     ========================= */
  const level = useMemo(
    () => LEVELS.find((item) => item.id === levelId) ?? null,
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
        <SavePanel
          saveData={saveData}
          applySaveData={applySaveData}
          markSaved={markSaved}
          lastSaveAt={lastSaveAt}
        />
      </div>
    </div>
  );
}

const formatLastSave = (lastSaveAt: number | null) =>
  lastSaveAt
    ? `Last save: ${new Date(lastSaveAt).toLocaleTimeString()}`
    : "No save yet.";

function SavePanel(props: SavePanelProps) {
  if (!isAuthConfigured) {
    return <LocalSavePanel {...props} />;
  }

  return <CloudSavePanel {...props} />;
}

function LocalSavePanel({
  saveData,
  applySaveData,
  markSaved,
  lastSaveAt,
}: SavePanelProps) {
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!saveStatus) return;
    const timer = setTimeout(() => setSaveStatus(null), 3000);
    return () => clearTimeout(timer);
  }, [saveStatus]);

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

  return (
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
        {saveStatus ?? formatLastSave(lastSaveAt)}
      </p>
    </div>
  );
}

function CloudSavePanel({
  saveData,
  applySaveData,
  markSaved,
  lastSaveAt,
}: SavePanelProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const upsertSave = useMutation(api.saves.upsertSave);
  const cloudSave = useQuery(
    api.saves.getLatest,
    isSignedIn ? {} : skip
  ) as GameSave | null | undefined;

  useEffect(() => {
    if (!saveStatus) return;
    const timer = setTimeout(() => setSaveStatus(null), 3000);
    return () => clearTimeout(timer);
  }, [saveStatus]);

  useEffect(() => {
    if (!cloudSave?.updatedAt) {
      return;
    }
    const parsed = Date.parse(cloudSave.updatedAt);
    if (!Number.isNaN(parsed)) {
      markSaved(parsed);
    }
  }, [cloudSave, markSaved]);

  const saveLocalBackup = async () => {
    if (!isSaveSupported()) {
      return null;
    }

    try {
      await saveGame(saveData);
      return true;
    } catch (error) {
      console.warn("Local save failed:", error);
      return false;
    }
  };

  const loadLocalSave = async (missingLabel: string) => {
    if (!isSaveSupported()) {
      setSaveStatus("Load unavailable in this environment.");
      return false;
    }

    setSaveStatus("Loading local save...");
    try {
      const loaded = await loadGame();
      if (!loaded) {
        setSaveStatus(missingLabel);
        return false;
      }
      applySaveData(loaded);
      setSaveStatus("Loaded local save.");
      return true;
    } catch (err) {
      console.warn("Load failed:", err);
      setSaveStatus("Load failed.");
      return false;
    }
  };

  const handleSave = async () => {
    const savedAt = Date.now();

    if (!isLoaded) {
      setSaveStatus("Checking account...");
      return;
    }

    if (isSignedIn) {
      setSaveStatus("Saving to cloud...");
      let cloudSaved = false;

      try {
        await upsertSave({ data: saveData });
        cloudSaved = true;
      } catch (error) {
        console.warn("Cloud save failed:", error);
      }

      const localBackup = await saveLocalBackup();

      if (cloudSaved) {
        markSaved(savedAt);
        setSaveStatus(
          localBackup === false
            ? "Cloud save complete. Local backup failed."
            : "Cloud save complete."
        );
        return;
      }

      if (localBackup) {
        markSaved(savedAt);
        setSaveStatus("Cloud save failed. Saved locally.");
        return;
      }

      setSaveStatus(
        localBackup === null ? "Cloud save failed." : "Save failed."
      );
      return;
    }

    if (!isSaveSupported()) {
      setSaveStatus("Save unavailable in this environment.");
      return;
    }

    setSaveStatus("Saving locally...");
    try {
      await saveGame(saveData);
      markSaved(savedAt);
      setSaveStatus("Local save complete.");
    } catch (err) {
      console.warn("Save failed:", err);
      setSaveStatus("Save failed.");
    }
  };

  const handleLoad = async () => {
    if (isLoaded && isSignedIn) {
      if (cloudSave === undefined) {
        setSaveStatus("Loading cloud save...");
        return;
      }

      if (cloudSave) {
        const migrated = migrateSave(cloudSave);
        if (!migrated) {
          setSaveStatus("Cloud save incompatible.");
          return;
        }
        applySaveData(migrated);
        const parsed = Date.parse(cloudSave.updatedAt);
        markSaved(Number.isNaN(parsed) ? Date.now() : parsed);
        setSaveStatus("Loaded cloud save.");
        return;
      }

      setSaveStatus("No cloud save found. Checking local save...");
    }

    await loadLocalSave(
      isLoaded && isSignedIn ? "No local save found." : "No save found."
    );
  };

  const saveTitle = !isLoaded
    ? "Save"
    : isSignedIn
      ? "Cloud Save"
      : "Local Save";
  const saveHint = !isLoaded
    ? "Checking account..."
    : isSignedIn
      ? "Cloud save enabled."
      : "Sign in to enable cloud saves.";

  return (
    <div className="pointer-events-auto rounded-2xl border border-slate-700/70 bg-slate-950/70 px-4 py-3 text-[11px] text-slate-300 shadow">
      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
        {saveTitle}
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
        {saveStatus ?? formatLastSave(lastSaveAt)}
      </p>
      <p className="mt-1 text-[10px] text-slate-600">{saveHint}</p>
    </div>
  );
}