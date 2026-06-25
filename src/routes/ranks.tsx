import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { RankLegend } from "@/components/RankLegend";
import { getRank } from "@/lib/ranks";
import { Award, Mountain, Snowflake } from "lucide-react";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/ranks")({ component: RanksPage });

function RanksPage() {
  const { user } = useAuth();
  const t = useT();

  const { data: completed } = useQuery({
    queryKey: ["completed-count", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("event_registrations")
        .select("event_id, events(status)")
        .eq("user_id", user!.id)
        .eq("status", "confirmed");
      const rows = (data ?? []) as unknown as { events: { status: string } | null }[];
      return rows.filter(r => r.events?.status === "completed").length;
    },
  });

  const r = typeof completed === "number" ? getRank(completed) : null;
  const progress = r && r.next ? Math.min(100, ((completed! - r.min) / (r.next - r.min)) * 100) : 100;
  const remaining = r && r.next ? r.next - completed! : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 md:py-14">
      <div className="rounded-3xl bg-gradient-to-br from-primary via-summit to-ice p-6 md:p-8 text-primary-foreground shadow-xl">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] opacity-80">
          <Award className="w-3.5 h-3.5" /> {t("nav.ranks")}
        </div>
        <h1 className="mt-2 text-3xl md:text-5xl font-display font-bold">{t("ranks.title")}</h1>
        <p className="mt-3 opacity-90 max-w-2xl leading-relaxed">{t("ranks.subtitle")}</p>
      </div>

      {r && (
        <section className="mt-8 rounded-2xl bg-card border border-border p-5 md:p-6">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-4xl">{r.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{t("ranks.your_rank")}</div>
              <div className="font-display font-bold text-2xl">{r.title}</div>
              <div className="text-sm text-muted-foreground">{completed} {completed === 1 ? t("ranks.trip") : t("ranks.trips")}</div>
            </div>
          </div>
          {r.next && r.nextTitle && (
            <>
              <div className="mt-4 h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-summit transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("ranks.until_next", { n: remaining, tripWord: remaining === 1 ? t("ranks.trip") : t("ranks.trips"), title: r.nextTitle })}
              </p>
            </>
          )}
        </section>
      )}

      <section className="mt-10">
        <h2 className="font-display font-bold text-2xl inline-flex items-center gap-2">
          <Snowflake className="w-5 h-5 text-primary" /> All ranks
        </h2>
        <div className="mt-4">
          <RankLegend completed={completed} />
        </div>
      </section>

      <div className="mt-10 rounded-2xl bg-ice/30 border border-ice p-5 text-center">
        <p className="font-display text-lg inline-flex items-center gap-2 justify-center">
          <Mountain className="w-5 h-5" /> Nobody gets left behind.
        </p>
        <p className="text-sm text-muted-foreground mt-1">Ride at your pace — the crew is waiting at the bottom of the lift.</p>
        <Link to="/trips" className="inline-block mt-3 text-sm text-accent hover:underline">Explore upcoming trips →</Link>
      </div>
    </div>
  );
}
