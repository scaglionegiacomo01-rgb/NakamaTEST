export type ChecklistItem = { key: string; label: string; hint?: string };
export type ChecklistGroup = { title: string; items: ChecklistItem[] };

export const BEGINNER_CHECKLIST: ChecklistGroup[] = [
  {
    title: "Snowboard essentials",
    items: [
      { key: "snowboard", label: "Snowboard" },
      { key: "boots", label: "Boots" },
      { key: "bindings", label: "Bindings" },
      { key: "helmet", label: "Helmet", hint: "Strongly recommended for safety." },
      { key: "goggles", label: "Goggles / mask", hint: "Protects from sun, wind and snow." },
      { key: "gloves", label: "Gloves" },
      { key: "jacket", label: "Snow jacket" },
      { key: "pants", label: "Snow pants" },
      { key: "thermals", label: "Thermal layers" },
      { key: "socks", label: "Snow socks" },
    ],
  },
  {
    title: "Trip essentials",
    items: [
      { key: "water", label: "Water" },
      { key: "lunch", label: "Packed lunch / snacks" },
      { key: "powerbank", label: "Phone charger or powerbank", hint: "Cold weather drains battery faster." },
      { key: "skipass", label: "Skipass or money" },
      { key: "id", label: "ID / document" },
      { key: "backpack", label: "Backpack" },
    ],
  },
  {
    title: "Optional reminders",
    items: [
      { key: "sunscreen", label: "Sunscreen", hint: "Sun reflects strongly on snow." },
      { key: "extra_socks", label: "Extra socks" },
      { key: "neck_warmer", label: "Neck warmer" },
      { key: "towel", label: "Small towel" },
    ],
  },
];

export const ALL_CHECKLIST_ITEMS = BEGINNER_CHECKLIST.flatMap(g => g.items);
export const TOTAL_CHECKLIST_COUNT = ALL_CHECKLIST_ITEMS.length;

export const BEGINNER_TAGS = ["Beginner Friendly", "First Time Friendly"];
