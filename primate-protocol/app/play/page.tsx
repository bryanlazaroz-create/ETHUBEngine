"use client";

import Link from "next/link";
import { LEVELS, type LevelDefinition } from "@/lib/game/constants";
import { GameCanvasClient } from "./GameCanvasClient";

type PlayPageProps = {
  levelId?: string;
};

export default function PlayPage({ levelId: initialLevelId }: PlayPageProps) {
  // Default to level-01 if nothing passed
  const level: LevelDefinition | undefined =
    LEVELS.find((lvl: { id: string | undefined; }) => lvl.id === initialLevelId) ||
    LEVELS.find((lvl: { id: string; }) => lvl.id === "level-01");

  const levelId = level?.id ?? "level-01";

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 lg:flex-row">
        {/* Left: 3D canvas (client-only) */}
        <section className="flex-1">
          <GameCanvasClient levelId={levelId} />
        </section>

        {/* Right: level info / controls */}
        <aside className="w-full max-w-md space-y-4 lg:w-80">
          {/* Level Info Card */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4">
            <h1 className="text-lg font-semibold">{level?.name ?? "Level 01"}</h1>
            {level?.description && (
              <p className="mt-2 text-sm text-slate-300">{level.description}</p>
            )}
          </div>

          {/* Controls Info */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-300">
            <p>Use on-screen controls or keyboard to move, jump, and explore.</p>
          </div>

          {/* Back Link */}
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800"
          >
            Back to ETHUB
          </Link>
        </aside>
      </div>
    </main>
  );
}
