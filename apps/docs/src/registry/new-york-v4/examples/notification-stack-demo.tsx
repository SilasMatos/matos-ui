"use client";

import { useCallback, useRef, useState } from "react";
import { Elevated } from "@/registry/new-york-v4/ui/elevated";
import {
  type NotificationData,
  NotificationStack,
} from "@/registry/new-york-v4/ui/notification-stack";

// The <Elevated> wrapper supplies the surface; the button only carries shape,
// type and the hover tint, so it keeps its rung on the ladder while hovered.
const controlButtonClassName =
  "inline-flex h-7 items-center justify-center rounded-lg px-2.5 text-[12px] font-medium text-foreground transition-colors hover:bg-foreground/8 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-45";

const mutedControlButtonClassName =
  "inline-flex h-7 items-center justify-center rounded-lg px-2.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-foreground/8 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-45";

// Avatars are plain content: NotificationStack already frames the slot as its
// own surface level, so anything with a background here would double up.
const avatarClassName =
  "flex size-full items-center justify-center text-[11px] font-medium text-foreground";

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
    avatar: <span className={avatarClassName}>GH</span>,
  },
  {
    app: "Linear",
    title: "MAT-342 assigned",
    description: "Fix mobile spacing on the notification stack preview.",
    timestamp: "5m ago",
    avatar: <span className={avatarClassName}>LN</span>,
  },
  {
    app: "Vercel",
    title: "Deploy completed",
    description: "matos-ui.com was deployed successfully to production.",
    timestamp: "8m ago",
    avatar: <span className={avatarClassName}>V</span>,
  },
  {
    app: "Slack",
    title: "New design feedback",
    description: "The inset card direction feels cleaner and easier to scan.",
    timestamp: "12m ago",
    avatar: <span className={avatarClassName}>SL</span>,
  },
  {
    app: "Email",
    title: "Wireframes shared",
    description: "Ana sent the updated component flow for final review.",
    timestamp: "15m ago",
    avatar: <span className={avatarClassName}>AC</span>,
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
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Elevated offset={1} className="rounded-lg">
          <button
            type="button"
            onClick={addNotification}
            className={controlButtonClassName}
          >
            Add notification
          </button>
        </Elevated>
        <Elevated offset={1} className="rounded-lg">
          <button
            type="button"
            onClick={dismissAll}
            disabled={notifications.length === 0}
            className={mutedControlButtonClassName}
          >
            Clear all
          </button>
        </Elevated>
      </div>

      <p className="max-w-75 text-center text-[11px] leading-snug text-muted-foreground">
        Drag the top card to dismiss it, or use the close control in the card
        header.
      </p>

      <div className="flex min-h-36 items-center justify-center py-1">
        <NotificationStack
          notifications={notifications}
          onDismiss={dismiss}
          size="md"
        />
      </div>
    </div>
  );
}
