import { TAG_STYLE } from "@/lib/event-tags";
import { cn } from "@/lib/utils";

export function EventTag({ tag, className }: { tag: string; className?: string }) {
  return (
    <span className={cn("text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full", TAG_STYLE[tag] ?? "bg-secondary", className)}>
      {tag}
    </span>
  );
}
