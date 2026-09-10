import type { CaseRecord, SymptomAnalysis } from "./types";
import type { Ranked } from "./recommend";

let counter = 0;

function pad(n: number, len: number) {
  return String(n).padStart(len, "0");
}

/** Builds a new CaseRecord for a chosen facility + symptom analysis, ready to push into the store. */
export function createCaseRecord(
  ranked: Ranked,
  analysis: SymptomAnalysis,
  patientRef: string,
  healthIssue: string,
  phone: string,
): CaseRecord {
  const now = new Date();
  counter += 1;
  const seq = Date.now() % 100000 + counter;
  const caseId = `CASE-${now.getFullYear()}${pad(now.getMonth() + 1, 2)}${pad(now.getDate(), 2)}-${pad(seq % 10000, 4)}`;
  const tokenId = `TKN-${pad(seq % 100000, 5)}`;
  const tokenNumber = `A-${pad((seq % 300) + 1, 3)}`;
  const f = ranked.facility;

  return {
    caseId,
    tokenId,
    tokenNumber,
    patientRef,
    phone,
    healthIssue,
    analysis,
    phcId: f.phcId,
    facilityName: f.name,
    district: f.district,
    suitability: ranked.score,
    status: "Token Generated",
    reason: ranked.reasons[0] ?? "Nearest suitable facility",
    followUpRequired: analysis.triage !== "Routine",
    followUpDate:
      analysis.triage !== "Routine"
        ? new Date(now.getTime() + 3 * 86400000).toISOString()
        : undefined,
    followUpStatus: analysis.triage !== "Routine" ? "Pending" : undefined,
    createdAt: now.toISOString(),
  };
}

/** A neutral "General Consultation / Routine" analysis, used when browsing facilities
 *  directly (no chat symptoms) so scoreFacility still returns a sensible ranking. */
export function genericAnalysis(): SymptomAnalysis {
  return {
    symptoms: ["General health concern"],
    duration: "Not specified",
    severity: "Mild",
    context: "Walk-in / directory visit",
    careRequirement: "General Consultation",
    triage: "Routine",
    explanation: "General consultation — no specific symptoms reported.",
    source: "rules",
  };
}
