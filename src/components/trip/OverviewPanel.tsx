import { AlertTriangle, ShieldCheck, Calendar, MapPin, Clock, Users, Mountain } from "lucide-react";
import { EventTag } from "@/components/EventTag";

type Event = {
  description: string | null; required_equipment: string | null; lunch_plan: string | null;
  rental_available: boolean | null; safety_notes: string | null; tags: string[] | null;
  date: string; meeting_point: string; departure_time: string | null; return_time: string | null;
  max_participants: number; price_estimate: number | null;
};

export function OverviewPanel({ event, spotsLeft }: { event: Event; spotsLeft: number }) {
  return (
    <div>
      {event.tags && event.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">{event.tags.map(t => <EventTag key={t} tag={t} />)}</div>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        <Info icon={Calendar} label="Date" value={new Date(event.date).toLocaleDateString(undefined,{weekday:"long",day:"numeric",month:"long"})} />
        <Info icon={MapPin} label="Meeting point" value={event.meeting_point} />
        <Info icon={Clock} label="Departure" value={event.departure_time ?? "TBA"} />
        <Info icon={Clock} label="Return (est.)" value={event.return_time ?? "TBA"} />
        <Info icon={Users} label="Spots" value={`${spotsLeft} / ${event.max_participants} left`} />
        <Info icon={Mountain} label="Price estimate" value={event.price_estimate ? `~${event.price_estimate}€` : "Free"} />
      </div>

      <div className="mt-6 rounded-2xl bg-summit/10 border border-summit/30 p-5">
        <div className="flex items-center gap-2 font-semibold"><ShieldCheck className="w-4 h-4" /> Nobody gets left behind</div>
        <p className="mt-2 text-sm">Stay with your assigned group, respect the meeting times, and tell the organizer if you leave or split from the group.</p>
      </div>

      {event.description && <Section title="About this trip">{event.description}</Section>}
      {event.required_equipment && <Section title="Required equipment">{event.required_equipment}</Section>}
      {event.lunch_plan && <Section title="Lunch">{event.lunch_plan}</Section>}
      {event.rental_available && <Section title="Rental">Available on site.</Section>}
      {event.safety_notes && (
        <div className="mt-6 rounded-2xl bg-destructive/10 border border-destructive/30 p-5">
          <div className="flex items-center gap-2 font-semibold"><AlertTriangle className="w-4 h-4" /> Safety notes</div>
          <p className="mt-2 text-sm whitespace-pre-line">{event.safety_notes}</p>
        </div>
      )}
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: React.ComponentType<{className?:string}>; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-card border border-border p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground"><Icon className="w-3.5 h-3.5" />{label}</div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="mt-6"><h2 className="font-display font-bold text-lg">{title}</h2><p className="mt-2 text-muted-foreground whitespace-pre-line">{children}</p></div>;
}
