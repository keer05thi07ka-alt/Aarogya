import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPin, Navigation } from "lucide-react";
import type { Facility } from "@/lib/dataset";
import { toast } from "sonner";

function mapsDirections(origin: string | null, f: Facility) {
  const dest = `${f.lat},${f.lng}`;
  const base = `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`;
  return origin ? `${base}&origin=${encodeURIComponent(origin)}` : base;
}

export function DirectionsButton({ facility, className }: { facility: Facility; className?: string }) {
  const [busy, setBusy] = useState(false);
  const go = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      window.open(mapsDirections(null, facility), "_blank", "noreferrer");
      return;
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setBusy(false);
        window.open(
          mapsDirections(`${pos.coords.latitude},${pos.coords.longitude}`, facility),
          "_blank",
          "noreferrer",
        );
      },
      () => {
        setBusy(false);
        toast.info("Location unavailable — enter your starting point below or continue without it.");
        window.open(mapsDirections(null, facility), "_blank", "noreferrer");
      },
      { timeout: 8000 },
    );
  };
  return (
    <Button onClick={go} disabled={busy} className={className} size="lg">
      <Navigation className="size-4" />
      {busy ? "Getting your location…" : "Get Directions →"}
    </Button>
  );
}

export function MapCard({ facility }: { facility: Facility }) {
  const [origin, setOrigin] = useState("");
  const embed = `https://www.google.com/maps?q=${facility.lat},${facility.lng}&z=12&output=embed`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MapPin className="size-4 text-primary" /> Facility location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-hidden rounded-xl border border-border">
          <iframe
            title={`Map of ${facility.phcId}`}
            src={embed}
            className="h-64 w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <div>
          <p className="font-semibold text-foreground">{facility.phcId}</p>
          <p className="text-sm text-muted-foreground">
            {facility.name}, {facility.district}
          </p>
        </div>
        <div className="space-y-2">
          <Input
            placeholder="Starting location (optional — e.g. your village)"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <DirectionsButton facility={facility} />
            {origin.trim() && (
              <Button
                variant="outline"
                size="lg"
                onClick={() =>
                  window.open(mapsDirections(origin.trim(), facility), "_blank", "noreferrer")
                }
              >
                Directions from “{origin.trim()}”
              </Button>
            )}
            <Button asChild variant="ghost" size="lg">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${facility.lat},${facility.lng}`}
                target="_blank"
                rel="noreferrer"
              >
                Open in Google Maps
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
