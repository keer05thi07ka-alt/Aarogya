import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { AppShell } from "@/components/health/AppShell";
import { TokenCard } from "@/components/health/TokenCard";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/lib/store";

const searchSchema = z.object({ case: z.string().optional() });

export const Route = createFileRoute("/token")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Your token — Aarogya Setu Kadi" }] }),
  component: TokenPage,
});

function TokenPage() {
  const { case: caseId } = Route.useSearch();
  const { cases } = useAppState();
  const record = caseId ? cases.find((c) => c.caseId === caseId) : cases[0];

  if (!record) {
    return (
      <AppShell title="No token yet">
        <p className="mb-4 text-sm text-muted-foreground">
          Start a symptom check to get matched with a facility and receive a token.
        </p>
        <Button asChild>
          <Link to="/chat">Start symptom check</Link>
        </Button>
      </AppShell>
    );
  }

  return (
    <AppShell title="Your token">
      <div className="mx-auto max-w-md">
        <TokenCard record={record} />
      </div>
    </AppShell>
  );
}
