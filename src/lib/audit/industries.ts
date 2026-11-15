export interface Industry {
  key: string;
  label: string;
  /** Singular noun for a provider, used in generated search questions. */
  noun: string;
  /** schema.org types that identify this industry outright. */
  schemaTypes: string[];
  keywords: string[];
  services: string[];
  /** Whether customers plausibly need same-day or emergency help. */
  urgent: boolean;
}

/**
 * Deterministic industry vocabulary. Adding an industry is a data change only;
 * nothing else in the engine is specific to a niche.
 */
export const INDUSTRIES: Industry[] = [
  {
    key: "roofing",
    label: "Roofing",
    noun: "roofing contractor",
    schemaTypes: ["RoofingContractor"],
    keywords: ["roofing", "roofer", "roofers", "roof repair", "roof replacement", "shingle", "shingles", "re-roof"],
    services: ["roof repair", "roof replacement", "roof inspection", "metal roofing", "shingle roofing", "tile roofing", "flat roofing", "commercial roofing", "storm damage repair", "gutter installation", "roof leak repair", "emergency roof repair"],
    urgent: true,
  },
  {
    key: "hvac",
    label: "HVAC",
    noun: "HVAC company",
    schemaTypes: ["HVACBusiness"],
    keywords: ["hvac", "air conditioning", "heating and cooling", "heating & cooling", "ac repair", "furnace", "heat pump", "air conditioner"],
    services: ["ac repair", "ac installation", "air conditioning repair", "air conditioning installation", "furnace repair", "furnace installation", "heat pump installation", "heat pump repair", "duct cleaning", "ductwork", "indoor air quality", "hvac maintenance", "thermostat installation", "emergency ac repair"],
    urgent: true,
  },
  {
    key: "plumbing",
    label: "Plumbing",
    noun: "plumber",
    schemaTypes: ["Plumber"],
    keywords: ["plumbing", "plumber", "plumbers", "drain cleaning", "water heater", "sewer", "leak detection"],
    services: ["drain cleaning", "water heater repair", "water heater installation", "tankless water heater", "leak detection", "sewer line repair", "sewer repair", "repiping", "toilet repair", "faucet repair", "garbage disposal", "sump pump", "emergency plumbing", "pipe repair"],
    urgent: true,
  },
  {
    key: "electrical",
    label: "Electrical services",
    noun: "electrician",
    schemaTypes: ["Electrician"],
    keywords: ["electrician", "electricians", "electrical contractor", "electrical services", "electrical repair", "wiring", "panel upgrade"],
    services: ["panel upgrade", "electrical panel", "wiring", "rewiring", "lighting installation", "ev charger installation", "generator installation", "outlet installation", "ceiling fan installation", "electrical inspection", "surge protection", "emergency electrician"],
    urgent: true,
  },
  {
    key: "landscaping",
    label: "Landscaping",
    noun: "landscaping company",
    schemaTypes: ["LandscapingBusiness"],
    keywords: ["landscaping", "landscape design", "landscaper", "lawn care", "lawn maintenance", "hardscape", "hardscaping", "irrigation"],
    services: ["landscape design", "lawn care", "lawn maintenance", "hardscaping", "irrigation", "sprinkler repair", "tree trimming", "tree removal", "sod installation", "mulching", "outdoor lighting", "pavers", "retaining walls"],
    urgent: false,
  },
  {
    key: "pool",
    label: "Pool services",
    noun: "pool service company",
    schemaTypes: [],
    keywords: ["pool service", "pool cleaning", "pool repair", "pool builder", "pool maintenance", "swimming pool", "pool remodeling"],
    services: ["pool cleaning", "pool repair", "pool maintenance", "pool remodeling", "pool resurfacing", "pool construction", "pool equipment repair", "pool heater", "leak detection", "green pool cleanup"],
    urgent: false,
  },
  {
    key: "flooring",
    label: "Flooring and tile",
    noun: "flooring contractor",
    schemaTypes: [],
    keywords: ["flooring", "tile installation", "hardwood", "laminate", "vinyl plank", "carpet installation", "tile and flooring"],
    services: ["tile installation", "hardwood flooring", "laminate flooring", "vinyl plank flooring", "carpet installation", "floor refinishing", "backsplash", "shower tile", "bathroom tile", "floor repair"],
    urgent: false,
  },
  {
    key: "remodeling",
    label: "Remodeling and general contracting",
    noun: "remodeling contractor",
    schemaTypes: ["GeneralContractor", "HomeAndConstructionBusiness"],
    keywords: ["remodeling", "remodel", "general contractor", "renovation", "renovations", "home improvement", "custom homes"],
    services: ["kitchen remodeling", "bathroom remodeling", "home additions", "basement finishing", "whole home remodel", "custom homes", "decks", "siding", "window replacement", "painting"],
    urgent: false,
  },
  {
    key: "pest",
    label: "Pest control",
    noun: "pest control company",
    schemaTypes: [],
    keywords: ["pest control", "exterminator", "termite", "termites", "rodent control", "mosquito control", "bed bugs"],
    services: ["termite treatment", "termite inspection", "rodent control", "mosquito control", "bed bug treatment", "ant control", "wildlife removal", "lawn pest control"],
    urgent: true,
  },
  {
    key: "cleaning",
    label: "Cleaning services",
    noun: "cleaning company",
    schemaTypes: [],
    keywords: ["house cleaning", "cleaning service", "cleaning services", "maid service", "janitorial", "pressure washing", "carpet cleaning"],
    services: ["house cleaning", "deep cleaning", "move out cleaning", "office cleaning", "janitorial services", "carpet cleaning", "pressure washing", "window cleaning"],
    urgent: false,
  },
  {
    key: "auto_repair",
    label: "Auto repair",
    noun: "auto repair shop",
    schemaTypes: ["AutoRepair", "AutoBodyShop"],
    keywords: ["auto repair", "mechanic", "car repair", "oil change", "brake repair", "auto body", "transmission repair"],
    services: ["oil change", "brake repair", "transmission repair", "engine repair", "tire service", "wheel alignment", "ac repair", "diagnostics", "collision repair", "state inspection"],
    urgent: true,
  },
  {
    key: "real_estate",
    label: "Real estate",
    noun: "real estate agent",
    schemaTypes: ["RealEstateAgent"],
    keywords: ["real estate", "realtor", "realtors", "homes for sale", "listings", "property management", "brokerage"],
    services: ["buyer representation", "home selling", "listings", "property management", "home valuation", "relocation", "investment properties", "rentals"],
    urgent: false,
  },
  {
    key: "insurance",
    label: "Insurance agency",
    noun: "insurance agent",
    schemaTypes: ["InsuranceAgency"],
    keywords: ["insurance agency", "insurance agent", "life insurance", "auto insurance", "home insurance", "insurance quote", "medicare"],
    services: ["life insurance", "term life insurance", "auto insurance", "home insurance", "health insurance", "business insurance", "medicare", "final expense", "renters insurance", "umbrella insurance"],
    urgent: false,
  },
  {
    key: "dental",
    label: "Dental practice",
    noun: "dentist",
    schemaTypes: ["Dentist"],
    keywords: ["dentist", "dental", "dentistry", "orthodontist", "orthodontics", "teeth whitening", "dental implants"],
    services: ["teeth cleaning", "dental implants", "teeth whitening", "invisalign", "braces", "crowns", "veneers", "root canal", "emergency dentist", "dentures", "cosmetic dentistry", "pediatric dentistry"],
    urgent: true,
  },
  {
    key: "medical",
    label: "Medical practice",
    noun: "medical practice",
    schemaTypes: ["Physician", "MedicalClinic", "MedicalBusiness", "Chiropractor"],
    keywords: ["medical practice", "physician", "physicians", "clinic", "primary care", "urgent care", "chiropractor", "dermatology", "patients"],
    services: ["primary care", "urgent care", "physical therapy", "chiropractic care", "dermatology", "pediatrics", "telehealth", "wellness exams", "med spa", "weight loss"],
    urgent: false,
  },
  {
    key: "legal",
    label: "Legal services",
    noun: "lawyer",
    schemaTypes: ["LegalService", "Attorney", "Notary"],
    keywords: ["attorney", "attorneys", "lawyer", "lawyers", "law firm", "law office", "legal services"],
    services: ["personal injury", "family law", "divorce", "criminal defense", "estate planning", "probate", "immigration", "bankruptcy", "business law", "real estate law", "workers compensation", "dui defense"],
    urgent: false,
  },
  {
    key: "restaurant",
    label: "Restaurant",
    noun: "restaurant",
    schemaTypes: ["Restaurant", "FoodEstablishment", "CafeOrCoffeeShop", "Bakery", "BarOrPub"],
    keywords: ["restaurant", "menu", "reservations", "catering", "dine-in", "takeout", "bakery", "cafe"],
    services: ["catering", "private events", "takeout", "delivery", "reservations", "brunch", "happy hour", "custom cakes"],
    urgent: false,
  },
  {
    key: "accounting",
    label: "Accounting and tax",
    noun: "accountant",
    schemaTypes: ["AccountingService"],
    keywords: ["accounting", "accountant", "cpa", "bookkeeping", "tax preparation", "tax services", "payroll"],
    services: ["tax preparation", "bookkeeping", "payroll", "tax planning", "business formation", "irs representation", "audit", "cfo services"],
    urgent: false,
  },
];

export function industryByKey(key: string): Industry | undefined {
  return INDUSTRIES.find((i) => i.key === key);
}
