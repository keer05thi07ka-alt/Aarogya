import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { AppShell } from "@/components/health/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppState } from "@/lib/store";
import { effectiveList } from "@/lib/recommend";
import { STRINGS, type Lang } from "@/lib/i18n";
import { HeartPulse, MapPin, MessageCircle, ShieldCheck, Stethoscope } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aarogya Setu Kadi — Connecting every rural patient to the right care" },
      {
        name: "description",
        content:
          "Describe your symptoms and instantly find the nearest rural health centre with a doctor on duty and medicine in stock.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { overrides, lang } = useAppState();
  const t = STRINGS[lang as Lang] || STRINGS.en;

  const stats = useMemo(() => {
    const list = effectiveList(overrides);
    const doctors = list.filter((f) => f.doctorAvailableToday).length;
    const critical = list.filter((f) => f.criticalStockout).length;
    return { total: list.length, doctors, critical };
  }, [overrides]);

  return (
    <AppShell>
      <section className="overflow-hidden rounded-3xl bg-hero-gradient px-6 py-14 text-center text-primary-foreground shadow-float sm:px-12">
        <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-white/15">
          <HeartPulse className="size-8" />
        </span>
        <h1 className="mx-auto mt-6 max-w-2xl text-3xl font-bold sm:text-4xl notranslate">
          {t.homeTitle}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-primary-foreground/85 sm:text-base notranslate">
          {t.homeSubtitle}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" variant="secondary" className="shadow-card notranslate">
            <Link to="/chat">
              <MessageCircle className="size-4" /> {t.homeStart}
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white/40 bg-transparent text-primary-foreground hover:bg-white/10 notranslate"
          >
            <Link to="/facilities">
              <MapPin className="size-4" /> {t.homeBrowse}
            </Link>
          </Button>
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard label={t.homeStatsTracked} value={stats.total} icon={ShieldCheck} />
        <StatCard label={t.homeStatsDoctors} value={stats.doctors} icon={Stethoscope} />
        <StatCard label={t.homeStatsCritical} value={stats.critical} icon={HeartPulse} tone="warning" />
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-3">
        <InfoCard
          step="1"
          title={t.homeStep1Title}
          body={t.homeStep1Body}
        />
        <InfoCard
          step="2"
          title={t.homeStep2Title}
          body={t.homeStep2Body}
        />
        <InfoCard
          step="3"
          title={t.homeStep3Title}
          body={t.homeStep3Body}
        />
      </section>

      <section className="mt-10 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
        <p>
          Built for health workers, patients, and district administrators alike — see{" "}
          <Link to="/asha" className="font-medium text-primary hover:underline">
            health worker tools
          </Link>
          ,{" "}
          <Link to="/facility-dashboard" className="font-medium text-primary hover:underline">
            facility dashboards
          </Link>
          , and the{" "}
          <Link to="/district" className="font-medium text-primary hover:underline">
            district overview
          </Link>
          .
        </p>
      </section>
    </AppShell>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: typeof ShieldCheck;
  tone?: "warning";
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between pt-5">
        <div>
          <p className="text-sm text-muted-foreground notranslate">{label}</p>
          <p className={`text-2xl font-bold ${tone === "warning" ? "text-destructive" : "text-foreground"}`}>
            {value}
          </p>
        </div>
        <span
          className={`flex size-10 items-center justify-center rounded-xl ${
            tone === "warning" ? "bg-destructive/10 text-destructive" : "bg-secondary text-secondary-foreground"
          }`}
        >
          <Icon className="size-5" />
        </span>
      </CardContent>
    </Card>
  );
}

function InfoCard({ step, title, body }: { step: string; title: string; body: string }) {
  return (
    <Card>
      <CardContent className="space-y-2 pt-5">
        <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
          {step}
        </span>
        <p className="font-semibold text-foreground notranslate">{title}</p>
        <p className="text-sm text-muted-foreground notranslate">{body}</p>
      </CardContent>
    </Card>
  );
}
