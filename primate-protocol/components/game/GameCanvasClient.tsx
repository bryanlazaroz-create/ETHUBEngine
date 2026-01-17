"use client";

import dynamic from "next/dynamic";

const GameCanvas = dynamic(() => import("./GameCanvas"), {
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

export default function GameCanvasClient({
  levelId,
}: GameCanvasClientProps) {
  return <GameCanvas levelId={levelId} />;
}
