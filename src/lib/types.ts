export type TriageLevel = "Emergency" | "Urgent" | "Routine";

export type Role = "patient" | "asha" | "manager";

export type Session =
  | { role: "patient" }
  | { role: "asha"; name: string; district: string }
  | { role: "manager"; name: string; phcId: string };

export type SymptomAnalysis = {
  symptoms: string[];
  duration: string;
  severity: string;
  context: string;
  careRequirement: string;
  triage: TriageLevel;
  explanation: string;
  source: "ai" | "rules";
};

export type ReferralStatus =
  | "Token Generated"
  | "Waiting"
  | "Accepted"
  | "Visited"
  | "Completed"
  | "Follow-up Required";

export type CaseRecord = {
  caseId: string;
  tokenId: string;
  tokenNumber: string;
  patientRef: string;
  phone: string;
  healthIssue: string;
  analysis: SymptomAnalysis;
  phcId: string;
  facilityName: string;
  district: string;
  suitability: number;
  status: ReferralStatus;
  reason: string;
  followUpRequired: boolean;
  followUpDate?: string;
  followUpStatus?: "Pending" | "Completed";
  createdAt: string;
};

export type OpsOverride = {
  doctorAbsent?: boolean;
  stockout?: boolean;
  /** Per-doctor-role availability set from the Facility Dashboard, e.g. { "Pediatrician": false } */
  doctorOverrides?: Record<string, boolean>;
  /** Per-medicine stock % set from the Facility Dashboard, e.g. { "Insulin": 10 } */
  medicineOverrides?: Record<string, number>;
};
