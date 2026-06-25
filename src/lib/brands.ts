export const BRAND_GROUPS: { category: string; brands: string[] }[] = [
  {
    category: "Snowboard",
    brands: ["Burton","Salomon","Nitro","Rossignol","Capita","Lib Tech","Jones","YES.","Ride","K2","Bataleon","GNU","Arbor","Rome","DC","Union","ThirtyTwo","Vans"],
  },
  {
    category: "Surf",
    brands: ["Rip Curl","Quiksilver","Billabong","O'Neill","Roxy","Volcom"],
  },
  {
    category: "Skate",
    brands: ["Santa Cruz","Element","Zero","Girl","Plan B","Primitive","Independent","Spitfire"],
  },
  {
    category: "Mountain & Outdoor",
    brands: ["The North Face","Patagonia","Oakley","Helly Hansen","Dope Snow","Montec"],
  },
];

export const ALL_BRANDS = BRAND_GROUPS.flatMap(g => g.brands);
