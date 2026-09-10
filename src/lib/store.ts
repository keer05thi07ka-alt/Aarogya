import { useSyncExternalStore } from "react";
import type { CaseRecord, OpsOverride, Session } from "./types";
import { type Lang, loadLang, saveLang } from "./i18n";

type State = {
  cases: CaseRecord[];
  overrides: Record<string, OpsOverride>;
  patientRef: string;
  patientPhone: string;
  session: Session | null;
  freshness: { doctors: number; stock: number };
  lang: Lang;
};

const KEY = "aarogya-setu-kadi-state-v1";

const initial: State = {
  cases: [],
  overrides: {},
  patientRef: "",
  patientPhone: "",
  session: null,
  freshness: { doctors: Date.now() - 12 * 60_000, stock: Date.now() - 35 * 60_000 },
  lang: "en",
};

let state: State = initial;
let hydrated = false;
const listeners = new Set<() => void>();

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore quota errors */
  }
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = { ...initial, ...(JSON.parse(raw) as State) };
  } catch {
    /* ignore corrupt state */
  }
  if (!state.lang) {
    state.lang = loadLang(); // migrate from old local storage
  }
  if (!state.patientRef) {
    state = { ...state, patientRef: `PT-${Math.floor(100000 + Math.random() * 899999)}` };
    persist();
  }
  emit();
}

function emit() {
  listeners.forEach((l) => l());
}

function set(next: Partial<State>) {
  state = { ...state, ...next };
  persist();
  emit();
}

export const store = {
  subscribe(l: () => void) {
    hydrate();
    listeners.add(l);
    return () => listeners.delete(l);
  },
  get: () => state,
  addCase(record: CaseRecord) {
    set({ cases: [record, ...state.cases] });
  },
  updateCase(caseId: string, patch: Partial<CaseRecord>) {
    set({ cases: state.cases.map((c) => (c.caseId === caseId ? { ...c, ...patch } : c)) });
  },
  setOverride(phcId: string, patch: OpsOverride) {
    set({
      overrides: { ...state.overrides, [phcId]: { ...state.overrides[phcId], ...patch } },
      freshness: { doctors: Date.now(), stock: Date.now() },
    });
  },
  /** Facility Dashboard: toggle a single named doctor's availability. */
  setDoctorAvailability(phcId: string, role: string, available: boolean) {
    const cur = state.overrides[phcId] ?? {};
    set({
      overrides: {
        ...state.overrides,
        [phcId]: { ...cur, doctorOverrides: { ...cur.doctorOverrides, [role]: available } },
      },
      freshness: { doctors: Date.now(), stock: state.freshness.stock },
    });
  },
  /** Facility Dashboard: set a single medicine's stock percentage. */
  setMedicineStock(phcId: string, medicine: string, stockPct: number) {
    const cur = state.overrides[phcId] ?? {};
    set({
      overrides: {
        ...state.overrides,
        [phcId]: { ...cur, medicineOverrides: { ...cur.medicineOverrides, [medicine]: stockPct } },
      },
      freshness: { doctors: state.freshness.doctors, stock: Date.now() },
    });
  },
  resetOverrides() {
    set({ overrides: {} });
  },
  setPhone(phone: string) {
    set({ patientPhone: phone });
  },
  login(session: Session) {
    set({ session });
  },
  logout() {
    set({ session: null });
  },
  setLang(lang: Lang) {
    saveLang(lang);
    set({ lang });
  },
};

export function useAppState(): State {
  return useSyncExternalStore(store.subscribe, store.get, () => initial);
}
