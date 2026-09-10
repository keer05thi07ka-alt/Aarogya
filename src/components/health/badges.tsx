import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ReferralStatus, TriageLevel } from "@/lib/types";
import { AlertTriangle, CheckCircle2, Clock, Package, Stethoscope, UserCheck } from "lucide-react";

export function TriageBadge({ level, className }: { level: TriageLevel; className?: string }) {
  const tone =
    level === "Emergency"
      ? "bg-destructive text-destructive-foreground"
      : level === "Urgent"
        ? "bg-warning text-warning-foreground"
        : "bg-success text-success-foreground";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase",
        tone,
        className,
      )}
    >
      {level === "Emergency" ? <AlertTriangle className="size-3.5" /> : <Clock className="size-3.5" />}
      {level}
    </span>
  );
}

export function DoctorStatusBadge({ available }: { available: boolean }) {
  return (
    <Badge variant={available ? "secondary" : "outline"} className="gap-1.5">
      <Stethoscope className="size-3.5" />
      {available ? "Doctor available today" : "Doctor unavailable"}
    </Badge>
  );
}

export function SpecialistBadge({ specialties }: { specialties: string[] }) {
  return (
    <Badge variant="outline" className="gap-1.5">
      <UserCheck className="size-3.5" />
      {specialties.length ? specialties.join(", ") : "No specialist on duty"}
    </Badge>
  );
}

export function StockStatusBadge({
  sufficiency,
  critical,
}: {
  sufficiency: number;
  critical: boolean;
}) {
  return (
    <Badge variant={critical ? "destructive" : "secondary"} className="gap-1.5">
      <Package className="size-3.5" />
      {critical ? "Critical stockout" : `Stock ${sufficiency}%`}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: ReferralStatus }) {
  const tone =
    status === "Completed" || status === "Visited"
      ? "bg-success/12 text-success"
      : status === "Follow-up Required"
        ? "bg-warning/15 text-warning-foreground"
        : "bg-primary/10 text-primary";
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", tone)}>
      <CheckCircle2 className="size-3.5" />
      {status}
    </span>
  );
}

export function DataFreshnessBadge({ label, timestamp }: { label: string; timestamp: number }) {
  const mins = Math.max(0, Math.round((Date.now() - timestamp) / 60000));
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2">
      <p className="text-xs font-medium text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground">
        Updated {mins === 0 ? "just now" : `${mins} minutes ago`}
      </p>
    </div>
  );
}
