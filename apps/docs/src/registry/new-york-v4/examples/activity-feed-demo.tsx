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
    id: "release",
    title: "Production release shipped",
    description: "Version 3.12.0 is live for all enterprise workspaces.",
    time: "4 min ago",
    badge: "Release",
    actor: { name: "Matos Deploy", initials: "MD" },
    icon: <Zap />,
    tone: "success",
    unread: true,
    checks: "18 checks",
  },
  {
    id: "review",
    title: "Checkout flow review requested",
    description: "The billing team opened a final review for plan upgrades.",
    time: "22 min ago",
    badge: "Review",
    actor: { name: "Ana Lima", initials: "AL" },
    icon: <GitPullRequestArrow />,
    tone: "info",
    checks: "9 checks",
  },
  {
    id: "summary",
    title: "Customer health summary generated",
    description: "New expansion risks were added to the QBR workspace brief.",
    time: "46 min ago",
    badge: "AI",
    actor: { name: "Workspace AI", initials: "AI" },
    icon: <Sparkles />,
    tone: "violet",
    unread: true,
    checks: "6 checks",
  },
  {
    id: "alert",
    title: "Usage threshold notification sent",
    description: "Acme Labs crossed 80% of their monthly automation quota.",
    time: "1 h ago",
    badge: "Usage",
    actor: { name: "Revenue Ops", initials: "RO" },
    icon: <Bell />,
    tone: "warning",
    checks: "4 checks",
  },
  {
    id: "audit",
    title: "Security audit passed",
    description: "SSO enforcement and approvals are compliant.",
    time: "3 h ago",
    badge: "Audit",
    actor: { name: "Security", initials: "SC" },
    icon: <CheckCircle2 />,
    tone: "success",
    checks: "12 checks",
  },
];

export default function ActivityFeedDemo() {
  return (
    <div className="flex w-full justify-center">
      <ActivityFeed
        className="max-w-[420px]"
        compact
        title="Activity"
        description="Latest workspace changes."
        items={activityItems}
      />
    </div>
  );
}
