import { Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { HeartPulse, LogOut } from "lucide-react";
import { useAppState, store } from "@/lib/store";
import type { Role } from "@/lib/types";
import { getFacility } from "@/lib/dataset";
import { Button } from "@/components/ui/button";

const PUBLIC_NAV = [
  { to: "/facilities", label: "Facilities" },
  { to: "/district", label: "District" },
] as const;

const ROLE_NAV: Record<Role, { to: string; label: string }[]> = {
  patient: [
    { to: "/chat", label: "Chat" },
    { to: "/history", label: "My cases" },
  ],
  asha: [
    { to: "/asha", label: "Health worker" },
    { to: "/followup", label: "Follow-up" },
  ],
  manager: [
    { to: "/facility-dashboard", label: "Facility" },
    { to: "/simulator", label: "Simulator" },
  ],
};

function sessionLabel(
  session: NonNullable<ReturnType<typeof useAppState>["session"]>,
): string {
  if (session.role === "patient") return "Patient";
  if (session.role === "asha") return `${session.name} · ${session.district}`;
  const facility = getFacility(session.phcId);
  return `${session.name} · ${facility?.name ?? session.phcId}`;
}

export function AppShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}) {
  const { session } = useAppState();
  const navigate = useNavigate();
  const nav = [...PUBLIC_NAV, ...(session ? ROLE_NAV[session.role] : [])];

  return (
    <div className="min-h-screen bg-soft-gradient">
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
              className="notranslate rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              value={useAppState().lang}
              onChange={(e) => {
                const newLang = e.target.value as any;
                store.setLang(newLang);
                document.cookie = `googtrans=/en/${newLang}; path=/`;
                document.cookie = `googtrans=/en/${newLang}; path=/; domain=${window.location.hostname}`;
                window.location.reload();
              }}
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="mr">मराठी</option>
              <option value="ta">தமிழ்</option>
            </select>
            {session ? (
              <>
                <span className="rounded-full bg-secondary px-3 py-1.5 font-medium text-secondary-foreground">
                  {sessionLabel(session)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    store.logout();
                    navigate({ to: "/login" });
                  }}
                >
                  <LogOut className="size-3.5" /> Switch role
                </Button>
              </>
            ) : (
              <Button asChild size="sm" variant="outline">
                <Link to="/login">Log in</Link>
              </Button>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        {title && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
