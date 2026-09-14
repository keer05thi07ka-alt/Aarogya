import { Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { HeartPulse, LogOut } from "lucide-react";
import { useAppState, store } from "@/lib/store";
import type { Role, Lang } from "@/lib/types";
import { getFacility } from "@/lib/dataset";
import { Button } from "@/components/ui/button";
import { STRINGS, LANGUAGES } from "@/lib/i18n";

function sessionLabel(
  session: NonNullable<ReturnType<typeof useAppState>["session"]>,
  strings: any
): string {
  if (session.role === "patient") return strings.navRolePatient || "Patient";
  if (session.role === "asha") return `${session.name} — ${session.district}`;
  const facility = getFacility(session.phcId);
  return `${session.name} — ${facility?.name ?? session.phcId}`;
}

export function AppShell({
  children,
  title,
  subtitle,
  actions,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  const { session, lang } = useAppState();
  const navigate = useNavigate();
  const strings = STRINGS[lang as Lang] || STRINGS.en;

  const PUBLIC_NAV = [
    { to: "/facilities", label: strings.navFacilities },
    { to: "/district", label: strings.navDistrict },
  ];

  const ROLE_NAV: Record<Role, { to: string; label: string }[]> = {
    patient: [
      { to: "/chat", label: strings.navChat },
      { to: "/history", label: strings.navMyCases },
    ],
    asha: [
      { to: "/asha", label: strings.navRoleAsha || "Health worker" },
      { to: "/followup", label: "Follow-up" },
    ],
    manager: [
      { to: "/facility-dashboard", label: strings.navRoleAdmin || "Facility" },
      { to: "/simulator", label: "Simulator" },
    ],
  };

  const nav = [...PUBLIC_NAV, ...(session ? ROLE_NAV[session.role] : [])];

  return (
    <div className="notranslate min-h-screen bg-soft-gradient">
      <header className="sticky top-0 z-30 border-b border-border bg-card/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-hero-gradient text-primary-foreground">
              <HeartPulse className="size-5" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-bold text-foreground">Aarogya Setu Kadi</span>
              <span className="block text-[11px] text-muted-foreground">
                Connecting every rural patient to the right care
              </span>
            </span>
          </Link>
          <nav className="flex flex-wrap items-center gap-1 text-sm md:ml-auto">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="rounded-lg px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
                activeProps={{ className: "bg-secondary text-secondary-foreground font-medium" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2 text-xs">
            <select
              className="rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              value={lang}
              onChange={(e) => {
                const newLang = e.target.value as any;
                store.setLang(newLang);
                // No longer reloading page, just let React re-render with new dictionary
              }}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
            {session ? (
              <div className="flex items-center gap-2 rounded-full border border-border bg-muted/50 pl-3 pr-1 py-1">
                <span className="font-medium text-muted-foreground">
                  {sessionLabel(session, strings)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => {
                    store.logout();
                    navigate({ to: "/" });
                  }}
                  title={strings.navSwitchRole}
                >
                  <LogOut className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <Button asChild size="sm" variant="outline" className="h-7 text-xs">
                <Link to="/login">Log in</Link>
              </Button>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        {title && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            {actions && <div>{actions}</div>}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
