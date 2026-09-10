import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TriageBadge } from "./badges";
import type { SymptomAnalysis } from "@/lib/types";
import { Brain } from "lucide-react";

export function SymptomCard({ analysis }: { analysis: SymptomAnalysis }) {
  return (
    <Card>
      <CardContent className="space-y-4 pt-5">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          <Brain className="size-4 text-primary" /> AI symptom understanding
          <Badge variant="outline" className="ml-auto text-[10px]">
            {analysis.source === "ai" ? "AI model" : "On-device rules"}
          </Badge>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Symptoms</p>
            <ul className="mt-1 space-y-0.5 text-sm font-medium text-foreground">
              {analysis.symptoms.map((s) => (
                <li key={s}>• {s}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-xs text-muted-foreground">Duration</span>
              <br />
              <span className="font-medium">{analysis.duration}</span>
            </p>
            <p>
              <span className="text-xs text-muted-foreground">Severity</span>
              <br />
              <span className="font-medium">{analysis.severity}</span>
            </p>
            <p>
              <span className="text-xs text-muted-foreground">Care requirement</span>
              <br />
              <span className="font-medium">{analysis.careRequirement}</span>
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-muted/40 p-4">
          <p className="text-xs tracking-widest text-muted-foreground uppercase">AI-assisted triage</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <TriageBadge level={analysis.triage} />
            <p className="text-sm text-muted-foreground">{analysis.explanation}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
