"use client";

import {
  AnimatePresence,
  motion,
  type PanInfo,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { X } from "lucide-react";
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

export const notificationStackVariants = tv({
  base: [
    "relative flex flex-col items-center",
    "[--notification-panel-inset:--spacing(2.5)]",
  ],
  variants: {
    size: {
      sm: "w-[300px]",
      md: "w-[360px]",
      lg: "w-[420px]",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export const notificationCardVariants = tv({
  base: [
    "w-full overflow-hidden rounded-[20px] border border-border/60",
    "bg-muted/55 text-foreground",
  ],
});

export type NotificationData = {
  id: string;
  app?: string;
  title: string;
  description?: string;
  avatar?: ReactNode;
  timestamp?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
};

type NotificationContextValue = {
  notifications: NotificationData[];
  add: (notification: Omit<NotificationData, "id">) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(
  null,
);

export function useNotificationStack() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error(
      "useNotificationStack must be used within a NotificationStackProvider",
    );
  }
  return ctx;
}

export type NotificationStackProviderProps = {
  children: ReactNode;
};

export function NotificationStackProvider({
  children,
}: NotificationStackProviderProps) {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const counterRef = useRef(0);

  const add = useCallback((notification: Omit<NotificationData, "id">) => {
    counterRef.current += 1;
    const id = `notification-${counterRef.current}-${Date.now()}`;
    const newNotification: NotificationData = { ...notification, id };
    setNotifications((prev) => [...prev, newNotification]);
    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = useMemo(
    () => ({ notifications, add, dismiss, dismissAll }),
    [notifications, add, dismiss, dismissAll],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

const cardVariants: Variants = {
  initial: { opacity: 0, y: -24, scale: 0.97 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 360,
      damping: 30,
      mass: 0.86,
    },
  },
  exit: {
    opacity: 0,
    y: -34,
    scale: 0.97,
    transition: {
      duration: 0.2,
      ease: [0.32, 0, 0.67, 0],
    },
  },
};

const stackLayerVariants: Variants = {
  initial: { opacity: 0, scale: 0.96, y: 0 },
  animate: (i: number) => ({
    opacity: 1,
    scaleX: 1 - i * 0.035,
    scaleY: 1,
    y: i * 7,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 28,
      delay: i * 0.035,
    },
  }),
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.18 },
  },
};

export type NotificationStackProps = ComponentProps<"div"> &
  VariantProps<typeof notificationStackVariants> & {
    notifications: NotificationData[];
    onDismiss?: (id: string) => void;
    maxStackLayers?: number;
  };

export function NotificationStack({
  className,
  size,
  notifications,
  onDismiss,
  maxStackLayers = 3,
  ...props
}: NotificationStackProps) {
  const shouldReduceMotion = useReducedMotion();
  const topNotification = notifications[notifications.length - 1];
  const stackCount = Math.min(notifications.length - 1, maxStackLayers);
  const remainingCount = notifications.length - 1;

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (!topNotification) {
      return;
    }

    if (Math.abs(info.offset.y) > 80 || Math.abs(info.offset.x) > 120) {
      onDismiss?.(topNotification.id);
    }
  }

  return (
    <div
      data-slot="notification-stack"
      className={twMerge(notificationStackVariants({ size }), className)}
      {...props}
    >
      <div
        className="relative w-full"
        style={{ paddingBottom: stackCount * 7 }}
      >
        <AnimatePresence>
          {Array.from({ length: stackCount }).map((_, i) => {
            const layerIndex = stackCount - i;

            return (
              <motion.div
                key={`stack-layer-${layerIndex}`}
                custom={layerIndex}
                variants={stackLayerVariants}
                initial={shouldReduceMotion ? false : "initial"}
                animate="animate"
                exit="exit"
                className="absolute inset-x-0 bottom-0 top-0 z-0 origin-bottom"
                style={{ zIndex: i }}
              >
                <div
                  className={twMerge(
                    notificationCardVariants(),
                    "flex h-full w-full flex-col py-2.5",
                  )}
                  style={{ opacity: 0.4 + i * 0.16 }}
                >
                  <div className="mx-(--notification-panel-inset) min-h-16 flex-1 rounded-xl border border-border/50 bg-card/70" />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        <AnimatePresence mode="popLayout">
          {topNotification ? (
            <motion.div
              key={topNotification.id}
              variants={cardVariants}
              initial={shouldReduceMotion ? false : "initial"}
              animate="animate"
              exit="exit"
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.42}
              onDragEnd={handleDragEnd}
              className="relative cursor-grab active:cursor-grabbing"
              style={{ zIndex: stackCount + 1 }}
              whileHover={shouldReduceMotion ? undefined : { y: -2 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.995 }}
              transition={{ type: "spring", stiffness: 340, damping: 30 }}
            >
              <div className={notificationCardVariants()}>
                <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-3.5">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="size-1.5 shrink-0 rounded-full bg-primary"
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      {topNotification.app ? (
                        <motion.p
                          initial={shouldReduceMotion ? false : { opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.18 }}
                          className="truncate text-[10px] font-medium uppercase text-muted-foreground"
                        >
                          {topNotification.app}
                        </motion.p>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {topNotification.timestamp ? (
                      <motion.span
                        initial={shouldReduceMotion ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.08, duration: 0.18 }}
                        className="text-[11px] text-muted-foreground"
                      >
                        {topNotification.timestamp}
                      </motion.span>
                    ) : null}

                    <motion.button
                      type="button"
                      whileHover={
                        shouldReduceMotion ? undefined : { scale: 1.04 }
                      }
                      whileTap={
                        shouldReduceMotion ? undefined : { scale: 0.94 }
                      }
                      onClick={() => onDismiss?.(topNotification.id)}
                      aria-label="Dismiss notification"
                      className="flex size-6 items-center justify-center rounded-lg border border-border/60 bg-background/60 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <X className="size-3.5" strokeWidth={2} />
                    </motion.button>
                  </div>
                </div>

                <div className="mx-(--notification-panel-inset) overflow-hidden rounded-xl border border-border/60 bg-card text-card-foreground">
                  <div className="flex items-start gap-3 px-3 py-3">
                    {topNotification.avatar ? (
                      <motion.div
                        initial={
                          shouldReduceMotion
                            ? false
                            : { scale: 0.88, opacity: 0 }
                        }
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 360,
                          damping: 24,
                          delay: 0.06,
                        }}
                        className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-muted"
                      >
                        {topNotification.avatar}
                      </motion.div>
                    ) : null}

                    <div className="min-w-0 flex-1 space-y-1">
                      <motion.p
                        initial={
                          shouldReduceMotion ? false : { opacity: 0, y: 4 }
                        }
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.07, duration: 0.22 }}
                        className="truncate text-sm font-semibold leading-tight"
                      >
                        {topNotification.title}
                      </motion.p>

                      {topNotification.description ? (
                        <motion.p
                          initial={
                            shouldReduceMotion ? false : { opacity: 0, y: 4 }
                          }
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.11, duration: 0.22 }}
                          className="line-clamp-2 text-muted-foreground text-xs leading-relaxed"
                        >
                          {topNotification.description}
                        </motion.p>
                      ) : null}
                    </div>

                    {topNotification.action ? (
                      <motion.button
                        type="button"
                        initial={
                          shouldReduceMotion ? false : { opacity: 0, y: 4 }
                        }
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.14, duration: 0.2 }}
                        whileHover={shouldReduceMotion ? undefined : { y: -1 }}
                        whileTap={
                          shouldReduceMotion ? undefined : { scale: 0.96 }
                        }
                        onClick={topNotification.action.onClick}
                        className="shrink-0 rounded-lg border border-border/60 bg-background px-2.5 py-1 text-[11px] font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {topNotification.action.label}
                      </motion.button>
                    ) : null}
                  </div>
                </div>

                <motion.div
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18, duration: 0.2 }}
                  className="flex items-center justify-between gap-3 px-4 pb-3 pt-2"
                >
                  <span className="text-[11px] text-muted-foreground">
                    {remainingCount > 0
                      ? `${remainingCount} more notification${
                          remainingCount > 1 ? "s" : ""
                        }`
                      : "Swipe or close to dismiss"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span
                      className="size-1 rounded-full bg-muted-foreground/50"
                      aria-hidden="true"
                    />
                    {notifications.length} active
                  </span>
                </motion.div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
