import Link from "next/link";
import { LEVELS } from "@/lib/game/constants";
import GameCanvasClient from "@/components/game/GameCanvasClient";

export default function PlayPage() {
  const level = LEVELS.find((item) => item.id === "level-01");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Session
          </p>
          <h1 className="text-2xl font-semibold text-white">
            {level?.name ?? "Level 01"}
          </h1>
          <p className="text-sm text-slate-400">{level?.description}</p>
        </div>
        <Link
          className="rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-100 transition hover:border-emerald-400 hover:text-emerald-200"
          href="/"
        >
          Back to menu
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pb-12">
        <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4 text-xs text-slate-300">
          Move: WASD or arrows. Jump: Space. Stun: F. Capture: E. Lure: Q.
          Grapple: G. Pause: Esc.
        </div>
        <GameCanvasClient levelId="level-01" />
      </main>
    </div>
  );
}
