import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/health/AppShell";
import { RequireRole } from "@/components/health/RequireRole";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, TriageBadge } from "@/components/health/badges";
import { store, useAppState } from "@/lib/store";
import type { Session } from "@/lib/types";
import { Phone } from "lucide-react";

export const Route = createFileRoute("/asha")({
  head: () => ({ meta: [{ title: "Health worker — Aarogya Setu Kadi" }] }),
  component: AshaPage,
});

export function AshaPage() {
  return (
    <RequireRole role="asha">
      <AshaPageContent />
    </RequireRole>
  );
}

function AshaPageContent() {
  const { cases, session } = useAppState();
  const district = (session as Extract<Session, { role: "asha" }>).district;
  const active = cases.filter((c) => c.district === district && c.status !== "Completed");

  return (
    <AppShell
      title="Health worker view"
      subtitle={`Referred patients in ${district} · status is set by the facility — call anyone stuck waiting.`}
    >
      {active.length === 0 ? (
        <Card>
          <CardContent className="pt-8 pb-8 text-center text-sm text-muted-foreground">
            No active cases in {district} right now.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {active.map((c) => (
            <Card key={c.caseId}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-5">
                <div>
                  <p className="font-semibold text-foreground">
                    {c.patientRef} · {c.tokenNumber}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {c.healthIssue} → {c.facilityName} ({c.district})
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <TriageBadge level={c.analysis.triage} />
                  <StatusBadge status={c.status} />
                  <Button asChild size="sm" variant="outline">
                    <a href={`tel:${c.phone}`}>
                      <Phone className="size-3.5" /> Call {c.phone}
                    </a>
                  </Button>
                  {!c.followUpRequired && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        store.updateCase(c.caseId, {
                          followUpRequired: true,
                          followUpStatus: "Pending",
                          followUpDate: new Date(Date.now() + 3 * 86400000).toISOString(),
                        })
                      }
                    >
                      Flag follow-up
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
