import dynamic from "next/dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LEVELS } from "@/lib/game/constants";

const GameCanvas = dynamic(() => import("@/components/game/GameCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[60vh] items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/70 text-sm text-slate-300">
      Loading 3D scene...
    </div>
  ),
});

type LevelPageProps = {
  params: { id: string };
};

export default function LevelPage({ params }: LevelPageProps) {
  const level = LEVELS.find((item) => item.id === params.id);

  if (!level) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Level
          </p>
          <h1 className="text-2xl font-semibold text-white">{level.name}</h1>
          <p className="text-sm text-slate-400">{level.description}</p>
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
        <GameCanvas levelId={level.id} />
      </main>
    </div>
  );
}
