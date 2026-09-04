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

import {
  spring,
  staggerContainer,
} from "@/registry/new-york-v4/lib/motion-tokens";
import { Elevated } from "@/registry/new-york-v4/ui/elevated";

// The avatar frame both animates and sits on the elevation ladder; wrapping one
// in the other would add a layout box inside a fixed-size slot.
const MotionElevated = motion.create(Elevated);

export const notificationStackVariants = tv({
  base: "not-prose relative flex w-full max-w-full flex-col items-center",
  variants: {
    size: {
      sm: "max-w-[288px]",
      md: "max-w-[340px]",
      lg: "max-w-[392px]",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export const notificationCardVariants = tv({
  base: [
    // No border: this class set lands on an <Elevated>, whose shadow-surface-N
    // already draws a 1px ring. A border-border on top of it out-contrasts the
    // surface fill and flattens the elevation ladder.
    "w-full overflow-hidden rounded-2xl",
    "p-2.5 text-foreground",
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
  initial: { opacity: 0, y: -14, scale: 0.985 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: spring.moderate,
  },
  exit: {
    opacity: 0,
    y: -18,
    scale: 0.985,
    transition: spring.fast,
  },
};

const reducedCardVariants: Variants = {
  initial: { opacity: 1, y: 0, scale: 1 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: spring.fast,
  },
  exit: {
    opacity: 0,
    transition: spring.fast,
  },
};

const reducedStackLayerState = (i: number) => ({
  opacity: 1,
  scaleX: 1 - i * 0.026,
  scaleY: 1,
  y: i * 5,
});

const stackLayerContainerVariants: Variants = staggerContainer("fast", 0);

const stackLayerVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 0 },
  visible: (i: number) => ({
    opacity: 1,
    scaleX: 1 - i * 0.026,
    scaleY: 1,
    y: i * 5,
    transition: spring.moderate,
  }),
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: spring.fast,
  },
};

const reducedStackLayerVariants: Variants = {
  hidden: reducedStackLayerState,
  visible: (i: number) => ({
    ...reducedStackLayerState(i),
    transition: spring.fast,
  }),
  exit: {
    opacity: 0,
    transition: spring.fast,
  },
};

const cardContentContainerVariants: Variants = staggerContainer("fast", 0);

const cardContentItemVariants: Variants = {
  hidden: { opacity: 0, y: 3 },
  visible: {
    opacity: 1,
    y: 0,
    transition: spring.fast,
  },
};

const cardAvatarVariants: Variants = {
  hidden: { scale: 0.88, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: spring.fast,
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
  const activeCardVariants = shouldReduceMotion
    ? reducedCardVariants
    : cardVariants;
  const activeStackLayerVariants = shouldReduceMotion
    ? reducedStackLayerVariants
    : stackLayerVariants;

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
        style={{ paddingBottom: stackCount * 5 }}
      >
        <AnimatePresence>
          {stackCount > 0 ? (
            <motion.div
              key="stack-layers"
              variants={
                shouldReduceMotion ? undefined : stackLayerContainerVariants
              }
              initial={shouldReduceMotion ? false : "hidden"}
              animate="visible"
              exit={shouldReduceMotion ? undefined : "hidden"}
              className="absolute inset-0 z-0"
              aria-hidden="true"
            >
              <AnimatePresence initial={false}>
                {Array.from({ length: stackCount }).map((_, i) => {
                  const layerIndex = stackCount - i;

                  return (
                    <motion.div
                      key={`stack-layer-${layerIndex}`}
                      custom={layerIndex}
                      variants={activeStackLayerVariants}
                      initial={shouldReduceMotion ? false : undefined}
                      animate={shouldReduceMotion ? "visible" : undefined}
                      exit="exit"
                      className="absolute inset-x-0 bottom-0 top-0 origin-bottom"
                      style={{ zIndex: i }}
                    >
                      <Elevated
                        offset={1}
                        className={twMerge(
                          notificationCardVariants(),
                          "flex h-full w-full flex-col",
                        )}
                        style={{ opacity: 0.4 + i * 0.16 }}
                      >
                        <Elevated
                          offset={1}
                          className="min-h-12 flex-1 rounded-xl"
                        />
                      </Elevated>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence mode="popLayout">
          {topNotification ? (
            <motion.div
              key={topNotification.id}
              variants={activeCardVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.42}
              onDragEnd={handleDragEnd}
              className="relative cursor-grab active:cursor-grabbing"
              style={{ zIndex: stackCount + 1 }}
              whileHover={shouldReduceMotion ? undefined : { y: -1 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.995 }}
              transition={spring.moderate}
            >
              <Elevated offset={2} className={notificationCardVariants()}>
                <motion.div
                  variants={
                    shouldReduceMotion
                      ? undefined
                      : cardContentContainerVariants
                  }
                  initial={shouldReduceMotion ? false : "hidden"}
                  animate="visible"
                >
                  <div className="flex min-h-6 items-center justify-between gap-2 pb-2">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <span
                        className="size-1.25 shrink-0 rounded-full bg-secondary"
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        {topNotification.app ? (
                          <motion.p
                            variants={
                              shouldReduceMotion
                                ? undefined
                                : cardContentItemVariants
                            }
                            className="truncate text-[10px] font-medium uppercase leading-none text-muted-foreground"
                          >
                            {topNotification.app}
                          </motion.p>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {topNotification.timestamp ? (
                        <motion.span
                          variants={
                            shouldReduceMotion
                              ? undefined
                              : cardContentItemVariants
                          }
                          className="text-[10px] leading-none text-muted-foreground"
                        >
                          {topNotification.timestamp}
                        </motion.span>
                      ) : null}

                      <Elevated offset={1} className="rounded-md">
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
                          // Hover tints the surface instead of replacing it, so
                          // the control keeps its place on the ladder.
                          className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/8 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2"
                        >
                          <X className="size-3" strokeWidth={2} />
                        </motion.button>
                      </Elevated>
                    </div>
                  </div>

                  <Elevated
                    offset={1}
                    className="overflow-hidden rounded-xl text-foreground"
                  >
                    <div className="flex items-center gap-2 p-2">
                      {topNotification.avatar ? (
                        <MotionElevated
                          offset={1}
                          variants={
                            shouldReduceMotion ? undefined : cardAvatarVariants
                          }
                          className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md"
                        >
                          {topNotification.avatar}
                        </MotionElevated>
                      ) : null}

                      <div className="min-w-0 flex-1">
                        <p className="my-1.5 truncate text-sm font-medium leading-none text-foreground">
                          {topNotification.title}
                        </p>

                        {topNotification.description ? (
                          <p className="mb-0 mt-0.5 line-clamp-2 text-xs leading-[1.12] text-muted-foreground">
                            {topNotification.description}
                          </p>
                        ) : null}
                      </div>

                      {topNotification.action ? (
                        <Elevated offset={1} className="shrink-0 rounded-md">
                          <motion.button
                            type="button"
                            variants={
                              shouldReduceMotion
                                ? undefined
                                : cardContentItemVariants
                            }
                            whileHover={
                              shouldReduceMotion ? undefined : { y: -1 }
                            }
                            whileTap={
                              shouldReduceMotion ? undefined : { scale: 0.96 }
                            }
                            onClick={topNotification.action.onClick}
                            className="rounded-md px-2 py-1 text-[11px] font-medium leading-none text-foreground transition-colors hover:bg-foreground/8 focus-visible:outline-2 focus-visible:outline-offset-2"
                          >
                            {topNotification.action.label}
                          </motion.button>
                        </Elevated>
                      ) : null}
                    </div>
                  </Elevated>

                  <motion.div
                    variants={
                      shouldReduceMotion ? undefined : cardContentItemVariants
                    }
                    className="flex items-center justify-between gap-2 pt-2 text-[11px] leading-none text-muted-foreground"
                  >
                    <span>
                      {remainingCount > 0
                        ? `${remainingCount} more notification${
                            remainingCount > 1 ? "s" : ""
                          }`
                        : "Swipe or close to dismiss"}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="size-1 rounded-full bg-secondary"
                        aria-hidden="true"
                      />
                      {notifications.length} active
                    </span>
                  </motion.div>
                </motion.div>
              </Elevated>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
