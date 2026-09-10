import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { AppShell } from "@/components/health/AppShell";
import { MapCard } from "@/components/health/MapCard";
import {
  DoctorStatusBadge,
  SpecialistBadge,
  StockStatusBadge,
} from "@/components/health/badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getFacility } from "@/lib/dataset";
import { effectiveFacility, scoreFacility } from "@/lib/recommend";
import { genericAnalysis, createCaseRecord } from "@/lib/tokens";
import { store, useAppState } from "@/lib/store";
import { toast } from "sonner";
import { useState } from "react";
import { AlertTriangle, ArrowLeft, Check, Users } from "lucide-react";

function isValidPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone.trim());
}

export const Route = createFileRoute("/facility/$id")({
  loader: ({ params }) => {
    const facility = getFacility(params.id);
    if (!facility) throw notFound();
    return { facility };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.facility.name ?? "Facility"} — Aarogya Setu Kadi` }],
  }),
  component: FacilityDetail,
});

function FacilityDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { overrides, patientRef, patientPhone } = useAppState();
  const [phoneTouched, setPhoneTouched] = useState(false);
  const base = getFacility(id)!;
  const facility = effectiveFacility(base, overrides[id]);
  const ranked = scoreFacility(facility, genericAnalysis());

  function handleGetToken() {
    if (!isValidPhone(patientPhone)) {
      setPhoneTouched(true);
      toast.error("Enter a valid 10-digit phone number before generating a token.");
      return;
    }
    const record = createCaseRecord(ranked, genericAnalysis(), patientRef, "Walk-in visit", patientPhone);
    store.addCase(record);
    toast.success(`Token ${record.tokenNumber} generated for ${record.facilityName}`);
    navigate({ to: "/token", search: { case: record.caseId } });
  }

  return (
    <AppShell>
      <Link to="/facilities" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to facilities
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{facility.name}</h1>
          <p className="text-sm text-muted-foreground">
            {facility.phcId} · {facility.district} · {facility.region}
            {facility.tribalArea ? " · Tribal area" : ""}
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-primary">{ranked.score}</p>
          <p className="text-xs text-muted-foreground">Suitability / 100</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-4 pt-5">
              <div className="flex flex-wrap gap-2">
                <DoctorStatusBadge available={facility.doctorAvailableToday} />
                <StockStatusBadge
                  sufficiency={facility.medicineStockSufficiency}
                  critical={facility.criticalStockout}
                />
                <SpecialistBadge specialties={facility.specialistAvailability} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Operational status" value={facility.operationalStatus} />
                <Field
                  label="Doctor posts filled"
                  value={`${facility.filledDoctorPosts} / ${facility.doctorPosts}`}
                  icon={<Users className="size-3.5" />}
                />
                <Field label="Medicine stock sufficiency" value={`${facility.medicineStockSufficiency}%`} />
                <Field label="Days of stock remaining" value={String(facility.daysOfStockRemaining)} />
                <Field label="Essential drugs out of stock" value={String(facility.essentialDrugsOutOfStock)} />
                <Field label="Nurse posts" value={String(facility.nursePosts)} />
              </div>

              <div>
                <p className="mb-1 text-xs text-muted-foreground">Specialists required vs available</p>
                <ul className="space-y-1 text-sm">
                  {facility.specialistRequirement.map((s) => {
                    const has = facility.specialistAvailability.includes(s);
                    return (
                      <li key={s} className="flex items-center gap-2">
                        {has ? (
                          <Check className="size-4 text-success" />
                        ) : (
                          <AlertTriangle className="size-4 text-warning" />
                        )}
                        <span className={has ? "text-foreground" : "text-muted-foreground"}>
                          {s} {has ? "— available" : "— post vacant"}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="max-w-xs">
                <label className="mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  Phone number <span className="text-destructive">*</span>
                </label>
                <Input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  value={patientPhone}
                  onChange={(e) => store.setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  onBlur={() => setPhoneTouched(true)}
                  className={
                    phoneTouched && !isValidPhone(patientPhone)
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }
                />
                {phoneTouched && !isValidPhone(patientPhone) && (
                  <p className="mt-1 text-xs text-destructive">Enter a valid 10-digit mobile number.</p>
                )}
              </div>
              <Button onClick={handleGetToken} size="lg" className="w-full sm:w-auto">
                Get token for this facility
              </Button>
            </CardContent>
          </Card>
        </div>

        <MapCard facility={facility} />
      </div>
    </AppShell>
  );
}

function Field({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div>
      <p className="flex items-center gap-1 text-xs text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="font-medium text-foreground">{value}</p>
    </div>
  );
}
