"use client";

import {
  AnimatePresence,
  motion,
  type PanInfo,
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
  base: ["relative flex flex-col items-center"],
  variants: {
    size: {
      sm: "w-[320px]",
      md: "w-[380px]",
      lg: "w-[440px]",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export const notificationCardVariants = tv({
  base: [
    "w-full overflow-hidden rounded-[20px] border border-border",
    "bg-secondary text-foreground shadow-lg",
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
    const newNotification: NotificationData = {
      ...notification,
      id,
    };
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
  initial: { opacity: 0, y: -40, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 380,
      damping: 26,
      mass: 0.8,
    },
  },
  exit: {
    opacity: 0,
    y: -60,
    scale: 0.92,
    transition: {
      duration: 0.3,
      ease: [0.36, 0, 0.66, -0.56],
    },
  },
};

const stackLayerVariants: Variants = {
  initial: { opacity: 0, scale: 0.9, y: 0 },
  animate: (i: number) => ({
    opacity: 1,
    scaleX: 1 - i * 0.04,
    scaleY: 1,
    y: i * 8,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
      delay: i * 0.05,
    },
  }),
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.2 },
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
  const topNotification = notifications[notifications.length - 1];
  const stackCount = Math.min(notifications.length - 1, maxStackLayers);
  const remainingCount = notifications.length - 1;

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (!topNotification) return;
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
        style={{ paddingBottom: stackCount * 8 }}
      >
        <AnimatePresence>
          {Array.from({ length: stackCount }).map((_, i) => {
            const layerIndex = stackCount - i;
            return (
              <motion.div
                key={`stack-layer-${layerIndex}`}
                custom={layerIndex}
                variants={stackLayerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute inset-x-0 bottom-0 top-0 z-0 origin-bottom"
                style={{ zIndex: i }}
              >
                <div
                  className={twMerge(
                    notificationCardVariants(),
                    "h-full w-full",
                  )}
                  style={{ opacity: 0.3 + i * 0.2 }}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>

        <AnimatePresence mode="popLayout">
          {topNotification ? (
            <motion.div
              key={topNotification.id}
              variants={cardVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.5}
              onDragEnd={handleDragEnd}
              className="relative cursor-grab active:cursor-grabbing"
              style={{ zIndex: stackCount + 1 }}
            >
              <div className={notificationCardVariants()}>
                <div className="flex items-center justify-between px-4 pt-4 pb-3">
                  {topNotification.app && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground"
                    >
                      {topNotification.app}
                    </motion.span>
                  )}

                  <div className="flex items-center gap-2">
                    {topNotification.timestamp && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.15 }}
                        className="text-[11px] text-muted-foreground"
                      >
                        {topNotification.timestamp}
                      </motion.span>
                    )}

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.85 }}
                      onClick={() => onDismiss?.(topNotification.id)}
                      aria-label="Dispensar notificação"
                      className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <X className="size-3.5" strokeWidth={2} />
                    </motion.button>
                  </div>
                </div>

                <div
                  className={twMerge(
                    " flex items-start gap-3 overflow-hidden rounded-xl  bg-card p-4",
                    remainingCount === 0 && "mb-2",
                  )}
                >
                  {topNotification.avatar && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 20,
                        delay: 0.12,
                      }}
                      className="mt-0.5 flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted"
                    >
                      {topNotification.avatar}
                    </motion.div>
                  )}

                  <div className="min-w-0 flex-1">
                    <motion.p
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.08, duration: 0.25 }}
                      className="text-sm font-semibold leading-tight"
                    >
                      {topNotification.title}
                    </motion.p>

                    {topNotification.description && (
                      <motion.p
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.14, duration: 0.25 }}
                        className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground"
                      >
                        {topNotification.description}
                      </motion.p>
                    )}

                    {topNotification.action && (
                      <motion.button
                        type="button"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.22 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={topNotification.action.onClick}
                        className="mt-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {topNotification.action.label}
                      </motion.button>
                    )}
                  </div>
                </div>

                {remainingCount > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 }}
                    className="flex items-center px-4 pt-2 pb-3"
                  >
                    <span className="text-xs text-muted-foreground/80">
                      {remainingCount} more notification
                      {remainingCount > 1 ? "s" : ""}
                    </span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
