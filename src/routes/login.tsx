import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { AppShell } from "@/components/health/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DISTRICT_LIST, FACILITIES } from "@/lib/dataset";
import { store } from "@/lib/store";
import { HeartHandshake, Stethoscope, User } from "lucide-react";

const searchSchema = z.object({ next: z.string().optional() });

export const Route = createFileRoute("/login")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Log in — Aarogya Setu Kadi" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { next } = Route.useSearch();
  const navigate = useNavigate();

  function goAfterLogin(fallback: string) {
    navigate({ to: next || fallback });
  }

  return (
    <AppShell
      title="Who's logging in?"
      subtitle="Pick a role to see the app the way that person would see it."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <PatientLogin onDone={() => goAfterLogin("/chat")} />
        <AshaLogin onDone={() => goAfterLogin("/asha")} />
        <ManagerLogin onDone={() => goAfterLogin("/facility-dashboard")} />
      </div>
    </AppShell>
  );
}

function RoleCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof User;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex h-full flex-col gap-4 pt-5">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
            <Icon className="size-4.5" />
          </span>
          <p className="font-semibold text-foreground">{title}</p>
        </div>
        <p className="-mt-2 text-xs text-muted-foreground">{description}</p>
        <div className="mt-auto space-y-3">{children}</div>
      </CardContent>
    </Card>
  );
}

function PatientLogin({ onDone }: { onDone: () => void }) {
  return (
    <RoleCard
      icon={User}
      title="Patient"
      description="Describe symptoms, get matched to a facility, and track your own tokens."
    >
      <Button
        className="w-full"
        onClick={() => {
          store.login({ role: "patient" });
          onDone();
        }}
      >
        Continue as patient
      </Button>
    </RoleCard>
  );
}

function AshaLogin({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState("");
  const [district, setDistrict] = useState("");

  return (
    <RoleCard
      icon={HeartHandshake}
      title="ASHA worker"
      description="See referred patients in your district and follow up on ones stuck in the pipeline."
    >
      <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
      <Select value={district} onValueChange={setDistrict}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Your district" />
        </SelectTrigger>
        <SelectContent>
          {DISTRICT_LIST.map((d) => (
            <SelectItem key={d} value={d}>
              {d}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        className="w-full"
        disabled={!district}
        onClick={() => {
          store.login({ role: "asha", name: name.trim() || "ASHA worker", district });
          onDone();
        }}
      >
        Log in as ASHA worker
      </Button>
    </RoleCard>
  );
}

function ManagerLogin({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState("");
  const [phcId, setPhcId] = useState("");
  const options = useMemo(
    () => [...FACILITIES].sort((a, b) => a.name.localeCompare(b.name)),
    [],
  );

  return (
    <RoleCard
      icon={Stethoscope}
      title="Facility manager"
      description="See your PHC's live status, patient queue, and check patients in as they arrive."
    >
      <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
      <Select value={phcId} onValueChange={setPhcId}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Your facility" />
        </SelectTrigger>
        <SelectContent>
          {options.map((f) => (
            <SelectItem key={f.phcId} value={f.phcId}>
              {f.name} · {f.district}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        className="w-full"
        disabled={!phcId}
        onClick={() => {
          store.login({ role: "manager", name: name.trim() || "Facility manager", phcId });
          onDone();
        }}
      >
        Log in as facility manager
      </Button>
    </RoleCard>
  );
}
