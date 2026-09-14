import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { AppShell } from "@/components/health/AppShell";
import { FacilityCard } from "@/components/health/FacilityCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DISTRICT_LIST } from "@/lib/dataset";
import { effectiveList, scoreFacility } from "@/lib/recommend";
import { genericAnalysis } from "@/lib/tokens";
import { useAppState } from "@/lib/store";
import { Search } from "lucide-react";
import { STRINGS } from "@/lib/i18n";
import type { Lang } from "@/lib/types";

const searchSchema = z.object({ district: z.string().optional() });

export const Route = createFileRoute("/facilities")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Facilities — Aarogya Setu Kadi" }] }),
  component: FacilitiesPage,
});

type StatusFilter = "all" | "critical" | "warning" | "healthy";

function FacilitiesPage() {
  const { overrides, lang } = useAppState();
  const search = Route.useSearch();
  const [query, setQuery] = useState("");
  const [district, setDistrict] = useState<string>(search.district ?? "all");
  const [status, setStatus] = useState<StatusFilter>("all");

  const strings = STRINGS[lang as Lang] || STRINGS.en;

  const ranked = useMemo(() => {
    const analysis = genericAnalysis();
    return effectiveList(overrides)
      .map((f) => scoreFacility(f, analysis))
      .sort((a, b) => b.score - a.score);
  }, [overrides]);

  const filtered = ranked.filter((r) => {
    const f = r.facility;
    if (district !== "all" && f.district !== district) return false;
    if (status === "critical" && !(f.criticalStockout || !f.doctorAvailableToday)) return false;
    if (status === "warning" && !(f.operationalStatus === "Partially Operational" && !f.criticalStockout)) return false;
    if (status === "healthy" && !(f.doctorAvailableToday && !f.criticalStockout && f.operationalStatus === "Operational"))
      return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      if (!f.name.toLowerCase().includes(q) && !f.phcId.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <AppShell title={strings.facTitle} subtitle={`${filtered.length} of ${ranked.length} PHCs shown`}>
      <div className="notranslate mb-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={strings.facSearch}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={district} onValueChange={setDistrict}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="District" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All districts</SelectItem>
            {DISTRICT_LIST.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="healthy">Healthy</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">No facilities found.</div>
      ) : (
        <div className="notranslate grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <FacilityCard key={r.facility.phcId} ranked={r} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
