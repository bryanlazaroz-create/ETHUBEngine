import Link from "next/link";
import { GADGETS, LEVELS } from "@/lib/game/constants";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pb-6 pt-12">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
          Working title
        </p>
        <h1 className="text-4xl font-semibold text-white sm:text-5xl">
          Primate Protocol
        </h1>
        <p className="max-w-2xl text-lg text-slate-300">
          Explore towering districts, stun and capture agile creatures, and
          unlock traversal gadgets as you push deeper into the city&apos;s relay
          grid. Everything is designed to stay privacy-first with local saves.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            className="rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
            href="/play"
          >
            Start session
          </Link>
          <Link
            className="rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-emerald-400 hover:text-emerald-200"
            href="/levels/level-01"
          >
            Jump to Level 1
          </Link>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-6 pb-16 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-white">Core loop</h2>
            <p className="text-sm text-slate-300">
              Explore, use gadgets, stun/capture creatures, unlock traversal,
              beat objectives, boss.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
              Levels
            </h3>
            <ul className="space-y-3">
              {LEVELS.map((level) => (
                <li
                  key={level.id}
                  className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-semibold text-white">
                      {level.name}
                    </h4>
                    <span className="text-xs text-slate-400">{level.id}</span>
                  </div>
                  <p className="text-sm text-slate-300">{level.description}</p>
                  {level.unlocksLabel && (
                    <p className="mt-2 text-xs text-emerald-300">
                      Unlocks: {level.unlocksLabel}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-white">Gadgets</h2>
            <p className="text-sm text-slate-300">
              Each gadget is tuned for rapid traversal or capture with clean
              cooldowns and readable effects.
            </p>
          </div>
          <ul className="space-y-3">
            {GADGETS.map((gadget) => (
              <li
                key={gadget.id}
                className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-semibold text-white">
                    {gadget.name}
                  </h4>
                  <span className="text-xs text-slate-400">{gadget.input}</span>
                </div>
                <p className="text-sm text-slate-300">{gadget.description}</p>
              </li>
            ))}
          </ul>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-300">
            Saves are stored locally and encrypted on-device using WebCrypto.
          </div>
        </section>
      </main>
    </div>
  );
}
