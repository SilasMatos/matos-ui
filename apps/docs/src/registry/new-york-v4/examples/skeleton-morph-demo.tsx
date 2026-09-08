"use client";

import { useState } from "react";

import { Skel, SkeletonMorph } from "@/registry/new-york-v4/ui/skeleton-morph";

const USER = {
  initials: "AR",
  name: "Alexandra Rodriguez",
  role: "Principal Engineer",
  bio: "Runs the design systems team. Previously at two payments companies. Occasional conference speaker, full-time dog owner.",
  stats: [
    ["Projects", "24"],
    ["Reviews", "310"],
    ["Followers", "1.2k"],
  ],
};

export default function SkeletonMorphDemo() {
  const [loading, setLoading] = useState(true);

  return (
    <div className="mx-auto w-full max-w-sm space-y-4 py-6">
      <button
        type="button"
        onClick={() => setLoading((v) => !v)}
        className="rounded-lg border border-border px-3 py-1 font-medium text-sm outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
      >
        {loading ? "Load" : "Reset"}
      </button>

      <div className="rounded-2xl border border-border p-5">
        <SkeletonMorph loading={loading} className="space-y-4">
          <div className="flex items-center gap-3">
            <Skel className="size-12 rounded-full">
              <div className="grid size-12 place-items-center rounded-full bg-primary/15 font-semibold text-primary text-sm">
                {USER.initials}
              </div>
            </Skel>
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skel className="h-5 w-40">
                <p className="truncate font-medium text-sm leading-5">
                  {USER.name}
                </p>
              </Skel>
              <Skel className="h-4 w-28">
                <p className="truncate text-muted-foreground text-xs leading-4">
                  {USER.role}
                </p>
              </Skel>
            </div>
          </div>

          <Skel className="h-16 w-full">
            <p className="line-clamp-3 text-muted-foreground text-sm leading-relaxed">
              {USER.bio}
            </p>
          </Skel>

          <div className="flex gap-2">
            {USER.stats.map(([label, value]) => (
              <Skel key={label} as="div" className="h-16 flex-1 rounded-lg">
                <div className="flex h-16 flex-col items-center justify-center rounded-lg bg-muted/50">
                  <span className="font-semibold text-sm">{value}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {label}
                  </span>
                </div>
              </Skel>
            ))}
          </div>
        </SkeletonMorph>
      </div>
    </div>
  );
}
