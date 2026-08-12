import type { MemoryRecord } from "./types";

function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

export function scoreMemory(query: string, mem: MemoryRecord): number {
  const q = new Set(tokens(query));
  if (q.size === 0) return mem.strength * 0.2;
  const hay = tokens(`${mem.title} ${mem.body} ${mem.tags.join(" ")}`);
  let hit = 0;
  for (const t of hay) if (q.has(t)) hit += 1;
  return hit / q.size + mem.strength * 0.15;
}

export function recall(query: string, memories: MemoryRecord[], limit = 3): MemoryRecord[] {
  return [...memories]
    .map((m) => ({ m, s: scoreMemory(query, m) }))
    .sort((a, b) => b.s - a.s)
    .filter((x) => x.s > 0.12)
    .slice(0, limit)
    .map((x) => x.m);
}
