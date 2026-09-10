import * as XLSX from "xlsx";
import type { CaseRecord } from "./types";

/** Rows written to patient_tokens.xlsx — readable for the facility team. */
export function tokenRows(cases: CaseRecord[]) {
  return cases.map((c) => ({
    "Token ID": c.tokenId,
    "Token Number": c.tokenNumber,
    "Case ID": c.caseId,
    "Patient Reference": c.patientRef,
    Phone: c.phone,
    "Health Issue": c.healthIssue,
    Symptoms: c.analysis.symptoms.join(", "),
    "Triage Level": c.analysis.triage,
    "PHC ID": c.phcId,
    "Facility Name": c.facilityName,
    District: c.district,
    Date: new Date(c.createdAt).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
    Time: new Date(c.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    Status: c.status,
    "Follow-up": c.followUpRequired ? (c.followUpDate ?? "Required") : "Not required",
    "Created At": c.createdAt,
  }));
}

export function downloadTokenWorkbook(cases: CaseRecord[]) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(tokenRows(cases));
  ws["!cols"] = Object.keys(tokenRows(cases)[0] ?? { a: 1 }).map(() => ({ wch: 20 }));
  XLSX.utils.book_append_sheet(wb, ws, "Tokens");
  XLSX.writeFile(wb, "patient_tokens.xlsx");
}
