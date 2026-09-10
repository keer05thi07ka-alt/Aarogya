import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DoctorStatusBadge, SpecialistBadge, StockStatusBadge } from "./badges";
import type { Ranked } from "@/lib/recommend";
import { AlertTriangle, Check, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export function FacilityCard({
  ranked,
  recommended,
  onGetToken,
  compact,
}: {
  ranked: Ranked;
  recommended?: boolean;
  onGetToken?: (ranked: Ranked) => void;
  compact?: boolean;
}) {
  const f = ranked.facility;
  return (
    <Card className={cn("overflow-hidden", recommended && "border-primary/40 shadow-card")}>
      {recommended && (
        <div className="bg-hero-gradient px-4 py-2 text-xs font-semibold tracking-widest text-primary-foreground uppercase">
          Recommended facility
        </div>
      )}
      <CardContent className="space-y-4 pt-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-foreground">{f.phcId}</p>
            <p className="text-sm text-muted-foreground">
              {f.name} · {f.taluka}, {f.district}
              {f.tribalArea ? " · Tribal area" : ""}
              {typeof ranked.distanceKm === "number"
                ? ` · ${ranked.distanceKm.toFixed(1)} km away`
                : ""}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{ranked.score}</p>
            <p className="text-xs text-muted-foreground">Suitability / 100</p>
          </div>
        </div>

        <Progress value={ranked.score} />

        <div className="flex flex-wrap gap-2">
          <DoctorStatusBadge available={f.doctorAvailableToday} />
          <StockStatusBadge
            sufficiency={f.medicineStockSufficiency}
            critical={f.criticalStockout}
          />
          <SpecialistBadge specialties={f.specialistAvailability} />
        </div>

        {!compact && (
          <ul className="space-y-1.5 text-sm">
            {ranked.reasons.slice(0, 4).map((r) => (
              <li key={r} className="flex items-center gap-2 text-foreground">
                <Check className="size-4 text-success" /> {r}
              </li>
            ))}
            {ranked.warnings.slice(0, 2).map((w) => (
              <li key={w} className="flex items-center gap-2 text-muted-foreground">
                <AlertTriangle className="size-4 text-warning" /> {w}
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/facility/$id" params={{ id: f.phcId }}>
              View facility
            </Link>
          </Button>
          {onGetToken && (
            <Button size="sm" onClick={() => onGetToken(ranked)}>
              Get token
            </Button>
          )}
          <Button asChild variant="ghost" size="sm">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lng}&travelmode=driving`}
              target="_blank"
              rel="noreferrer"
            >
              <MapPin className="size-4" /> Directions
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
