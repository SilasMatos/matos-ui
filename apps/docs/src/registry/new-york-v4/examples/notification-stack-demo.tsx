"use client";

import { useCallback, useRef, useState } from "react";

import { Button } from "@/registry/new-york-v4/ui/button";
import {
  type NotificationData,
  NotificationStack,
} from "@/registry/new-york-v4/ui/notification-stack";

const sampleNotifications: Omit<NotificationData, "id">[] = [
  {
    app: "GitHub",
    title: "Design tokens updated",
    description: "PR #128 is ready with refined surfaces and spacing tokens.",
    timestamp: "2m ago",
    action: {
      label: "Review",
      onClick: () => {},
    },
    avatar: (
      <span className="flex size-full items-center justify-center rounded-xl bg-primary text-primary-foreground text-xs font-semibold">
        GH
      </span>
    ),
  },
  {
    app: "Linear",
    title: "MAT-342 assigned",
    description: "Fix mobile spacing on the notification stack preview.",
    timestamp: "5m ago",
    avatar: (
      <span className="flex size-full items-center justify-center rounded-xl bg-muted text-foreground text-xs font-semibold">
        LN
      </span>
    ),
  },
  {
    app: "Vercel",
    title: "Deploy completed",
    description: "matos-ui.com was deployed successfully to production.",
    timestamp: "8m ago",
    avatar: (
      <span className="flex size-full items-center justify-center rounded-xl bg-foreground text-background text-xs font-semibold">
        V
      </span>
    ),
  },
  {
    app: "Slack",
    title: "New design feedback",
    description: "The inset card direction feels cleaner and easier to scan.",
    timestamp: "12m ago",
    avatar: (
      <span className="flex size-full items-center justify-center rounded-xl bg-muted text-foreground text-xs font-semibold">
        SL
      </span>
    ),
  },
  {
    app: "Email",
    title: "Wireframes shared",
    description: "Ana sent the updated component flow for final review.",
    timestamp: "15m ago",
    avatar: (
      <span className="flex size-full items-center justify-center rounded-xl bg-primary text-primary-foreground text-xs font-semibold">
        AC
      </span>
    ),
  },
];

export default function NotificationStackDemo() {
  const [notifications, setNotifications] = useState<NotificationData[]>(() =>
    sampleNotifications.slice(0, 3).map((notification, index) => ({
      ...notification,
      id: `initial-${index}`,
    })),
  );

  const counterRef = useRef(3);

  const addNotification = useCallback(() => {
    const sample =
      sampleNotifications[
        Math.floor(Math.random() * sampleNotifications.length)
      ];
    counterRef.current += 1;

    const newNotification: NotificationData = {
      ...sample,
      id: `demo-${counterRef.current}-${Date.now()}`,
      timestamp: "now",
    };

    setNotifications((prev) => [...prev, newNotification]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id),
    );
  }, []);

  const dismissAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <div className="flex flex-col items-center gap-7">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={addNotification}
        >
          Add notification
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={dismissAll}
          disabled={notifications.length === 0}
        >
          Clear all
        </Button>
      </div>

      <p className="max-w-sm text-center text-muted-foreground text-xs">
        Drag the top card to dismiss it, or use the close control in the loose
        header.
      </p>

      <div className="flex min-h-44 items-center justify-center py-2">
        <NotificationStack
          notifications={notifications}
          onDismiss={dismiss}
          size="md"
        />
      </div>
    </div>
  );
}
