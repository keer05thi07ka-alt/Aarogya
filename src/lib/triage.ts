import type { SymptomAnalysis, TriageLevel } from "./types";

const EMERGENCY = [
  "chest pain",
  "unconscious",
  "severe bleeding",
  "bleeding heavily",
  "breathless",
  "difficulty breathing",
  "shortness of breath",
  "seizure",
  "fits",
  "snake bite",
  "poison",
  "accident",
  "fracture",
  "stroke",
  "paralysis",
  "labour pain",
  "heavy bleeding",
];

const URGENT = [
  "fever",
  "high fever",
  "vomiting",
  "dehydration",
  "weakness",
  "severe pain",
  "infection",
  "diarrhoea",
  "diarrhea",
  "loose motions",
  "pregnancy",
  "child",
  "baby",
  "wound",
  "rash",
  "jaundice",
];

const SYMPTOM_MAP: Record<string, string> = {
  fever: "Fever",
  temperature: "Fever",
  weak: "Weakness",
  weakness: "Weakness",
  tired: "Fatigue",
  cough: "Cough",
  cold: "Cold",
  headache: "Headache",
  "chest pain": "Chest pain",
  vomit: "Vomiting",
  nausea: "Nausea",
  diarrhoea: "Diarrhoea",
  diarrhea: "Diarrhoea",
  "loose motions": "Diarrhoea",
  "stomach pain": "Abdominal pain",
  "body pain": "Body ache",
  breath: "Breathlessness",
  rash: "Skin rash",
  dizzy: "Dizziness",
  bleeding: "Bleeding",
  pregnan: "Pregnancy-related concern",
  injury: "Injury",
  wound: "Wound",
  swelling: "Swelling",
  "back pain": "Back pain",
  jaundice: "Jaundice",
};

const CARE_HINTS: Array<{ match: string[]; care: string }> = [
  { match: ["pregnan", "delivery", "period", "menstrual"], care: "Women's Health" },
  { match: ["child", "baby", "infant", "son", "daughter"], care: "Child Healthcare" },
  { match: ["chest pain", "accident", "unconscious", "bleeding", "fracture"], care: "Emergency Care" },
  { match: ["bone", "joint", "fracture", "back pain"], care: "Orthopaedics" },
];

const SEVERE_WORDS = ["severe", "unbearable", "worst", "intense", "extreme", "can't move", "very high fever", "high fever"];
const MODERATE_WORDS = ["moderate", "a lot of pain", "quite bad", "getting worse"];
const MILD_WORDS = ["mild", "slight", "a little", "minor", "manageable"];

function parseSeverity(text: string, isEmergency: boolean): string {
  const t = text.toLowerCase();
  if (isEmergency) return "Severe";
  if (SEVERE_WORDS.some((w) => t.includes(w))) return "Severe";
  if (MODERATE_WORDS.some((w) => t.includes(w))) return "Moderate";
  if (MILD_WORDS.some((w) => t.includes(w))) return "Mild";
  return "Not specified";
}

function parseDuration(text: string): string {
  const m = text.match(/(\d+)\s*(day|days|week|weeks|hour|hours|month|months)/i);
  if (m) return `${m[1]} ${m[2]!.toLowerCase()}`;
  if (/yesterday|since morning|1 day|last night/i.test(text)) return "1 day";
  if (/today|few hours/i.test(text)) return "Less than 1 day";
  if (/week/i.test(text)) return "About 1 week";
  return "Not specified";
}

export function analyseLocally(text: string): SymptomAnalysis {
  const t = text.toLowerCase();
  const symptoms = Array.from(
    new Set(
      Object.entries(SYMPTOM_MAP)
        .filter(([k]) => t.includes(k))
        .map(([, v]) => v),
    ),
  );
  const isEmergency = EMERGENCY.some((k) => t.includes(k));
  const isUrgent = URGENT.some((k) => t.includes(k));
  const triage: TriageLevel = isEmergency ? "Emergency" : isUrgent ? "Urgent" : "Routine";
  const care = CARE_HINTS.find((h) => h.match.some((m) => t.includes(m)))?.care ?? "General Consultation";

  return {
    symptoms: symptoms.length ? symptoms : ["General health concern"],
    duration: parseDuration(text),
    severity: parseSeverity(text, isEmergency),
    context: text.trim(),
    careRequirement: care,
    triage,
    explanation: explain(triage),
    source: "rules",
  };
}

export function explain(triage: TriageLevel): string {
  if (triage === "Emergency")
    return "Based on the symptoms you provided, immediate healthcare attention is required.";
  if (triage === "Urgent")
    return "Based on the symptoms you provided, healthcare evaluation is recommended soon.";
  return "Based on the symptoms you provided, this can be handled through normal healthcare services.";
}

export const TRIAGE_WEIGHT: Record<TriageLevel, number> = {
  Emergency: 3,
  Urgent: 2,
  Routine: 1,
};