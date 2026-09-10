import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/health/AppShell";
import { RequireRole } from "@/components/health/RequireRole";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { DataFreshnessBadge, StatusBadge, TriageBadge } from "@/components/health/badges";
import { effectiveFacility, getEffectiveDoctors, getEffectiveMedicines } from "@/lib/recommend";
import { getFacility, CRITICAL_DRUGS } from "@/lib/dataset";
import { store, useAppState } from "@/lib/store";
import type { ReferralStatus, Session } from "@/lib/types";
import {
  Activity,
  CircleAlert,
  Database,
  Pill,
  Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/facility-dashboard")({
  head: () => ({ meta: [{ title: "Facility dashboard — Aarogya Setu Kadi" }] }),
  component: FacilityDashboard,
});

const PIPELINE: ReferralStatus[] = [
  "Token Generated",
  "Waiting",
  "Accepted",
  "Visited",
  "Completed",
];

function nextStatus(status: ReferralStatus): ReferralStatus | null {
  const idx = PIPELINE.indexOf(status);
  if (idx === -1 || idx === PIPELINE.length - 1) return null;
  return PIPELINE[idx + 1];
}

export function FacilityDashboard() {
  return (
    <RequireRole role="manager">
      <FacilityDashboardContent />
    </RequireRole>
  );
}

function FacilityDashboardContent() {
  const { overrides, cases, freshness, session } = useAppState();
  const phcId = (session as Extract<Session, { role: "manager" }>).phcId;
  const base = getFacility(phcId)!;
  const override = overrides[phcId];
  const facility = effectiveFacility(base, override);

  const doctors = getEffectiveDoctors(base, override);
  const medicines = getEffectiveMedicines(base, override);
  const doctorsAvailableCount = doctors.filter((d) => d.available).length;

  const queue = cases
    .filter((c) => c.phcId === phcId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const activeCases = queue.filter((c) => c.status !== "Completed").length;
  const waitingCount = queue.filter((c) => c.status === "Waiting" || c.status === "Token Generated").length;

  const unavailableDoctors = doctors.filter((d) => !d.available);
  const lowStockMeds = medicines.filter((m) => m.stockPct < 60 && m.stockPct >= 25);
  const criticalMeds = medicines.filter((m) => m.stockPct < 25);

  const alerts: { level: "critical" | "warning"; text: string }[] = [
    ...unavailableDoctors.map((d) => ({ level: "critical" as const, text: `${d.role} unavailable` })),
    ...criticalMeds.map((m) => ({
      level: "critical" as const,
      text: `${m.name} stock critically low (${m.stockPct}%)`,
    })),
    ...lowStockMeds.map((m) => ({ level: "warning" as const, text: `${m.name} stock is low (${m.stockPct}%)` })),
    ...(waitingCount > 0
      ? [
          {
            level: "warning" as const,
            text: `${waitingCount} patient${waitingCount > 1 ? "s" : ""} waiting for consultation`,
          },
        ]
      : []),
  ];

  return (
    <AppShell
      title={facility.name}
      subtitle={`${facility.phcId} · ${facility.district} — your facility's live status and patient queue`}
    >
      <div className="mb-3 flex justify-end gap-2">
        <DataFreshnessBadge label="Doctor data" timestamp={freshness.doctors} />
        <DataFreshnessBadge label="Stock data" timestamp={freshness.stock} />
      </div>

      {/* 1. Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Active cases" value={String(activeCases)} icon={Activity} />
        <Stat label="Total referred" value={String(queue.length)} icon={Database} />
        <Stat
          label="Doctors available"
          value={`${doctorsAvailableCount}/${doctors.length}`}
          icon={Stethoscope}
          tone={doctorsAvailableCount === 0 ? "critical" : doctorsAvailableCount < doctors.length ? "warning" : "good"}
        />
        <Stat
          label="Overall stock"
          value={`${facility.medicineStockSufficiency}%`}
          icon={Pill}
          tone={facility.criticalStockout ? "critical" : facility.medicineStockSufficiency < 60 ? "warning" : "good"}
        />
      </div>

      {/* 4. Critical alerts */}
      {alerts.length > 0 && (
        <Card className="mt-6 border-warning/30 bg-warning/5">
          <CardContent className="pt-5">
            <p className="mb-3 flex items-center gap-2 font-semibold text-foreground">
              <CircleAlert className="size-4 text-warning" /> Facility alerts
            </p>
            <ul className="space-y-2">
              {alerts.map((a, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <span
                    className={cn(
                      "size-2 shrink-0 rounded-full",
                      a.level === "critical" ? "bg-destructive" : "bg-warning",
                    )}
                  />
                  <span className={a.level === "critical" ? "font-medium text-destructive" : "text-foreground"}>
                    {a.text}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {/* 2. Doctor availability */}
        <Card>
          <CardContent className="pt-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="flex items-center gap-2 font-semibold text-foreground">
                <Stethoscope className="size-4 text-primary" /> Doctor availability
              </p>
              <DoctorManageDialog phcId={phcId} doctors={doctors} />
            </div>
            <div className="space-y-2">
              {doctors.map((d) => (
                <div
                  key={d.role}
                  className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2.5"
                >
                  <div className="flex items-center gap-2">
                    <span className={cn("size-2 rounded-full", d.available ? "bg-success" : "bg-destructive")} />
                    <span className="text-sm font-medium text-foreground">{d.role}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={d.available ? "secondary" : "outline"} className="gap-1.5">
                      {d.available ? "Available" : "Unavailable"}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => store.setDoctorAvailability(phcId, d.role, !d.available)}
                    >
                      {d.available ? "Mark absent" : "Mark available"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 3. Medicine / stock management */}
        <Card>
          <CardContent className="pt-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="flex items-center gap-2 font-semibold text-foreground">
                <Pill className="size-4 text-primary" /> Medicine stock
              </p>
              <StockManageDialog phcId={phcId} medicines={medicines} />
            </div>
            <div className="space-y-3">
              {medicines.map((m) => {
                const status = m.stockPct < 25 ? "Critical" : m.stockPct < 60 ? "Low Stock" : "Available";
                const tone =
                  status === "Critical"
                    ? "text-destructive"
                    : status === "Low Stock"
                      ? "text-warning-foreground"
                      : "text-success";
                return (
                  <div key={m.name}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">
                        {m.name}
                        {CRITICAL_DRUGS.includes(m.name) && (
                          <span className="ml-1.5 text-[10px] font-normal tracking-wide text-muted-foreground uppercase">
                            critical drug
                          </span>
                        )}
                      </span>
                      <span className={cn("text-xs font-semibold", tone)}>
                        {m.stockPct}% · {status}
                      </span>
                    </div>
                    <Progress value={m.stockPct} className={cn(status === "Critical" && "bg-destructive/15")} />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 5. Patient queue */}
      <Card className="mt-6">
        <CardContent className="pt-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-semibold text-foreground">Patient queue</p>
            <Button asChild variant="outline" size="sm">
              <Link to="/simulator">Open simulator</Link>
            </Button>
          </div>

          {queue.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No patients referred to this facility yet.
            </p>
          ) : (
            <div className="space-y-3">
              {queue.map((c) => {
                const next = nextStatus(c.status);
                return (
                  <Card key={c.caseId} className="border-border/70">
                    <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-4 pb-4">
                      <div>
                        <p className="font-semibold text-foreground">
                          {c.tokenNumber} · {c.patientRef}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {c.healthIssue} · {c.phone}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <TriageBadge level={c.analysis.triage} />
                        <StatusBadge status={c.status} />
                        {next && (
                          <Button size="sm" onClick={() => store.updateCase(c.caseId, { status: next })}>
                            Mark {next}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}

function DoctorManageDialog({
  phcId,
  doctors,
}: {
  phcId: string;
  doctors: { role: string; available: boolean }[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        Update availability
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update doctor availability</DialogTitle>
          <DialogDescription>
            Changes apply immediately and reflect in patient facility recommendations.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {doctors.map((d) => (
            <div key={d.role} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <div className="flex items-center gap-2">
                <span className={cn("size-2 rounded-full", d.available ? "bg-success" : "bg-destructive")} />
                <span className="text-sm font-medium text-foreground">{d.role}</span>
              </div>
              <Button
                size="sm"
                variant={d.available ? "outline" : "default"}
                onClick={() => store.setDoctorAvailability(phcId, d.role, !d.available)}
              >
                {d.available ? "Mark absent" : "Mark available"}
              </Button>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StockManageDialog({
  phcId,
  medicines,
}: {
  phcId: string;
  medicines: { name: string; stockPct: number }[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        Manage stock
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage medicine stock</DialogTitle>
          <DialogDescription>
            Adjust stock levels to reflect today's inventory. Critical drugs are flagged below 20%.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {medicines.map((m) => (
            <div key={m.name}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{m.name}</span>
                <span className="text-xs text-muted-foreground">{m.stockPct}%</span>
              </div>
              <Slider
                value={[m.stockPct]}
                max={100}
                step={1}
                onValueChange={([v]) => store.setMedicineStock(phcId, m.name, v)}
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: typeof Database;
  tone?: "good" | "warning" | "critical";
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between pt-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p
            className={cn(
              "text-2xl font-bold",
              tone === "critical"
                ? "text-destructive"
                : tone === "warning"
                  ? "text-warning-foreground"
                  : "text-foreground",
            )}
          >
            {value}
          </p>
        </div>
        <span
          className={cn(
            "flex size-10 items-center justify-center rounded-xl",
            tone === "critical"
              ? "bg-destructive/10 text-destructive"
              : tone === "warning"
                ? "bg-warning/15 text-warning-foreground"
                : "bg-secondary text-secondary-foreground",
          )}
        >
          <Icon className="size-5" />
        </span>
      </CardContent>
    </Card>
  );
}
