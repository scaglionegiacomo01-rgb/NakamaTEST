export type Rank = {
  title: string;
  emoji: string;
  min: number;
  max: number | null;
  next: number | null;
  nextTitle: string | null;
  description: string;
};

export type RankDef = { title: string; emoji: string; min: number; description: string };

export const RANKS: RankDef[] = [
  { title: "Fresh Snow", emoji: "❄️", min: 0, description: "Everyone starts somewhere." },
  { title: "Snow Rookie", emoji: "🌱", min: 1, description: "You started riding with the crew." },
  { title: "Lift Survivor", emoji: "🎟️", min: 4, description: "You survived early mornings, parking lots and lift lines." },
  { title: "Powder Hunter", emoji: "🏂", min: 10, description: "You're becoming part of the mountain." },
  { title: "Mountain Yeti", emoji: "🦄", min: 20, description: "You practically live in the snow." },
  { title: "Legend of the Peaks", emoji: "🏔️", min: 40, description: "You are part of the soul of the crew." },
];

export function getRank(completed: number): Rank {
  let idx = 0;
  for (let i = 0; i < RANKS.length; i++) if (completed >= RANKS[i].min) idx = i;
  const cur = RANKS[idx];
  const nxt = RANKS[idx + 1];
  return {
    title: cur.title,
    emoji: cur.emoji,
    min: cur.min,
    max: nxt ? nxt.min - 1 : null,
    next: nxt ? nxt.min : null,
    nextTitle: nxt ? nxt.title : null,
    description: cur.description,
  };
}

export function rangeLabel(r: RankDef, i: number): string {
  const next = RANKS[i + 1];
  if (!next) return `${r.min}+ completed trips`;
  if (next.min - 1 === r.min) return `${r.min} completed ${r.min === 1 ? "trip" : "trips"}`;
  return `${r.min}–${next.min - 1} completed trips`;
}
