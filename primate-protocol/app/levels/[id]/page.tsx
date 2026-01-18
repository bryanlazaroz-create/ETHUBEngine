import { notFound } from "next/navigation";
import { LEVELS } from "@/lib/game/LEVELS.1";
import { type LevelDefinition } from "@/lib/game/LevelDefinition";

type PageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return LEVELS.map((level: { id: any; }) => ({ id: level.id }));
}

export default async function LevelPage({ params }: PageProps) {
  const { id } = await params;

  const level: LevelDefinition | undefined = LEVELS.find(
    (lvl: { id: string; }) => lvl.id === id
  );

  if (!level) notFound();

  return (
    <main className="mx-auto max-w-3xl p-6 text-white">
      <h1 className="text-3xl font-bold">{level.name}</h1>
      <p className="mt-4 text-slate-400">{level.description}</p>

      <ul className="mt-6 list-disc pl-5 space-y-1 text-slate-300">
        {level.objectives.map((obj, idx) => (
          <li key={idx}>{obj}</li>
        ))}
      </ul>

      {level.unlocksLabel && (
        <p className="mt-4 text-slate-200">
          Unlocks: {level.unlocksLabel}
        </p>
      )}
    </main>
  );
}
