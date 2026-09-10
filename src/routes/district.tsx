import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { AppShell } from "@/components/health/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { effectiveList } from "@/lib/recommend";
import { useAppState } from "@/lib/store";
import { DISTRICT_LIST } from "@/lib/dataset";

export const Route = createFileRoute("/district")({
  head: () => ({ meta: [{ title: "District overview — Aarogya Setu Kadi" }] }),
  component: DistrictPage,
});

function DistrictPage() {
  const { overrides } = useAppState();
  const list = useMemo(() => effectiveList(overrides), [overrides]);

  const rows = DISTRICT_LIST.map((district) => {
    const facilities = list.filter((f) => f.district === district);
    const doctorPct = Math.round(
      (facilities.filter((f) => f.doctorAvailableToday).length / facilities.length) * 100,
    );
    const avgStock = Math.round(
      facilities.reduce((sum, f) => sum + f.medicineStockSufficiency, 0) / facilities.length,
    );
    const critical = facilities.filter((f) => f.criticalStockout).length;
    return { district, facilities, doctorPct, avgStock, critical };
  }).sort((a, b) => a.doctorPct - b.doctorPct);

  return (
    <AppShell title="District overview" subtitle="Aggregated doctor availability and stock health by district">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((row) => (
          <Card key={row.district} className={row.critical > 0 ? "border-destructive/30" : undefined}>
            <CardContent className="space-y-3 pt-5">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-foreground">{row.district}</p>
                <p className="text-xs text-muted-foreground">{row.facilities.length} PHCs</p>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Doctor availability</span>
                  <span>{row.doctorPct}%</span>
                </div>
                <Progress value={row.doctorPct} />
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Average stock sufficiency</span>
                  <span>{row.avgStock}%</span>
                </div>
                <Progress value={row.avgStock} />
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Critical stockouts</span>
                <span className={row.critical > 0 ? "font-semibold text-destructive" : "text-foreground"}>
                  {row.critical}
                </span>
              </div>

              <Link
                to="/facilities"
                search={{ district: row.district }}
                className="inline-block text-xs font-medium text-primary hover:underline"
              >
                View facilities in {row.district} →
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
