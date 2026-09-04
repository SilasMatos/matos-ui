"use client";

import { CheckCircle2, Rocket, ShieldCheck, Trophy } from "lucide-react";
import { useCallback, useState } from "react";
import {
  type AchievementData,
  AchievementToast,
  AchievementToastGroup,
} from "@/registry/new-york-v4/ui/achievement-toast";

const buttonClassName =
  "inline-flex h-9 w-fit items-center justify-center rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground shadow-xs outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring";

const milestone: AchievementData[] = [
  {
    id: "build",
    title: "Build passed",
    description: "124 components compiled with no type errors.",
    icon: <CheckCircle2 />,
  },
  {
    id: "audit",
    title: "Audit clean",
    description: "No high-severity advisories in the dependency tree.",
    icon: <ShieldCheck />,
  },
  {
    id: "milestone",
    title: "Milestone complete",
    description: "Every issue in the v2 motion milestone is closed.",
    icon: <Trophy />,
  },
];

export default function AchievementToastDemo() {
  const [open, setOpen] = useState(false);
  const [achievements, setAchievements] = useState<AchievementData[]>([]);

  const celebrateMilestone = useCallback(() => {
    // Reset first, so pressing the button twice replays the stagger instead of
    // appending to a list that is already on screen.
    setAchievements([]);
    window.setTimeout(() => setAchievements(milestone), 80);
  }, []);

  const dismissAchievement = useCallback((id: string) => {
    setAchievements((current) => current.filter((item) => item.id !== id));
  }, []);

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        One toast for a single win, a staggered group when several land at once.
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={buttonClassName}
        >
          Ship a deploy
        </button>

        <button
          type="button"
          onClick={celebrateMilestone}
          className={buttonClassName}
        >
          Close the milestone
        </button>
      </div>

      <AchievementToast
        open={open}
        onOpenChange={setOpen}
        title="Deploy successful"
        description="matos-ui.com is live on production."
        icon={<Rocket />}
        position="bottom-right"
      />

      <AchievementToastGroup
        achievements={achievements}
        onDismiss={dismissAchievement}
        position="bottom-left"
      />
    </div>
  );
}
