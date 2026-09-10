// Real Maharashtra PHC identities (district, taluka, PHC name) sourced from the
// Directorate of Health Services PHC list. Coordinates are approximate taluka
// headquarters (jittered per-PHC within the taluka), since the source list has
// no facility-level GPS. Doctor availability and medicine stock are NOT real —
// they are a deterministic, seeded simulation layer standing in for the live
// operational data (today's doctor attendance, today's stock levels) that the
// health department does not publish anywhere public. Every run of this file
// produces the same numbers, so demos are repeatable.

export type Facility = {
  phcId: string;
  name: string;
  taluka: string;
  district: string;
  region: string;
  tribalArea: boolean;
  deprivationMultiplier: number;
  doctorPosts: number;
  filledDoctorPosts: number;
  nursePosts: number;
  specialistRequirement: string[];
  specialistAvailability: string[];
  doctorAvailableToday: boolean;
  groundTruthDoctorPresence: boolean;
  operationalStatus: "Operational" | "Partially Operational" | "Non-Operational";
  medicineStockSufficiency: number; // 0-100, simulated
  essentialDrugsOutOfStock: number;
  daysOfStockRemaining: number;
  criticalStockout: boolean;
  lat: number;
  lng: number;
};

type Taluka = {
  district: string;
  taluka: string;
  region: string;
  tribal: boolean;
  lat: number;
  lng: number;
  phcNames: string[];
};

// Taluka HQ coordinates are approximate (a few km), good enough to spread PHC
// pins realistically across the real taluka. PHC names below are transcribed
// from the DHS PHC list screenshots — only rows that were actually legible are
// included, so some talukas show fewer PHCs than they have in reality.
const TALUKAS: Taluka[] = [
  // Gadchiroli — Vidarbha, tribal, Red Corridor district
  {
    district: "Gadchiroli",
    taluka: "Aheri",
    region: "Vidarbha",
    tribal: true,
    lat: 19.4667,
    lng: 80.0,
    phcNames: ["Dechalipetta", "Jimalgatta", "Kamalapur", "Mahagaon", "Permili"],
  },
  {
    district: "Gadchiroli",
    taluka: "Armori",
    region: "Vidarbha",
    tribal: true,
    lat: 20.15,
    lng: 79.9,
    phcNames: ["Bhakrondi", "Delanwadi", "Vairagad", "Waddha"],
  },
  {
    district: "Gadchiroli",
    taluka: "Bhamaragad",
    region: "Vidarbha",
    tribal: true,
    lat: 19.55,
    lng: 80.75,
    phcNames: ["Arewada", "Laheri", "Mannerajaram"],
  },
  {
    district: "Gadchiroli",
    taluka: "Chamorshi",
    region: "Vidarbha",
    tribal: true,
    lat: 19.9167,
    lng: 79.9333,
    phcNames: ["Amgaon", "Ghot", "Konasari", "Kunghada", "Markanda (K)", "Regadi"],
  },
  {
    district: "Gadchiroli",
    taluka: "Dhanora",
    region: "Vidarbha",
    tribal: true,
    lat: 20.05,
    lng: 80.35,
    phcNames: ["Godalwahi", "Karwafa", "Murumgaon", "Pendhari", "Rangi"],
  },
  {
    district: "Gadchiroli",
    taluka: "Etapalli",
    region: "Vidarbha",
    tribal: true,
    lat: 19.23,
    lng: 80.1,
    phcNames: ["Gatta", "Kasansur"],
  },

  // Nandurbar — North Maharashtra, tribal-majority
  {
    district: "Nandurbar",
    taluka: "Akkalkuwa",
    region: "North Maharashtra",
    tribal: true,
    lat: 21.55,
    lng: 74.02,
    phcNames: [
      "B R A Vihir",
      "Dab",
      "Horafali",
      "Jamana",
      "Janghati",
      "Kathi",
      "Khapar",
      "Mandava",
      "Moramba",
      "Ohawa",
      "Pimpalkhuta",
      "Urmilamal",
      "Wadfali",
    ],
  },
  {
    district: "Nandurbar",
    taluka: "Dhadgaon",
    region: "North Maharashtra",
    tribal: true,
    lat: 21.824,
    lng: 74.217,
    phcNames: [
      "Bilgaon",
      "Chulwad",
      "Dhanaje",
      "Kakarda",
      "Katri",
      "Khuntamodi",
      "Mandavi",
      "Rajbardi",
      "Roshmal",
      "Sonbudruk",
      "Talai",
    ],
  },

  // Palghar — Konkan, tribal, close to Mumbai but under-served
  {
    district: "Palghar",
    taluka: "Palghar",
    region: "Konkan",
    tribal: true,
    lat: 19.6967,
    lng: 72.7699,
    phcNames: [
      "Dandi",
      "Durves",
      "Eadvan",
      "Kelava-Mahim",
      "Maswan",
      "Murbe",
      "Safala",
      "Satpati",
      "Somta",
      "Tarapur",
    ],
  },

  // Osmanabad (Dharashiv) — Marathwada, drought-belt
  {
    district: "Osmanabad",
    taluka: "Bhoom",
    region: "Marathwada",
    tribal: false,
    lat: 18.4667,
    lng: 76.2833,
    phcNames: ["Ambhi", "Ieet", "Mankeshwer", "Pathrud", "Walwad"],
  },
  {
    district: "Osmanabad",
    taluka: "Kallamb",
    region: "Marathwada",
    tribal: false,
    lat: 18.6167,
    lng: 76.15,
    phcNames: ["Dahipal", "Itkur", "Mangarul", "Moha", "Shiradhon"],
  },

  // Nashik — mixed tribal/urban, North Maharashtra
  {
    district: "Nashik",
    taluka: "Chandwad",
    region: "North Maharashtra",
    tribal: false,
    lat: 20.3333,
    lng: 74.25,
    phcNames: ["Kazisangavi", "Talegaon Rohi", "Uswad", "Wadalibhui", "Wadner Bhairav"],
  },
  {
    district: "Nashik",
    taluka: "Deola",
    region: "North Maharashtra",
    tribal: false,
    lat: 20.4167,
    lng: 74.15,
    phcNames: ["Dahiwad", "Khamkheda", "Kharda", "Lohaner", "Meshi"],
  },
  {
    district: "Nashik",
    taluka: "Dindori",
    region: "North Maharashtra",
    tribal: true,
    lat: 20.2039,
    lng: 73.8339,
    phcNames: [
      "Khedgaon",
      "Kochargaon",
      "Mohadi",
      "Nanashi",
      "Nigdol",
      "Pandane",
      "Talegaon Dindori",
      "Umarale",
      "Ware",
      "Warkhed",
    ],
  },
  {
    district: "Nashik",
    taluka: "Igatpuri",
    region: "North Maharashtra",
    tribal: true,
    lat: 19.6967,
    lng: 73.56,
    phcNames: ["Belgaon Kurhe", "Dhamangaon", "Igatpuri", "Kaluste", "Kananwadi"],
  },

  // Pune (rural belt) — Western Maharashtra, the "better-off" comparator
  {
    district: "Pune",
    taluka: "Ambegaon",
    region: "Western Maharashtra",
    tribal: false,
    lat: 19.1167,
    lng: 73.9833,
    phcNames: [
      "Adiware",
      "Dhamani",
      "Dimbe Kh.",
      "Mahaluge Padawal",
      "Nirgudsar",
      "Peth",
      "Taleghar",
    ],
  },
  {
    district: "Pune",
    taluka: "Baramati",
    region: "Western Maharashtra",
    tribal: false,
    lat: 18.1514,
    lng: 74.5815,
    phcNames: [
      "Dorlewadi",
      "Hol",
      "Katewadi",
      "Loni Bhapakar",
      "Morgaon",
      "Murti",
      "Panadare",
      "Sangavi",
      "Shirasfal",
    ],
  },
  {
    district: "Pune",
    taluka: "Bhor",
    region: "Western Maharashtra",
    tribal: false,
    lat: 18.15,
    lng: 73.85,
    phcNames: ["Ambawade", "Bhongawali", "Bhor", "Jogwadi", "Nasarapur"],
  },
  {
    district: "Pune",
    taluka: "Daund",
    region: "Western Maharashtra",
    tribal: false,
    lat: 18.4667,
    lng: 74.5833,
    phcNames: ["Deolgaon Raje", "Kedgaon", "Kurkumbh", "Nangaon", "Rahu", "Ravangaon"],
  },
];

const SPECIALTIES = [
  "General Medicine",
  "Women's Health",
  "Child Healthcare",
  "Emergency Care",
  "Orthopaedics",
];

// Human-facing doctor titles shown on the Facility Dashboard, mapped onto the
// specialties already tracked per facility. "Medical Officer" is the base
// PHC doctor (drives the existing doctorAvailableToday flag); every other
// role maps 1:1 onto a specialty in specialistRequirement/specialistAvailability.
export const BASE_DOCTOR_ROLE = "Medical Officer";

export const SPECIALTY_TO_ROLE: Record<string, string> = {
  "General Medicine": "General Physician",
  "Women's Health": "Gynaecologist",
  "Child Healthcare": "Pediatrician",
  "Emergency Care": "Emergency Medical Officer",
  Orthopaedics: "Orthopaedic Surgeon",
};

export const ROLE_TO_SPECIALTY: Record<string, string> = Object.fromEntries(
  Object.entries(SPECIALTY_TO_ROLE).map(([specialty, role]) => [role, specialty]),
);

export type DoctorSlot = { role: string; available: boolean };

/** Per-doctor breakdown for the Facility Dashboard, derived from the facility's
 * existing base-doctor flag and specialist requirement/availability lists. */
export function getDoctorsForFacility(f: Facility): DoctorSlot[] {
  const roles: DoctorSlot[] = [{ role: BASE_DOCTOR_ROLE, available: f.doctorAvailableToday }];
  f.specialistRequirement.forEach((specialty) => {
    const role = SPECIALTY_TO_ROLE[specialty];
    if (!role) return;
    roles.push({ role, available: f.specialistAvailability.includes(specialty) });
  });
  return roles;
}

// Representative essential-medicines basket (aligned with the NLEM categories
// most commonly tracked at PHC level: analgesic, ORT, anaemia, antibiotic,
// obstetric emergency, and chronic-disease drugs).
export const ESSENTIAL_DRUGS = [
  "Paracetamol",
  "ORS",
  "Iron Folic Acid Tablets",
  "Amoxicillin",
  "Oxytocin (Injectable)",
  "Insulin",
];

// Drugs whose stockout is treated as clinically critical (obstetric
// emergency / rehydration / chronic-disease drugs a delay on which can be
// life-threatening), independent of the average stock sufficiency.
export const CRITICAL_DRUGS = ["Oxytocin (Injectable)", "Insulin", "ORS"];

export type MedicineStock = { name: string; stockPct: number };

/** Per-medicine breakdown for the Facility Dashboard, seeded off the
 * facility's overall stock sufficiency so it stays internally consistent. */
export function getMedicinesForFacility(f: Facility): MedicineStock[] {
  const r = rng(hashSeed(`${f.phcId}|medicines`));
  return ESSENTIAL_DRUGS.map((name) => {
    const jitter = Math.round((r() - 0.5) * 40);
    const stockPct = Math.max(0, Math.min(100, f.medicineStockSufficiency + jitter));
    return { name, stockPct };
  });
}

// Small deterministic PRNG (mulberry32) + a string hash so every PHC name
// seeds its own stable, repeatable set of numbers.
function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h;
}

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function build(): Facility[] {
  const out: Facility[] = [];
  let id = 101;
  TALUKAS.forEach((t) => {
    t.phcNames.forEach((phcName, i) => {
      const seed = hashSeed(`${t.district}|${t.taluka}|${phcName}|${i}`);
      const r = rng(seed);

      const doctorPosts = 1 + Math.floor(r() * 3);
      const filled = Math.max(0, doctorPosts - (r() > 0.65 ? 1 : 0));
      const requirement = SPECIALTIES.filter(() => r() > 0.55);
      const availability = requirement.filter(() => r() > 0.4);
      const doctorAvailable = filled > 0 && r() > 0.22;
      const sufficiency = Math.round(35 + r() * 65); // % of essential drugs in stock
      const outOfStock = Math.round((100 - sufficiency) / 12);
      const critical = sufficiency < 45;
      const opRoll = r();

      // Jitter within roughly a 12-14 km radius of the taluka HQ so pins land
      // inside the taluka rather than stacking on one point.
      const jitterLat = (r() - 0.5) * 0.12;
      const jitterLng = (r() - 0.5) * 0.12;

      out.push({
        phcId: `PHC-${id}`,
        name: `${phcName} PHC`,
        taluka: t.taluka,
        district: t.district,
        region: t.region,
        tribalArea: t.tribal,
        deprivationMultiplier: Number((1 + r() * 0.8).toFixed(2)),
        doctorPosts,
        filledDoctorPosts: filled,
        nursePosts: 2 + Math.floor(r() * 4),
        specialistRequirement: requirement.length ? requirement : ["General Medicine"],
        specialistAvailability: availability,
        doctorAvailableToday: doctorAvailable,
        groundTruthDoctorPresence: doctorAvailable && r() > 0.12,
        operationalStatus:
          opRoll > 0.92
            ? "Non-Operational"
            : opRoll > 0.78
              ? "Partially Operational"
              : "Operational",
        medicineStockSufficiency: sufficiency,
        essentialDrugsOutOfStock: outOfStock,
        daysOfStockRemaining: Math.round(2 + (sufficiency / 100) * 40),
        criticalStockout: critical,
        lat: Number((t.lat + jitterLat).toFixed(4)),
        lng: Number((t.lng + jitterLng).toFixed(4)),
      });
      id++;
    });
  });

  // Guarantee one strong demo facility so live demos have a reliable "good"
  // example to point to — real PHC name (Igatpuri, Nashik), best-case status.
  const hero = out.find((f) => f.taluka === "Igatpuri" && f.name === "Igatpuri PHC")!;
  hero.doctorAvailableToday = true;
  hero.groundTruthDoctorPresence = true;
  hero.operationalStatus = "Operational";
  hero.medicineStockSufficiency = 88;
  hero.criticalStockout = false;
  hero.essentialDrugsOutOfStock = 0;
  hero.daysOfStockRemaining = 34;
  hero.specialistRequirement = ["General Medicine", "Women's Health", "Child Healthcare"];
  hero.specialistAvailability = ["General Medicine", "Child Healthcare"];

  return out;
}

export const FACILITIES: Facility[] = build();

export const DISTRICT_LIST = Array.from(new Set(FACILITIES.map((f) => f.district))).sort();

export const TALUKA_LIST = Array.from(new Set(FACILITIES.map((f) => f.taluka))).sort();

export function getFacility(phcId: string): Facility | undefined {
  return FACILITIES.find((f) => f.phcId === phcId);
}
