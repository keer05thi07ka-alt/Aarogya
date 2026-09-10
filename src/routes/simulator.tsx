import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/health/AppShell";
import { RequireRole } from "@/components/health/RequireRole";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DataFreshnessBadge, DoctorStatusBadge, StockStatusBadge } from "@/components/health/badges";
import { effectiveFacility } from "@/lib/recommend";
import { getFacility } from "@/lib/dataset";
import { store, useAppState } from "@/lib/store";
import type { Session } from "@/lib/types";
import { RotateCcw } from "lucide-react";

export const Route = createFileRoute("/simulator")({
  head: () => ({ meta: [{ title: "Simulator — Aarogya Setu Kadi" }] }),
  component: SimulatorPage,
});

export function SimulatorPage() {
  return (
    <RequireRole role="manager">
      <SimulatorPageContent />
    </RequireRole>
  );
}

function SimulatorPageContent() {
  const { overrides, freshness, session } = useAppState();
  const phcId = (session as Extract<Session, { role: "manager" }>).phcId;
  const base = getFacility(phcId)!;
  const f = effectiveFacility(base, overrides[phcId]);
  const ov = overrides[phcId];
  const overrideActive = Boolean(ov?.doctorAbsent || ov?.stockout);

  return (
    <AppShell
      title="Facility operations simulator"
      subtitle={`Toggle live conditions for ${f.name} to see how recommendations respond in real time`}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          <DataFreshnessBadge label="Doctor data" timestamp={freshness.doctors} />
          <DataFreshnessBadge label="Stock data" timestamp={freshness.stock} />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => store.setOverride(phcId, { doctorAbsent: false, stockout: false })}
          disabled={!overrideActive}
        >
          <RotateCcw className="size-4" /> Reset overrides
        </Button>
      </div>

      <Card>
        <CardContent className="pt-5">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Facility</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Doctor present</TableHead>
                  <TableHead>Stock sufficiency</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">
                    {f.phcId}
                    <p className="text-xs text-muted-foreground">{f.name}</p>
                  </TableCell>
                  <TableCell>{f.district}</TableCell>
                  <TableCell>
                    <DoctorStatusBadge available={f.doctorAvailableToday} />
                  </TableCell>
                  <TableCell>
                    <StockStatusBadge sufficiency={f.medicineStockSufficiency} critical={f.criticalStockout} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => store.setOverride(phcId, { doctorAbsent: !ov?.doctorAbsent })}
                      >
                        {ov?.doctorAbsent ? "Restore doctor" : "Toggle doctor"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className={ov?.stockout ? "" : "text-destructive hover:text-destructive"}
                        onClick={() => store.setOverride(phcId, { stockout: !ov?.stockout })}
                      >
                        {ov?.stockout ? "Restore stock" : "Force stockout"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
