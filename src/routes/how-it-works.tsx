import { createFileRoute } from "@tanstack/react-router";
import { Mountain, User, Calendar, MapPin, Users, Snowflake } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How it works — Nakama" },
      { name: "description", content: "Join the crew in 6 simple steps." },
    ],
  }),
  component: HowItWorks,
});

const ICONS = [User, Snowflake, Calendar, MapPin, Users, Mountain];

function HowItWorks() {
  const { lang } = useI18n();

  const copy = lang === "it"
    ? {
        title: "Come funziona",
        subtitle: "Sei semplici passi da “voglio andare a ridare” a “ci vediamo il prossimo weekend”.",
        steps: [
          { t: "Crea il tuo profilo", d: "Iscriviti e dicci chi sei. Bastano 2 minuti." },
          { t: "Indica livello e attrezzatura", d: "Livello snowboard, esperienza in montagna, attrezzatura, trasporto." },
          { t: "Iscriviti a un viaggio", d: "Sfoglia i viaggi, scegline uno, accetta le regole." },
          { t: "Trovati al punto di ritrovo", d: "Sii puntuale. Organizziamo carpool per dividere costi e posti." },
          { t: "Passa la giornata insieme", d: "Principianti benvenuti. Il gruppo si adatta a tutti." },
          { t: "Si torna a casa insieme", d: "Stessa crew che parte, stessa crew che torna." },
        ],
      }
    : {
        title: "How it works",
        subtitle: "Six simple steps from “I want to ride” to “see you next weekend”.",
        steps: [
          { t: "Create your profile", d: "Sign up and tell us who you are. Takes 2 minutes." },
          { t: "Tell us your level & gear", d: "Snowboard level, mountain experience, equipment, transport." },
          { t: "Join an upcoming trip", d: "Browse trips, pick one, accept the rules." },
          { t: "Meet at the meeting point", d: "Be on time. We organize carpools to split costs and seats." },
          { t: "Spend the day together", d: "Beginners welcome. The group adapts to everyone." },
          { t: "Come back together", d: "Same crew that left, same crew that comes back." },
        ],
      };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 md:py-20">
      <h1 className="text-4xl md:text-5xl font-bold">{copy.title}</h1>
      <p className="mt-3 text-lg text-muted-foreground">{copy.subtitle}</p>
      <ol className="mt-12 relative border-l-2 border-border pl-8 space-y-8">
        {copy.steps.map((s, idx) => {
          const Icon = ICONS[idx];
          return (
            <li key={s.t} className="relative">
              <div className="absolute -left-[42px] w-10 h-10 rounded-full bg-primary text-primary-foreground grid place-items-center font-display font-bold">
                {idx + 1}
              </div>
              <div className="rounded-2xl bg-card border border-border p-6">
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-summit" />
                  <h2 className="font-display font-bold text-xl">{s.t}</h2>
                </div>
                <p className="mt-2 text-muted-foreground">{s.d}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
