import { useEffect } from "react";
import type { ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useAppState } from "@/lib/store";
import type { Role } from "@/lib/types";
import { Loader2 } from "lucide-react";

/** Wrap a page's content in this to require a specific logged-in role.
 *  If the session doesn't match, redirects to /login with a `next` param
 *  so the person lands back where they meant to go after logging in. */
export function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { session } = useAppState();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const ok = session?.role === role;

  useEffect(() => {
    if (!ok) {
      navigate({ to: "/login", search: { next: pathname } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ok, pathname]);

  if (!ok) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Redirecting to login…
      </div>
    );
  }

  return <>{children}</>;
}
