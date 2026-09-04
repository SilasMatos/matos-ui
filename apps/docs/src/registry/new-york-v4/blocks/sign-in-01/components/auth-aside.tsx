import { ShieldCheck, Sparkles, Zap } from "lucide-react";
import { twMerge } from "tailwind-merge";

const highlights = [
  { icon: Zap, label: "Ship faster with ready-made blocks" },
  { icon: ShieldCheck, label: "Secure by default, SSO ready" },
  { icon: Sparkles, label: "Crafted micro-interactions" },
];

export function AuthAside({ className }: { className?: string }) {
  return (
    <aside
      data-slot="auth-aside"
      className={twMerge(
        "relative hidden flex-col justify-between overflow-hidden bg-muted/40 p-8 @2xl/signin:flex",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_20%_15%,color-mix(in_oklab,var(--foreground)_8%,transparent)_0,transparent_45%)]"
      />

      <div className="relative flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-lg border border-border bg-card text-foreground shadow-xs">
          <Sparkles className="size-4" aria-hidden="true" />
        </span>
        <span className="text-sm font-semibold tracking-tight text-foreground">
          Matos UI
        </span>
      </div>

      <div className="relative space-y-5">
        <p className="text-balance text-xl font-semibold leading-snug tracking-tight text-foreground">
          Welcome back. Build premium interfaces without the busywork.
        </p>
        <ul className="space-y-3">
          {highlights.map((item) => (
            <li
              key={item.label}
              className="flex items-center gap-2.5 text-sm text-muted-foreground"
            >
              <span className="grid size-6 shrink-0 place-items-center rounded-md border border-border bg-card text-foreground">
                <item.icon className="size-3.5" aria-hidden="true" />
              </span>
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      <p className="relative text-xs text-muted-foreground">
        Trusted by product teams shipping every day.
      </p>
    </aside>
  );
}
