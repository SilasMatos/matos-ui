"use client";

import {
  Bell,
  CheckCircle2,
  GitPullRequestArrow,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  ActivityFeed,
  type ActivityFeedItem,
} from "@/registry/new-york-v4/ui/activity-feed";

const activityItems: ActivityFeedItem[] = [
  {
    id: "deploy",
    title: "Production deploy completed",
    description: "Release v2.8.0 is now serving all US workspaces.",
    time: "2 min ago",
    badge: "Deploy",
    actor: { name: "Matos Bot", initials: "MB" },
    icon: <Zap />,
    tone: "success",
    unread: true,
    meta: "12 checks",
  },
  {
    id: "review",
    title: "Pricing table review requested",
    description: "Ana moved the billing page into final design review.",
    time: "18 min ago",
    badge: "Review",
    actor: { name: "Ana Lima", initials: "AL" },
    icon: <GitPullRequestArrow />,
    tone: "info",
  },
  {
    id: "ai",
    title: "AI summary generated",
    description: "A new customer health summary is ready for the sales team.",
    time: "41 min ago",
    badge: "AI",
    actor: { name: "Workspace AI", initials: "AI" },
    icon: <Sparkles />,
    tone: "violet",
    unread: true,
  },
  {
    id: "alert",
    title: "Invoice retry scheduled",
    description: "The payment retry will run automatically tomorrow.",
    time: "1 h ago",
    badge: "Billing",
    actor: { name: "Finance", initials: "FN" },
    icon: <Bell />,
    tone: "warning",
  },
  {
    id: "done",
    title: "Workspace security audit passed",
    description: "All critical identity policies are compliant.",
    time: "3 h ago",
    badge: "Audit",
    actor: { name: "Security", initials: "SC" },
    icon: <CheckCircle2 />,
    tone: "success",
  },
];

export default function ActivityFeedDemo() {
  return (
    <div className="flex w-full justify-center">
      <ActivityFeed
        title="Activity"
        description="Recent product events and operational changes."
        items={activityItems}
        action={
          <button
            type="button"
            className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            View all
          </button>
        }
      />
    </div>
  );
}
