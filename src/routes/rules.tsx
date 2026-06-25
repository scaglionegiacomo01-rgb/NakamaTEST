import { createFileRoute } from "@tanstack/react-router";
import { Shield, Check } from "lucide-react";

export const Route = createFileRoute("/rules")({
  head: () => ({ meta: [{ title: "Community rules — Nakama" }] }),
  component: Rules,
});

const rules = [
  "Respect everyone",
  "No one gets left behind",
  "Be honest about your level",
  "Follow safety instructions",
  "Respect meeting times",
  "Do not pressure beginners",
  "Help when you can",
  "Mountain sports involve risk",
  "Everyone is responsible for their own behavior and safety",
];

function Rules() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 md:py-20">
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-summit" />
        <h1 className="text-3xl md:text-4xl font-bold">Community rules</h1>
      </div>
      <p className="mt-3 text-muted-foreground">These are the rules every member accepts when joining a trip.</p>
      <ul className="mt-8 space-y-3">
        {rules.map((r) => (
          <li key={r} className="flex items-start gap-3 rounded-xl bg-card border border-border p-4">
            <Check className="w-5 h-5 text-summit shrink-0 mt-0.5" />
            <span>{r}</span>
          </li>
        ))}
      </ul>
      <div className="mt-8 rounded-2xl bg-destructive/10 border border-destructive/30 p-5 text-sm">
        <strong className="block mb-1">Liability disclaimer</strong>
        Mountain sports involve real risk. By joining a trip you acknowledge that participation is under your own personal responsibility. Nakama organizes meetups; we are not a professional guiding service.
      </div>
    </div>
  );
}
