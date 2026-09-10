import {
  BASE_DOCTOR_ROLE,
  CRITICAL_DRUGS,
  FACILITIES,
  ROLE_TO_SPECIALTY,
  getDoctorsForFacility,
  getMedicinesForFacility,
  type DoctorSlot,
  type Facility,
  type MedicineStock,
} from "./dataset";
import type { OpsOverride, SymptomAnalysis } from "./types";

/** Base per-doctor list with any Facility Dashboard overrides applied — the
 * single source of truth used both for display and for scoring, so what a
 * manager sees on the dashboard always matches what patients get recommended. */
export function getEffectiveDoctors(base: Facility, override?: OpsOverride): DoctorSlot[] {
  const doctors = getDoctorsForFacility(base);
  if (!override?.doctorOverrides) return doctors;
  return doctors.map((d) => ({ ...d, available: override.doctorOverrides![d.role] ?? d.available }));
}

/** Base medicine basket with any Facility Dashboard overrides applied. */
export function getEffectiveMedicines(base: Facility, override?: OpsOverride): MedicineStock[] {
  const meds = getMedicinesForFacility(base);
  if (!override?.medicineOverrides) return meds;
  return meds.map((m) => ({ ...m, stockPct: override.medicineOverrides![m.name] ?? m.stockPct }));
}

export type Ranked = {
  facility: Facility;
  score: number;
  reasons: string[];
  warnings: string[];
  distanceKm?: number | undefined;
};

export type Coords = { lat: number; lng: number };

/** Great-circle distance between two lat/lng points, in kilometres. */
export function haversineKm(a: Coords, b: Coords): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return R * 2 * Math.asin(Math.sqrt(h));
}

/** Static dataset row + live operational overrides = what is actually available now.
 * Fine-grained per-doctor/per-medicine overrides (set from the Facility
 * Dashboard) are applied first; the blunt simulator toggles (doctorAbsent /
 * stockout) are applied last and always win, since they represent "everything
 * is down" demo scenarios. */
export function effectiveFacility(f: Facility, override?: OpsOverride): Facility {
  if (!override) return f;
  let out = f;

  if (override.doctorOverrides) {
    const doctors = getEffectiveDoctors(f, override);
    const medicalOfficer = doctors.find((d) => d.role === BASE_DOCTOR_ROLE);
    const specialistAvailability = doctors
      .filter((d) => d.role !== BASE_DOCTOR_ROLE && d.available)
      .map((d) => ROLE_TO_SPECIALTY[d.role])
      .filter((s): s is string => Boolean(s));
    out = {
      ...out,
      doctorAvailableToday: medicalOfficer ? medicalOfficer.available : out.doctorAvailableToday,
      specialistAvailability,
    };
  }

  if (override.medicineOverrides) {
    const meds = getEffectiveMedicines(f, override);
    const avgSufficiency = Math.round(meds.reduce((s, m) => s + m.stockPct, 0) / meds.length);
    const outOfStock = meds.filter((m) => m.stockPct < 15).length;
    const criticalDrugOut = meds.some((m) => CRITICAL_DRUGS.includes(m.name) && m.stockPct < 20);
    out = {
      ...out,
      medicineStockSufficiency: avgSufficiency,
      essentialDrugsOutOfStock: outOfStock,
      criticalStockout: criticalDrugOut || avgSufficiency < 30,
      daysOfStockRemaining: Math.max(0, Math.round(2 + (avgSufficiency / 100) * 40)),
    };
  }

  if (override.doctorAbsent) {
    out = { ...out, doctorAvailableToday: false, groundTruthDoctorPresence: false, specialistAvailability: [] };
  }
  if (override.stockout) {
    out = {
      ...out,
      medicineStockSufficiency: 18,
      criticalStockout: true,
      essentialDrugsOutOfStock: Math.max(out.essentialDrugsOutOfStock, 6),
      daysOfStockRemaining: 1,
    };
  }
  return out;
}

export function effectiveList(overrides: Record<string, OpsOverride>): Facility[] {
  return FACILITIES.map((f) => effectiveFacility(f, overrides[f.phcId]));
}

export function scoreFacility(
  f: Facility,
  analysis: SymptomAnalysis,
  district?: string,
  userCoords?: Coords,
): Ranked {
  const reasons: string[] = [];
  const warnings: string[] = [];
  let score = 40;
  let distanceKm: number | undefined;

  if (f.doctorAvailableToday) {
    score += 22;
    reasons.push("Doctor available today");
  } else {
    warnings.push("No doctor available today");
  }
  if (f.groundTruthDoctorPresence) {
    score += 6;
    reasons.push("Doctor presence verified on ground");
  }
  if (f.operationalStatus === "Operational") {
    score += 14;
    reasons.push("Facility operational");
  } else if (f.operationalStatus === "Partially Operational") {
    score += 5;
    warnings.push("Facility partially operational");
  } else {
    score -= 25;
    warnings.push("Facility non-operational");
  }

  const needsSpecialist = analysis.careRequirement !== "General Consultation";
  if (needsSpecialist) {
    if (f.specialistAvailability.includes(analysis.careRequirement)) {
      score += 12;
      reasons.push(`${analysis.careRequirement} available`);
    } else if (f.specialistRequirement.includes(analysis.careRequirement)) {
      score -= 6;
      warnings.push(`${analysis.careRequirement} post vacant`);
    } else {
      score -= 3;
    }
  } else {
    score += 4;
    reasons.push("Suitable for general consultation");
  }

  score += Math.round((f.medicineStockSufficiency / 100) * 14);
  if (f.medicineStockSufficiency >= 60) reasons.push("Medicine stock available");
  if (f.criticalStockout) {
    score -= 18;
    warnings.push(`Critical stockout (${f.essentialDrugsOutOfStock} essential drugs out)`);
  }
  if (f.daysOfStockRemaining < 5) warnings.push(`Only ${f.daysOfStockRemaining} days of stock left`);

  if (analysis.triage === "Emergency") {
    if (f.specialistAvailability.includes("Emergency Care")) {
      score += 8;
      reasons.push("Emergency care available");
    }
    if (!f.doctorAvailableToday) score -= 12;
  }

  if (userCoords) {
    distanceKm = haversineKm(userCoords, { lat: f.lat, lng: f.lng });
    if (distanceKm <= 10) {
      score += 16;
      reasons.push(`Only ${distanceKm.toFixed(1)} km away`);
    } else if (distanceKm <= 25) {
      score += 10;
      reasons.push(`${distanceKm.toFixed(0)} km away`);
    } else if (distanceKm <= 50) {
      score += 4;
      reasons.push(`${distanceKm.toFixed(0)} km away`);
    } else {
      score -= Math.min(20, Math.round(distanceKm / 15));
      warnings.push(`${distanceKm.toFixed(0)} km away — farther option`);
    }
  } else if (district && f.district === district) {
    score += 6;
    reasons.push(`In your district (${district})`);
  }
  if (f.tribalArea) score += 2;
  score += Math.round((f.filledDoctorPosts / Math.max(1, f.doctorPosts)) * 6);

  return {
    facility: f,
    score: Math.max(5, Math.min(99, score)),
    reasons,
    warnings,
    distanceKm,
  };
}

export function rankFacilities(
  analysis: SymptomAnalysis,
  overrides: Record<string, OpsOverride>,
  district?: string,
  limit = 4,
  userCoords?: Coords,
): Ranked[] {
  const list = effectiveList(overrides);

  let candidates = list;
  if (userCoords) {
    // Widen the search radius progressively until there's a reasonable pool to
    // choose from — this guarantees results are actually nearby instead of the
    // best-scoring facility anywhere in the state.
    const withDistance = list
      .map((f) => ({ f, d: haversineKm(userCoords, { lat: f.lat, lng: f.lng }) }))
      .sort((a, b) => a.d - b.d);
    const minPool = Math.max(limit * 3, 6);
    const radii = [25, 50, 100, 200, Infinity];
    let pool = withDistance;
    for (const r of radii) {
      const within = withDistance.filter((x) => x.d <= r);
      if (within.length >= minPool) {
        pool = within;
        break;
      }
      pool = within;
    }
    candidates = pool.map((x) => x.f);
  }

  return candidates
    .map((f) => scoreFacility(f, analysis, district, userCoords))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}