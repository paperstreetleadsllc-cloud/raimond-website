/**
 * Plan catalogue shown on the marketing site. Prices are initial tests and
 * will move to the admin dashboard when billing is built (Phase 5).
 */
export interface Plan {
  key: string;
  name: string;
  price: string;
  cadence: string;
  summary: string;
  features: string[];
  available: boolean;
}

export const PLANS: Plan[] = [
  {
    key: "free",
    name: "AI Visibility Snapshot",
    price: "$0",
    cadence: "",
    summary: "A quick, honest look at how ready your website is.",
    features: ["Technical audit of up to 10 pages", "AI Readiness Score with evidence", "Three priority recommendations", "Customer questions worth tracking"],
    available: true,
  },
  {
    key: "audit",
    name: "Professional Audit",
    price: "$99",
    cadence: "one-time",
    summary: "The full picture and a plan you can act on.",
    features: ["Detailed website audit", "Expanded question analysis", "Competitor research", "Every recommendation, prioritized", "30/60/90-day action plan", "Downloadable report"],
    available: false,
  },
  {
    key: "monitor",
    name: "Monitor",
    price: "$199",
    cadence: "per month",
    summary: "Know when something changes.",
    features: ["Scheduled AI visibility monitoring", "Website issue monitoring", "Competitor tracking", "Monthly report", "Customer dashboard"],
    available: false,
  },
  {
    key: "growth",
    name: "Growth",
    price: "$499",
    cadence: "per month",
    summary: "We prepare the improvements for you.",
    features: ["Everything in Monitor", "Content recommendations and drafts", "Technical optimization proposals", "Local search recommendations", "Monthly implementation package"],
    available: false,
  },
  {
    key: "authority",
    name: "Authority",
    price: "$999+",
    cadence: "per month",
    summary: "For multiple services or locations.",
    features: ["Everything in Growth", "Additional locations and service lines", "Higher monitoring limits", "Enhanced lead attribution", "Advanced reporting"],
    available: false,
  },
];
