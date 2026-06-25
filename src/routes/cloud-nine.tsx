import { createFileRoute } from "@tanstack/react-router";
import { Mountain } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import heroImg from "@/assets/hero-mountain.jpg";

export const Route = createFileRoute("/cloud-nine")({
  head: () => ({
    meta: [
      { title: "Cloud Nine — Nakama" },
      { name: "description", content: "The 9 rules that keep the Nakama crew safe, fair and together." },
    ],
  }),
  component: CloudNinePage,
});

const RULES: { it: string; en: string; body_it: string; body_en: string }[] = [
  {
    it: "Nobody gets left behind.",
    en: "Nobody gets left behind.",
    body_it: "Si sale insieme, si scende insieme, si torna a casa insieme. Non è un modo di dire: è come organizziamo ogni giornata. Se qualcuno è rimasto indietro, si aspetta. Se qualcuno ha bisogno, ci si ferma.",
    body_en: "We go up together, we ride down together, we come home together. This is not just a saying: it is how we organize every day. If someone falls behind, we wait. If someone needs help, we stop.",
  },
  {
    it: "Rispetta tutti.",
    en: "Respect everyone.",
    body_it: "Ogni persona nel gruppo merita rispetto, a prescindere dal livello, dall'età o da quanto conosce la montagna. Qui non esistono domande stupide e non esistono persone fuori posto.",
    body_en: "Every person in the group deserves respect, regardless of level, age or mountain experience. Here there are no stupid questions and no one is out of place.",
  },
  {
    it: "Sii onesto sul tuo livello.",
    en: "Be honest about your level.",
    body_it: "Quando ti iscrivi a un'uscita, di' come stai davvero con la tavola. Non per essere giudicato, ma perché il gruppo si organizza meglio e la giornata è più bella per tutti.",
    body_en: "When you join a trip, be honest about where you really are with your board. Not to be judged, but because the group can organize better and the day becomes better for everyone.",
  },
  {
    it: "Se sei alle prime armi, prendi un maestro.",
    en: "If you are just starting, take a lesson.",
    body_it: "Nel gruppo ci sono persone disposte ad aiutarti, ma non sono istruttori. Le prime volte sulla tavola richiedono una guida professionale per imparare bene, per stare al sicuro e per non scoraggiarsi.",
    body_en: "There are people in the group willing to help, but they are not instructors. Your first times on a snowboard require professional guidance to learn properly, stay safe and avoid getting discouraged.",
  },
  {
    it: "Non mettere pressione a chi è meno esperto.",
    en: "Do not pressure less experienced riders.",
    body_it: "Se qualcuno è più lento, si aspetta. Se qualcuno non se la sente su una pista, si trova un'alternativa. Nessuno deve sentirsi in imbarazzo per il proprio livello.",
    body_en: "If someone is slower, we wait. If someone does not feel ready for a slope, we find an alternative. Nobody should feel embarrassed about their level.",
  },
  {
    it: "Aiuta quando puoi.",
    en: "Help when you can.",
    body_it: "Se sei più esperto e qualcuno ha bisogno, offriti. Non serve fare il maestro, basta essere disponibile. Un consiglio, una mano per alzarsi, aspettare qualcuno in fondo alla pista.",
    body_en: "If you are more experienced and someone needs help, offer it. You do not need to be an instructor. A simple tip, a hand getting up, or waiting at the bottom of the slope can matter.",
  },
  {
    it: "Rispetta gli orari.",
    en: "Respect meeting times.",
    body_it: "Il punto di ritrovo, la partenza, il rientro sono condivisi. Rispettarli è rispettare il tempo di tutti gli altri.",
    body_en: "The meeting point, departure and return time are shared. Respecting them means respecting everyone else's time.",
  },
  {
    it: "Segui le indicazioni di sicurezza.",
    en: "Follow safety instructions.",
    body_it: "Le regole sulla montagna esistono per una ragione. Casco, comportamento sulle piste, segnali non si discutono.",
    body_en: "Mountain rules exist for a reason. Helmet, behavior on slopes and safety signs are not optional.",
  },
  {
    it: "Sei responsabile di te stesso.",
    en: "You are responsible for yourself.",
    body_it: "La montagna ha rischi reali. Ognuno conosce i propri limiti e ne risponde in prima persona. Se qualcosa non ti convince, dillo: nessuno ti obbliga a fare niente.",
    body_en: "The mountain has real risks. Everyone knows their own limits and is personally responsible for their decisions. If something does not feel right, say it: nobody forces you to do anything.",
  },
];

function CloudNinePage() {
  const { lang } = useI18n();
  const intro = lang === "it"
    ? "Le 9 regole che tengono la crew unita, al sicuro e in sintonia. Semplici, condivise, non negoziabili."
    : "The 9 rules that keep the crew together, safe and in sync. Simple, shared, non-negotiable.";

  return (
    <div className="pb-12">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={heroImg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/85 to-background" />
        </div>
        <div className="max-w-3xl mx-auto px-4 pt-10 pb-10 md:pt-16 md:pb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold uppercase tracking-wider">
            <Mountain className="w-3.5 h-3.5" /> Cloud Nine
          </div>
          <h1 className="mt-5 text-4xl md:text-5xl font-display font-bold tracking-tight leading-[1.05]">
            Cloud Nine
          </h1>
          <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed">{intro}</p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4">
        <ol className="grid gap-3">
          {RULES.map((r, i) => (
            <li key={i} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-display font-bold text-primary tabular-nums">{i + 1}.</span>
                <h3 className="font-display font-semibold leading-tight">{lang === "it" ? r.it : r.en}</h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{lang === "it" ? r.body_it : r.body_en}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
