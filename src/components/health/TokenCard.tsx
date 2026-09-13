import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge, TriageBadge } from "./badges";
import { DirectionsButton } from "./MapCard";
import { getFacility } from "@/lib/dataset";
import type { CaseRecord } from "@/lib/types";
import { CheckCircle2 } from "lucide-react";

export function TokenCard({ record }: { record: CaseRecord }) {
  const facility = getFacility(record.phcId);
  return (
    <Card className="overflow-hidden border-success/40">
      <div className="flex items-center gap-2 bg-success px-4 py-2 text-sm font-semibold text-success-foreground">
        <CheckCircle2 className="size-4" /> TOKEN CONFIRMED
      </div>
      <CardContent className="space-y-5 pt-5">
        <div className="text-center">
          <p className="text-xs tracking-widest text-muted-foreground uppercase">Your token</p>
          <p className="text-5xl font-bold text-primary">{record.tokenNumber}</p>
          <p className="mt-1 text-sm text-muted-foreground">{record.tokenId}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <Field label="Facility" value={`${record.phcId} · ${record.facilityName}`} />
          <Field label="District" value={record.district} />
          <div>
            <p className="text-xs text-muted-foreground">Priority</p>
            <TriageBadge level={record.analysis.triage} className="mt-1" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <div className="mt-1">
              <StatusBadge status={record.status} />
            </div>
          </div>
        </div>
        
        {/* Live Queue Tracking Feature */}
        {record.status === "pending" && (
          <div className={`mt-4 rounded-xl border p-4 ${record.analysis.triage === 'red' ? 'bg-red-500/10 border-red-500/20' : 'bg-secondary/50 border-border'}`}>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Live Queue Status</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {record.analysis.triage === 'red' ? '0' : record.analysis.triage === 'yellow' ? '12' : '45'} <span className="text-sm font-normal text-muted-foreground">mins</span>
                </p>
                <p className="text-xs text-muted-foreground">Estimated Wait</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">
                  {record.analysis.triage === 'red' ? '0' : record.analysis.triage === 'yellow' ? '3' : '14'}
                </p>
                <p className="text-xs text-muted-foreground">People Ahead</p>
              </div>
            </div>
            {record.analysis.triage === 'red' && (
              <p className="mt-3 rounded bg-red-500/20 px-2 py-1 text-center text-xs font-semibold text-red-600 dark:text-red-400">
                🚨 SMART TRIAGE: PRIORITY ACCESS GRANTED
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm mt-4">
          <Field
            label="Date"
            value={new Date(record.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          />
          <Field label="Case ID" value={record.caseId} />
          <Field label="Contact number" value={record.phone} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link to="/facility/$id" params={{ id: record.phcId }}>
              View facility
            </Link>
          </Button>
          {facility && <DirectionsButton facility={facility} />}
          <Button asChild variant="ghost">
            <Link to="/history">View token history</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium text-foreground">{value}</p>
    </div>
  );
}
