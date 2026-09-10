import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/health/AppShell";
import { RequireRole } from "@/components/health/RequireRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TriageBadge } from "@/components/health/badges";
import { store, useAppState } from "@/lib/store";
import type { Session } from "@/lib/types";
import { CalendarClock, CheckCircle2, Phone } from "lucide-react";

export const Route = createFileRoute("/followup")({
  head: () => ({ meta: [{ title: "Follow-up — Aarogya Setu Kadi" }] }),
  component: FollowupPage,
});

export function FollowupPage() {
  return (
    <RequireRole role="asha">
      <FollowupPageContent />
    </RequireRole>
  );
}

function FollowupPageContent() {
  const { cases, session } = useAppState();
  const district = (session as Extract<Session, { role: "asha" }>).district;
  const followUps = cases.filter((c) => c.followUpRequired && c.district === district);
  const pending = followUps.filter((c) => c.followUpStatus !== "Completed");
  const done = followUps.filter((c) => c.followUpStatus === "Completed");

  return (
    <AppShell
      title="Follow-up"
      subtitle={`${district} · ${pending.length} pending, ${done.length} completed`}
    >
      {followUps.length === 0 ? (
        <Card>
          <CardContent className="pt-8 pb-8 text-center text-sm text-muted-foreground">
            No follow-ups scheduled in {district}. Emergency and urgent cases get one automatically.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {pending.map((c) => (
            <Card key={c.caseId} className="border-warning/40">
              <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-5">
                <div>
                  <p className="font-semibold text-foreground">
                    {c.tokenNumber} · {c.facilityName}
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarClock className="size-3.5" />
                    Due{" "}
                    {c.followUpDate
                      ? new Date(c.followUpDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                        })
                      : "soon"}
                    {" · currently "}
                    {c.status}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <TriageBadge level={c.analysis.triage} />
                  <Button asChild size="sm" variant="outline">
                    <a href={`tel:${c.phone}`}>
                      <Phone className="size-3.5" /> Call {c.phone}
                    </a>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => store.updateCase(c.caseId, { followUpStatus: "Completed" })}
                  >
                    <CheckCircle2 className="size-4" /> Mark completed
                  </Button>
                  <Button asChild size="sm" variant="ghost">
                    <Link to="/token" search={{ case: c.caseId }}>
                      View
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {done.length > 0 && (
            <div className="pt-2">
              <p className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Completed
              </p>
              {done.map((c) => (
                <Card key={c.caseId} className="mb-2 opacity-70">
                  <CardContent className="flex items-center justify-between gap-3 pt-4 pb-4">
                    <p className="text-sm text-foreground">
                      {c.tokenNumber} · {c.facilityName}
                    </p>
                    <TriageBadge level={c.analysis.triage} />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
