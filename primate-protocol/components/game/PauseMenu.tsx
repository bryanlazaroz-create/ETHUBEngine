"use client";

import Link from "next/link";
import { useGameStore } from "@/lib/game/state";

export default function PauseMenu() {
  const isPaused = useGameStore((state) => state.isPaused);
  const togglePause = useGameStore((state) => state.togglePause);

  if (!isPaused) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/80 text-slate-100 backdrop-blur">
      <div className="w-full max-w-md space-y-4 rounded-3xl border border-slate-700 bg-slate-900/90 p-6 text-center shadow-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
          Paused
        </p>
        <h2 className="text-2xl font-semibold text-white">Mission paused</h2>
        <p className="text-sm text-slate-300">
          Review your objectives, adjust your approach, and resume when ready.
        </p>
        <div className="flex flex-col gap-3">
          <button
            className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
            type="button"
            onClick={togglePause}
          >
            Resume
          </button>
          <Link
            className="rounded-full border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-400 hover:text-emerald-200"
            href="/"
          >
            Return to menu
          </Link>
        </div>
      </div>
    </div>
  );
}
