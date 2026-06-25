import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Users,
  Handshake,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Mountain,
  Compass,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-mountain.jpg";

export const Route = createFileRoute("/values")({
  head: () => ({
    meta: [
      { title: "About Nakama — Chi siamo" },
      { name: "description", content: "Who Nakama is, why it exists, our mission, values and Cloud Nine rules." },
    ],
  }),
  component: IdentityPage,
});

type Bi = { en: string; it: string };

function L(text: Bi, lang: "it" | "en") { return text[lang]; }

const VALUES: { id: string; icon: LucideIcon; title: string; short: Bi; long: Bi }[] = [
  {
    id: "ride-together",
    icon: Users,
    title: "Ride together.",
    short: {
      en: "Nobody ends the day alone.",
      it: "Nessuno finisce la giornata da solo.",
    },
    long: {
      en: "The best mountain days are not the ones where you rode the hardest slopes. They are the ones you spent with the right people. This is not a race to the bottom: there is always someone waiting, always someone to share the ride with.\n\nBecause 'nobody gets left behind' means nobody ends the day alone.",
      it: "Le giornate migliori in montagna non sono quelle in cui hai fatto le piste più difficili. Sono quelle in cui eri con le persone giuste. Non è una gara a chi arriva prima in fondo: c'è sempre qualcuno ad aspettarti, sempre qualcuno con cui condividere la discesa.\n\nPerché 'nobody gets left behind' significa che nessuno finisce la giornata da solo.",
    },
  },
  {
    id: "no-ego",
    icon: Handshake,
    title: "No ego culture.",
    short: {
      en: "Nobody feels out of place.",
      it: "Nessuno si sente fuori posto.",
    },
    long: {
      en: "First season or tenth season, it does not matter that much: we are a mixed group, and that is the point. What matters is not what gear you use or what tricks you can do, but the will to be together and enjoy the mountain. You do not come here to prove anything.\n\nBecause 'nobody gets left behind' means nobody feels out of place.",
      it: "Prima stagione o decima, non cambia molto: siamo un gruppo misto, e va bene così. Quello che conta non è che attrezzatura usi o che trick sai fare, ma la voglia di stare insieme e godersi la montagna. Non si viene qui per dimostrare niente.\n\nPerché 'nobody gets left behind' significa che nessuno si sente fuori posto.",
    },
  },
  {
    id: "own-it",
    icon: CheckCircle2,
    title: "Own it.",
    short: {
      en: "Be honest with yourself and with the group.",
      it: "Sii onesto con te stesso e con il gruppo.",
    },
    long: {
      en: "Being honest about your level is one of the most useful things you can do for the group and for yourself. Do not overestimate yourself to look good, and do not underestimate yourself to avoid trying. It helps you live the day better and helps the group organize better. Nobody will judge you.\n\nBecause 'nobody gets left behind' works when everyone is honest with themselves and with the others.",
      it: "Essere onesti sul proprio livello è la cosa più utile che puoi fare per il gruppo e per te stesso. Non sovrastimarti per fare bella figura, non sottostimarti per evitare di provarci: ti aiuta a vivere meglio la giornata e aiuta il gruppo a organizzarsi meglio. Nessuno ti guarderà male.\n\nPerché 'nobody gets left behind' funziona se ognuno è onesto con sé stesso e con gli altri.",
    },
  },
  {
    id: "know-the-risk",
    icon: AlertTriangle,
    title: "Know the risk.",
    short: {
      en: "Come home safe, together.",
      it: "Torna a casa intero, insieme.",
    },
    long: {
      en: "The mountain is beautiful because it is real, and that is exactly why it must be respected and taken seriously. Weather changes, slopes change, conditions are not always what you expect. Taking care of yourself means taking care of the group, and we want everyone to come home with a good story to tell.\n\nBecause 'nobody gets left behind' starts with coming home safe, together.",
      it: "La montagna è bella perché è vera, e proprio per questo va rispettata e presa sul serio. Il meteo cambia, le piste variano, le condizioni non sono sempre quelle che ti aspetti. Prendersi cura di sé è prendersi cura del gruppo, e vogliamo che tutti tornino a casa con una buona storia da raccontare.\n\nPerché 'nobody gets left behind' inizia dal tornare a casa interi, insieme.",
    },
  },
];

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
    body_it: "Nel gruppo ci sono persone disposte ad aiutarti, ma non sono istruttori. Le prime volte sulla tavola richiedono una guida professionale per imparare bene, per stare al sicuro e per non scoraggiarsi. È la scelta più intelligente che puoi fare per te stesso e per il gruppo.",
    body_en: "There are people in the group willing to help, but they are not instructors. Your first times on a snowboard require professional guidance to learn properly, stay safe and avoid getting discouraged. It is the smartest choice you can make for yourself and for the group.",
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

const PERSONALITY: { it_title: string; en_title: string; it: string; en: string }[] = [
  { it_title: "Umile", en_title: "Humble", it: "Non si mette mai al centro. Sa quanto vale, ma non ha bisogno di dirlo.", en: "Never tries to be the center of attention. Knows their worth, but does not need to prove it." },
  { it_title: "Autentico", en_title: "Authentic", it: "Niente filtri, niente performance. Quello che vedi è quello che è.", en: "No filters, no performance. What you see is what you get." },
  { it_title: "Caldo", en_title: "Warm", it: "Ti fa sentire a tuo agio dal primo momento. Non ci vuole tempo per sciogliersi.", en: "Makes you feel comfortable from the first moment. No need to break the ice." },
  { it_title: "Presente", en_title: "Present", it: "Non guarda il telefono mentre parli. È lì, con te, nella giornata.", en: "Does not look at the phone while you talk. They are there, with you, in the day." },
  { it_title: "Curioso", en_title: "Curious", it: "Prova cose nuove, non ha paura di essere principiante in qualcosa.", en: "Tries new things and is not afraid to be a beginner at something." },
  { it_title: "Affidabile", en_title: "Reliable", it: "Se dice che aspetta, aspetta. Se dice che viene, viene.", en: "If they say they will wait, they wait. If they say they will come, they come." },
];

function IdentityPage() {
  const { lang } = useI18n();
  const [openValue, setOpenValue] = useState<string | null>(null);

  const T = {
    chipKicker: lang === "it" ? "Chi siamo" : "About Nakama",
    heroTitle: lang === "it"
      ? "Nessuno dovrebbe vivere la montagna da solo."
      : "No one should experience the mountain alone.",
    heroSub: lang === "it"
      ? "Nakama nasce per dare a chi ama snowboard e montagna un gruppo con cui partire, imparare, condividere e tornare a casa insieme."
      : "Nakama exists to give people who love snowboard and the mountains a group to ride with, learn with, share with and come home with.",
    meaning: lang === "it"
      ? "Nakama significa compagno, persona con cui condividi un percorso. Per noi è questo: una community dove non devi essere un pro, devi solo voler vivere la montagna con il gruppo giusto."
      : "Nakama means companion, someone you share a path with. For us, that is the point: a community where you do not need to be a pro, you just need to want to experience the mountain with the right group.",
    cta: lang === "it" ? "Scopri i prossimi viaggi" : "Explore next trips",

    basecampTitle: lang === "it" ? "Basecamp — Perché esistiamo" : "Basecamp — Why we exist",
    basecampBody: lang === "it"
      ? "C'è un sacco di gente che vorrebbe andare in montagna ma non lo fa. Non perché manchi la voglia, ma perché manca il gruppo. Magari non conosce nessuno con la stessa passione, magari si sente troppo principiante, magari ha semplicemente bisogno di qualcuno che dica: vieni, ci pensiamo noi.\n\nNakama nasce per risolvere questo problema: creare una community aperta, accessibile e inclusiva, dove puoi trovare persone con cui vivere snowboard e montagna senza sentirti fuori posto."
      : "A lot of people want to go to the mountains but don't. Not because they lack motivation, but because they lack a group. Maybe they don't know anyone with the same passion, maybe they feel too beginner, maybe they simply need someone to say: come with us, we've got you.\n\nNakama exists to solve that problem: to create an open, accessible and inclusive community where people can experience snowboard and the mountains without feeling out of place.",

    ourLineTitle: lang === "it" ? "Our Line" : "Our Line",
    missionLabel: lang === "it" ? "Mission" : "Mission",
    visionLabel: lang === "it" ? "Vision" : "Vision",
    missionHead: lang === "it" ? "Giriamo insieme, nessuno resta da solo" : "We ride together, so no one rides alone.",
    missionBody: lang === "it"
      ? "Esistiamo per dare a chiunque ami la montagna e lo snowboard un gruppo con cui viverla, aperto a tutti i livelli, dove chi sa di più aiuta chi sta imparando e nessuno viene lasciato indietro."
      : "We exist to give anyone who loves the mountains and snowboarding a group to experience it with, open to all levels, where those who know more help those who are still learning, and nobody gets left behind.",
    visionHead: lang === "it" ? "Un mondo in cui chiunque possa trovare il proprio gruppo in montagna" : "A world where nobody has to enjoy the mountain alone.",
    visionBody: lang === "it"
      ? "Vogliamo che il livello non sia mai una barriera e che chiunque, a qualsiasi livello, da qualsiasi punto di partenza, possa trovare il proprio gruppo e vivere la montagna come merita: insieme a qualcuno.\n\nVogliamo costruire qualcosa che duri: non solo una piattaforma, non solo una pagina Instagram, non solo un calendario di uscite. Una community vera, fatta di persone che si conoscono, si aspettano e si aiutano."
      : "We want skill level to never be a barrier, and for anyone, at any level, from any starting point, to find their group and experience the mountain the way it deserves to be experienced: together.\n\nWe want to build something that lasts: not just a platform, not just an Instagram page, not just a trip calendar. A real community made of people who know each other, wait for each other and help each other.",

    payoffLabel: "Payoff",
    payoffExplain: lang === "it"
      ? "È il filo rosso che collega tutto: il modo in cui ci trattiamo, ci organizziamo e viviamo ogni uscita insieme."
      : "It is the thread connecting everything: how we treat each other, how we organize, and how we experience every trip together.",

    rideCodeTitle: lang === "it" ? "Ride Code — I nostri valori" : "Ride Code — Our Values",
    cloudNineTitle: lang === "it" ? "Cloud Nine — Le 9 regole" : "Cloud Nine — The 9 Rules",
    personalityTitle: lang === "it" ? "La personalità di Nakama" : "Nakama personality",
    personalityIntro: lang === "it"
      ? "È uno snowboarder nella ventina. Non necessariamente un pro, ma sa il fatto suo. Vive il weekend in montagna e non vede l'ora che arrivi sabato. Non fa le cose per postarlo, le fa perché gli piacciono davvero. Quando incontra qualcuno che non riesce su una pista, si ferma. Non perché sia tenuto a farlo, ma perché per lui è ovvio."
      : "It is a snowboarder in their twenties. Not necessarily a pro, but someone who knows what they are doing. They live for weekends in the mountains and cannot wait for Saturday. They do not do things to post them. They do them because they actually love them. When they meet someone struggling on a slope, they stop. Not because they have to, but because to them it is obvious.",
    personalityQuote: "One day you'll leave this world behind — so live a life you will remember.",
    personalityOutro: lang === "it"
      ? "Questo è il filo che guida ogni scelta. Non spreca le giornate, non aspetta il momento perfetto. Prova, porta gli altri con sé, si mette al servizio di chi è più in difficoltà. Non perché voglia sembrare bravo, ma perché sa che le esperienze valgono il doppio quando le condividi."
      : "This is the thread guiding every choice. It does not waste days and does not wait for the perfect moment. It tries, brings others along, and helps those who are struggling. Not to look good, but because experiences are worth twice as much when they are shared.",
    readMore: lang === "it" ? "Per esteso" : "Read more",
    showLess: lang === "it" ? "Mostra meno" : "Show less",
  };

  return (
    <div className="pb-12">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={heroImg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/85 to-background" />
        </div>
        <div className="max-w-4xl mx-auto px-4 pt-10 pb-14 md:pt-20 md:pb-20">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">{T.chipKicker}</p>
          <div className="mt-4 flex items-center gap-3">
            <img
              src="/brand/nakama-logo-transparent.png"
              alt="Nakama"
              width={64}
              height={64}
              className="w-14 h-14 md:w-16 md:h-16 object-contain drop-shadow"
            />
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold uppercase tracking-wider">
              Nobody gets left behind.
            </div>
          </div>
          <h1 className="mt-5 text-3xl md:text-5xl font-display font-bold tracking-tight leading-[1.05]">
            {T.heroTitle}
          </h1>
          <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed">{T.heroSub}</p>
          <p className="mt-5 text-sm md:text-base italic text-foreground/80 max-w-2xl border-l-2 border-primary pl-4">
            {T.meaning}
          </p>
          <div className="mt-7">
            <Link to="/trips">
              <Button size="lg">{T.cta}</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* BASECAMP */}
      <Section icon={Mountain} title={T.basecampTitle}>
        <Body text={T.basecampBody} />
      </Section>

      {/* OUR LINE */}
      <Section icon={Compass} title={T.ourLineTitle} tone="muted">
        <div className="grid md:grid-cols-2 gap-4">
          <article className="rounded-2xl border border-border bg-card p-6">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{T.missionLabel}</div>
            <h3 className="mt-2 text-xl font-display font-semibold">{T.missionHead}</h3>
            <p className="mt-3 text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{T.missionBody}</p>
          </article>
          <article className="rounded-2xl border border-border bg-card p-6">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{T.visionLabel}</div>
            <h3 className="mt-2 text-xl font-display font-semibold">{T.visionHead}</h3>
            <p className="mt-3 text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{T.visionBody}</p>
          </article>
        </div>
      </Section>

      {/* PAYOFF */}
      <section className="max-w-4xl mx-auto px-4 py-10 md:py-16">
        <div className="rounded-3xl bg-primary text-primary-foreground p-8 md:p-14 text-center">
          <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight">
            Nobody gets left behind.
          </h2>
          <p className="mt-5 text-sm md:text-base opacity-90 max-w-xl mx-auto">{T.payoffExplain}</p>
        </div>
      </section>


      {/* RIDE CODE */}
      <Section icon={Sparkles} title={T.rideCodeTitle} tone="muted">
        <div className="grid md:grid-cols-2 gap-4">
          {VALUES.map((v, i) => {
            const Icon = v.icon;
            const isOpen = openValue === v.id;
            return (
              <article key={v.id} className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-secondary border border-border">
                    <Icon className="w-5 h-5" strokeWidth={1.75} />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground/60 tracking-wider">0{i + 1}</span>
                </div>
                <h3 className="mt-5 text-xl font-display font-semibold tracking-tight">{v.title}</h3>
                <p className="mt-2 text-[15px] text-foreground/80 leading-relaxed">{L(v.short, lang)}</p>
                <button
                  type="button"
                  onClick={() => setOpenValue(isOpen ? null : v.id)}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                  aria-expanded={isOpen}
                >
                  {isOpen ? T.showLess : T.readMore}
                  <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", isOpen && "rotate-180")} />
                </button>
                <div className={cn("grid transition-all duration-300", isOpen ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0")}>
                  <div className="overflow-hidden">
                    <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-border pl-4 whitespace-pre-line">{L(v.long, lang)}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </Section>
    </div>
  );
}


function Section({ icon: Icon, title, children, tone = "default" }: { icon: LucideIcon; title: string; children: React.ReactNode; tone?: "default" | "muted" }) {
  return (
    <section className={cn(tone === "muted" && "bg-secondary/40 border-y border-border")}>
      <div className="max-w-4xl mx-auto px-4 py-10 md:py-16">
        <div className="flex items-center gap-2.5 mb-5">
          <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary grid place-items-center">
            <Icon className="w-4.5 h-4.5" strokeWidth={1.75} />
          </span>
          <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight">{title}</h2>
        </div>
        {children}
      </div>
    </section>
  );
}

function Body({ text }: { text: string }) {
  return <p className="text-base text-foreground/85 leading-relaxed max-w-2xl whitespace-pre-line">{text}</p>;
}
