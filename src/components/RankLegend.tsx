import { RANKS, getRank, rangeLabel } from "@/lib/ranks";
import { cn } from "@/lib/utils";

export function RankLegend({ completed, className }: { completed?: number; className?: string }) {
  const current = typeof completed === "number" ? getRank(completed) : null;

  return (
    <div className={cn("grid sm:grid-cols-2 gap-3", className)}>
      {RANKS.map((r, i) => {
        const isCurrent = current?.title === r.title;
        const next = RANKS[i + 1];
        const reached = typeof completed === "number" && completed >= r.min;
        return (
          <div
            key={r.title}
            className={cn(
              "rounded-2xl border p-5 transition relative overflow-hidden",
              isCurrent
                ? "border-primary bg-gradient-to-br from-primary/10 via-summit/10 to-ice/30 ring-1 ring-primary shadow-sm"
                : reached
                  ? "border-border bg-card"
                  : "border-dashed border-border bg-card/60 opacity-80"
            )}
          >
            {isCurrent && (
              <span className="absolute top-3 right-3 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                You
              </span>
            )}
            <div className="flex items-center gap-3">
              <span className="text-3xl leading-none">{r.emoji}</span>
              <div className="min-w-0">
                <div className="font-display font-bold text-lg leading-tight">{r.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{rangeLabel(r, i)}</div>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-foreground/80 italic">"{r.description}"</p>
            {next && (
              <div className="mt-3 text-[11px] text-muted-foreground">
                Next: <span className="font-medium text-foreground">{next.title}</span> at {next.min} trips
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
