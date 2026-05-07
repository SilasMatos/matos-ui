"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Bell,
  CheckCircle2,
  Clock3,
  Cloud,
  Music2,
  Phone,
  Radio,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  DynamicIsland,
  type DynamicIslandVariant,
} from "@/registry/new-york-v4/ui/dynamic-island";

const variants: Array<{
  id: DynamicIslandVariant;
  label: string;
  icon: typeof Music2;
}> = [
  { id: "music", label: "Music", icon: Music2 },
  { id: "timer", label: "Timer", icon: Clock3 },
  { id: "recording", label: "Recording", icon: Radio },
  { id: "confirm", label: "Confirm", icon: CheckCircle2 },
  { id: "notification", label: "Notification", icon: Bell },
  { id: "progress", label: "Progress", icon: Cloud },
  { id: "call", label: "Call", icon: Phone },
];

export default function DynamicIslandDemo() {
  const shouldReduceMotion = useReducedMotion();
  const [activeVariant, setActiveVariant] =
    useState<DynamicIslandVariant>("music");
  const [isPlaying, setIsPlaying] = useState(true);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [progress, setProgress] = useState(68);

  const islandProps = useMemo(() => {
    const props = {
      music: {
        title: "Soft Focus",
        description: "Matos Radio",
        isPlaying,
        onPlayPause: () => setIsPlaying((value) => !value),
        icon: <Music2 className="size-5" aria-hidden="true" />,
      },
      timer: {
        time: "24:18",
        title: "24:18",
        isActive: isTimerRunning,
        description: isTimerRunning ? "Deep work session" : "Timer paused",
        onClick: () => setIsTimerRunning((value) => !value),
      },
      recording: {
        title: "Recording",
        time: "01:32",
        onStop: () => {},
      },
      confirm: {
        title: "Publish changes?",
        description: "This will update the public registry.",
        onCancel: () => {},
        onConfirm: () => {},
        icon: <CheckCircle2 className="size-5" aria-hidden="true" />,
      },
      notification: {
        title: "New component synced",
        description: "Dynamic Island is ready for review.",
        time: "Now",
        icon: <Bell className="size-5" aria-hidden="true" />,
      },
      progress: {
        title: "Uploading assets",
        description: "Syncing registry assets",
        progress,
        icon: <Cloud className="size-5" aria-hidden="true" />,
        onClick: () => setProgress((value) => (value >= 100 ? 12 : value + 16)),
      },
      call: {
        title: "Alex Morgan",
        description: "Design review call",
        onCancel: () => {},
        onConfirm: () => {},
      },
    } satisfies Record<DynamicIslandVariant, object>;

    return props[activeVariant];
  }, [activeVariant, isPlaying, isTimerRunning, progress]);

  return (
    <div className="flex w-full flex-col items-center gap-6 p-2">
      <div className="w-full overflow-x-auto pb-1">
        <div className="mx-auto grid w-full max-w-3xl grid-cols-4 gap-2 rounded-3xl border border-border/50 bg-card/80 p-2 shadow-sm backdrop-blur-xl sm:grid-cols-4 lg:grid-cols-5">
          {variants.map((item) => {
            const Icon = item.icon;
            const isActive = activeVariant === item.id;

            return (
              <motion.button
                key={item.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveVariant(item.id)}
                className={`group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl border text-sm outline-none transition-all duration-200 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  isActive
                    ? "border-border bg-background text-foreground shadow-sm"
                    : "border-transparent bg-transparent text-muted-foreground hover:bg-background/60"
                }`}
                layout
                whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                whileTap={
                  shouldReduceMotion ? undefined : { scale: 0.97, y: 0 }
                }
                transition={{
                  type: "spring",
                  stiffness: 360,
                  damping: 32,
                }}
              >
                {isActive ? (
                  <>
                    <motion.span
                      layoutId="dynamic-island-demo-active"
                      className="absolute inset-0 rounded-2xl border border-border bg-background shadow-xs"
                      transition={{
                        type: "spring",
                        stiffness: 360,
                        damping: 34,
                        mass: 0.86,
                      }}
                      aria-hidden="true"
                    />

                    <motion.span
                      className="absolute inset-x-4 top-0 h-10 rounded-full bg-primary/10 blur-xl"
                      animate={
                        shouldReduceMotion
                          ? undefined
                          : {
                              opacity: [0.2, 0.5, 0.2],
                              scale: [0.95, 1.05, 0.95],
                            }
                      }
                      transition={{
                        duration: 2.4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      aria-hidden="true"
                    />
                  </>
                ) : null}

                <motion.span
                  className="relative z-10 grid size-5 place-items-center"
                  animate={
                    isActive && !shouldReduceMotion
                      ? { scale: [1, 1.12, 1] }
                      : { scale: 1 }
                  }
                  transition={{
                    duration: 1.6,
                    repeat: isActive ? Infinity : 0,
                    ease: "easeInOut",
                  }}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </motion.span>

                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={item.label}
                    className="relative z-10 whitespace-nowrap font-medium"
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={shouldReduceMotion ? undefined : { opacity: 0, y: 4 }}
                    transition={{ duration: 0.18 }}
                  >
                    {item.label}
                  </motion.span>
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </div>

      <motion.div
        layout
        className="relative flex min-h-56 w-full max-w-4xl items-center justify-center overflow-hidden rounded-[2rem] border border-border/50 bg-card/40 p-5 shadow-sm backdrop-blur md:min-h-64"
      >
        <motion.span
          className="pointer-events-none absolute inset-x-12 top-8 h-24 rounded-full bg-primary/5 blur-3xl"
          animate={
            shouldReduceMotion
              ? undefined
              : { opacity: [0.35, 0.7, 0.35], scale: [0.92, 1.08, 0.92] }
          }
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden="true"
        />
        <DynamicIsland
          key="dynamic-island-showcase"
          variant={activeVariant}
          size="lg"
          {...islandProps}
        />
      </motion.div>

      <p className="max-w-xl text-center text-muted-foreground text-xs">
        Switch variants to see the island morph its width, hierarchy, actions,
        and motion language.
      </p>
    </div>
  );
}
