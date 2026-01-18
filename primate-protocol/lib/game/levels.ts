export type Level = {
  id: string;
  name: string;
  description: string;
  order: number;
};

export const LEVELS: readonly Level[] = [
  {
    id: "level-01",
    name: "Initiation",
    description: "Learn the basics of capture and traversal.",
    order: 1,
  },
  {
    id: "level-02",
    name: "Signal Noise",
    description: "Multiple targets, limited gadgets.",
    order: 2,
  },
] as const;
