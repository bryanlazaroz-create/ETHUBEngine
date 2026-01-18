import Link from "next/link";
import { LEVELS } from "@/lib/game/LEVELS.1";
import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from "react";

export default function LevelsIndexPage() {
  return (
    <main className="mx-auto max-w-3xl p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">All Levels</h1>
      <ul className="space-y-4">
        {LEVELS.map((level: { id: Key | null | undefined; name: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; description: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }) => (
          <li key={level.id}>
            <Link
              className="text-emerald-300 hover:underline"
              href={`/levels/${level.id}`}
            >
              {level.name}
            </Link>
            <p className="text-slate-400 text-sm">{level.description}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
