"use client";

import {
  Bell,
  CheckCircle2,
  Clock3,
  Cloud,
  Mic,
  Music2,
  Phone,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  DynamicIsland,
  type DynamicIslandMode,
  type DynamicIslandProps,
  type DynamicIslandVariant,
} from "@/registry/new-york-v4/ui/dynamic-island";

const activities: Array<{
  id: DynamicIslandVariant;
  label: string;
  icon: typeof Music2;
}> = [
  { id: "music", label: "Music", icon: Music2 },
  { id: "timer", label: "Timer", icon: Clock3 },
  { id: "recording", label: "Recording", icon: Mic },
  { id: "notification", label: "Notification", icon: Bell },
  { id: "progress", label: "Progress", icon: Cloud },
  { id: "call", label: "Call", icon: Phone },
  { id: "confirm", label: "Confirm", icon: CheckCircle2 },
];

const modes: Array<{ id: DynamicIslandMode; label: string }> = [
  { id: "compact", label: "Compact" },
  { id: "expanded", label: "Expanded" },
  { id: "split", label: "Split" },
  { id: "minimal", label: "Minimal" },
  { id: "transient", label: "Transient" },
  { id: "liveActivity", label: "Live" },
];

const controlButtonClassName =
  "inline-flex h-8 items-center justify-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[active=true]:bg-foreground data-[active=true]:text-background dark:data-[active=true]:bg-secondary dark:data-[active=true]:text-foreground";

export default function DynamicIslandDemo() {
  const [activity, setActivity] = useState<DynamicIslandVariant>("music");
  const [mode, setMode] = useState<DynamicIslandMode>("compact");
  const [isPlaying, setIsPlaying] = useState(true);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [progress, setProgress] = useState(34);

  useEffect(() => {
    if (activity !== "progress" || progress >= 100) {
      return;
    }

    const id = setInterval(() => {
      setProgress((value) => Math.min(100, value + 7));
    }, 900);

    return () => clearInterval(id);
  }, [activity, progress]);

  const activityProps = useMemo<DynamicIslandProps>(() => {
    const map = {
      music: {
        variant: "music",
        title: "Soft Focus",
        description: "Matos Radio",
        isPlaying,
        onPlayPause: () => setIsPlaying((value) => !value),
        icon: <Music2 className="size-4" aria-hidden="true" />,
      },
      timer: {
        variant: "timer",
        title: "24:18",
        time: "24:18",
        description: isTimerRunning ? "Deep work session" : "Timer paused",
        isActive: isTimerRunning,
        onClick: () => setIsTimerRunning((value) => !value),
      },
      recording: {
        variant: "recording",
        title: "Screen Recording",
        time: "01:32",
        onStop: () => setMode("compact"),
      },
      notification: {
        variant: "notification",
        title: "New component synced",
        description: "Dynamic Island is ready for review.",
        time: "Now",
        icon: <Bell className="size-4" aria-hidden="true" />,
      },
      progress: {
        variant: "progress",
        title: "Uploading assets",
        description: "Syncing registry assets",
        progress,
        icon: <Cloud className="size-4" aria-hidden="true" />,
      },
      call: {
        variant: "call",
        title: "Alex Morgan",
        description: "Design review call",
        onCancel: () => setMode("compact"),
        onConfirm: () => setMode("liveActivity"),
      },
      confirm: {
        variant: "confirm",
        title: "Publish changes?",
        description: "This will update the public registry.",
        icon: <CheckCircle2 className="size-4" aria-hidden="true" />,
        onCancel: () => setMode("compact"),
      },
    } satisfies Record<DynamicIslandVariant, DynamicIslandProps>;

    return map[activity];
  }, [activity, isPlaying, isTimerRunning, progress]);

  const secondaryActivity = useMemo<DynamicIslandProps>(
    () => ({
      variant: activity === "timer" ? "music" : "timer",
      title: activity === "timer" ? "Soft Focus" : "08:42",
      description: activity === "timer" ? "Matos Radio" : "Break timer",
      time: "08:42",
      isPlaying,
      isActive: true,
      icon:
        activity === "timer" ? (
          <Music2 className="size-4" aria-hidden="true" />
        ) : (
          <Clock3 className="size-4" aria-hidden="true" />
        ),
    }),
    [activity, isPlaying],
  );

  function selectActivity(nextActivity: DynamicIslandVariant) {
    setActivity(nextActivity);

    if (nextActivity === "notification") {
      setMode("transient");
      return;
    }

    if (nextActivity === "progress") {
      setProgress(12);
      setMode("liveActivity");
      return;
    }

    if (
      nextActivity === "music" ||
      nextActivity === "timer" ||
      nextActivity === "recording"
    ) {
      setMode("liveActivity");
      return;
    }

    setMode("expanded");
  }

  return (
    <div className="flex w-full flex-col items-center gap-5 p-2">
      <div className="flex max-w-3xl flex-wrap items-center justify-center gap-2">
        {activities.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              data-active={activity === item.id}
              onClick={() => selectActivity(item.id)}
              className={controlButtonClassName}
            >
              <Icon className="size-3.5" aria-hidden="true" />
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="flex max-w-2xl flex-wrap items-center justify-center gap-2">
        {modes.map((item) => (
          <button
            key={item.id}
            type="button"
            data-active={mode === item.id}
            onClick={() => setMode(item.id)}
            className={controlButtonClassName}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex min-h-48 w-full items-center justify-center rounded-4xl border border-border  p-5 shadow-sm">
        <DynamicIsland
          size="lg"
          mode={mode}
          autoCollapse
          autoCollapseDelay={2800}
          onModeChange={setMode}
          secondaryActivity={secondaryActivity}
          {...activityProps}
        />
      </div>

      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setIsPlaying((value) => !value)}
          className={controlButtonClassName}
        >
          {isPlaying ? "Pause music" : "Play music"}
        </button>
        <button
          type="button"
          onClick={() => setProgress(12)}
          className={controlButtonClassName}
        >
          Reset progress
        </button>
      </div>
    </div>
  );
}
