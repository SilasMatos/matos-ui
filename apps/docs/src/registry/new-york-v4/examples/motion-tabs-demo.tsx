"use client";

import {
  BarChart3,
  CreditCard,
  LockKeyhole,
  Rocket,
  ShieldCheck,
} from "lucide-react";
import {
  type MotionTabItem,
  MotionTabs,
} from "@/registry/new-york-v4/ui/motion-tabs";

const tabs: MotionTabItem[] = [
  {
    value: "overview",
    label: "Overview",
    icon: <BarChart3 />,
    badge: "Live",
    description: "A compact summary of the current workspace signal.",
    content: (
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="MRR" value="$48.2k" delta="+12%" />
        <Metric label="Accounts" value="1,284" delta="+8%" />
        <Metric label="Health" value="96%" delta="+4%" />
      </div>
    ),
  },
  {
    value: "launch",
    label: "Launch",
    icon: <Rocket />,
    badge: "3",
    description: "Track the work that is closest to shipping.",
    content: (
      <div className="space-y-2">
        {["Pricing page QA", "Billing webhook replay", "Release notes"].map(
          (item, index) => (
            <div
              key={item}
              className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm"
            >
              <span className="font-medium">{item}</span>
              <span className="rounded-full border border-border bg-background px-2 py-0.5 text-muted-foreground text-xs">
                {index === 0 ? "Today" : "Soon"}
              </span>
            </div>
          ),
        )}
      </div>
    ),
  },
  {
    value: "billing",
    label: "Billing",
    icon: <CreditCard />,
    description: "Revenue, invoices, and collection status.",
    content: (
      <div className="rounded-lg border border-border bg-muted/20 p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-medium text-sm">Collection rate</p>
            <p className="text-muted-foreground text-xs">Last 30 days</p>
          </div>
          <span className="font-semibold text-2xl tracking-[-0.04em]">
            98.4%
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-[88%] rounded-full bg-primary" />
        </div>
      </div>
    ),
  },
  {
    value: "security",
    label: "Security",
    icon: <LockKeyhole />,
    badge: <ShieldCheck className="size-3" />,
    description: "Audit posture and identity configuration.",
    content: (
      <div className="grid gap-2">
        {["SAML enabled", "2FA enforced", "Audit export active"].map((item) => (
          <div
            key={item}
            className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-emerald-600 text-sm dark:text-emerald-400"
          >
            <ShieldCheck className="size-4" aria-hidden="true" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    ),
  },
];

function Metric({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3">
      <p className="text-muted-foreground text-xs">{label}</p>
      <div className="mt-2 flex items-end justify-between gap-2">
        <span className="font-semibold text-2xl tracking-[-0.04em]">
          {value}
        </span>
        <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-emerald-600 text-xs dark:text-emerald-400">
          {delta}
        </span>
      </div>
    </div>
  );
}

export default function MotionTabsDemo() {
  return (
    <div className="flex w-full justify-center">
      <MotionTabs items={tabs} />
    </div>
  );
}
