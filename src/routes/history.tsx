import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/health/AppShell";
import { RequireRole } from "@/components/health/RequireRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge, TriageBadge } from "@/components/health/badges";
import { downloadTokenWorkbook } from "@/lib/excel";
import { useAppState } from "@/lib/store";
import { Download } from "lucide-react";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "My cases — Aarogya Setu Kadi" }] }),
  component: HistoryPage,
});

export function HistoryPage() {
  return (
    <RequireRole role="patient">
      <HistoryPageContent />
    </RequireRole>
  );
}

function HistoryPageContent() {
  const { cases } = useAppState();

  return (
    <AppShell title="My cases" subtitle={`${cases.length} case${cases.length === 1 ? "" : "s"} on this device`}>
      {cases.length > 0 && (
        <div className="mb-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={() => downloadTokenWorkbook(cases)}>
            <Download className="size-4" /> Export patient_tokens.xlsx
          </Button>
        </div>
      )}

      {cases.length === 0 ? (
        <Card>
          <CardContent className="space-y-3 pt-8 pb-8 text-center">
            <p className="text-sm text-muted-foreground">You haven't started a symptom check yet.</p>
            <Button asChild>
              <Link to="/chat">Start symptom check</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {cases.map((c) => (
            <Card key={c.caseId}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-5">
                <div>
                  <p className="font-semibold text-foreground">
                    {c.tokenNumber} · {c.facilityName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {c.phcId} · {c.district} ·{" "}
                    {new Date(c.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <TriageBadge level={c.analysis.triage} />
                  <StatusBadge status={c.status} />
                  <Button asChild variant="outline" size="sm">
                    <Link to="/token" search={{ case: c.caseId }}>
                      View token
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
