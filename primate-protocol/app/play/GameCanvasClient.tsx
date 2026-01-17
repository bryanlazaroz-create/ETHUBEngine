"use client";

import dynamic from "next/dynamic";

/**
 * Client-only wrapper for the 3D game canvas.
 * This is required because `dynamic(..., { ssr: false })` is not allowed
 * inside Server Components (App Router pages are Server Components by default).
 */
const GameCanvas = dynamic(() => import("@/components/game/GameCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[60vh] items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/70 text-sm text-slate-300">
      Loading 3D scene...
    </div>
  ),
});

type GameCanvasClientProps = {
  levelId: string;
};

export function GameCanvasClient({ levelId }: GameCanvasClientProps) {
  return <GameCanvas levelId={levelId} />;
}
