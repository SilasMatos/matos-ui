"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { type ComponentProps, type ReactNode, useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

export const insetCommandDockVariants = tv({
  slots: {
    root: [
      "not-prose inline-flex max-w-full overflow-hidden border border-border bg-secondary text-foreground shadow-sm",
      "p-1.5",
    ],
    inner: [
      "flex max-w-full items-center gap-1 overflow-x-auto border border-border/60 bg-card p-1 shadow-xs",
      "scrollbar-none",
    ],
    action: [
      "group relative inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl px-2.5 text-muted-foreground text-xs font-medium",
      "transition-colors duration-200 hover:bg-muted/50 hover:text-foreground",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      "disabled:pointer-events-none disabled:opacity-50",
      "data-[active=true]:text-foreground",
    ],
    separator: "mx-1 h-5 w-px shrink-0 bg-border",
    status: [
      "ml-1 inline-flex h-8 shrink-0 items-center gap-1.5 rounded-xl border border-border/60 bg-secondary px-2.5 text-muted-foreground text-xs font-medium",
    ],
  },
  variants: {
    shape: {
      rounded: {
        root: "rounded-2xl",
        inner: "rounded-xl",
      },
      pill: {
        root: "rounded-full",
        inner: "rounded-full",
        action: "rounded-full",
        status: "rounded-full",
      },
    },
    density: {
      compact: {
        root: "p-1",
        inner: "gap-0.5 p-0.5",
        action: "h-8 min-w-8 px-2",
        status: "h-7 px-2",
      },
      comfortable: {},
    },
    variant: {
      default: {},
      floating: {
        root: "shadow-lg",
      },
    },
  },
  defaultVariants: {
    shape: "rounded",
    density: "comfortable",
    variant: "default",
  },
});

const dockVariants: Variants = {
  hidden: { opacity: 0, y: 8, scale: 0.99 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.32,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const separatorVariants: Variants = {
  hidden: { opacity: 0, scaleY: 0.45 },
  visible: {
    opacity: 1,
    scaleY: 1,
    transition: {
      duration: 0.22,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export type InsetCommandDockAction = {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick?: (action: InsetCommandDockAction) => void;
  disabled?: boolean;
};

export type InsetCommandDockGroup = {
  id: string;
  actions: InsetCommandDockAction[];
};

export type InsetCommandDockStatus = {
  label: ReactNode;
  state?: "default" | "syncing";
};

export type InsetCommandDockProps = ComponentProps<"div"> &
  VariantProps<typeof insetCommandDockVariants> & {
    actions?: InsetCommandDockAction[];
    groups?: InsetCommandDockGroup[];
    activeId?: string;
    defaultActiveId?: string;
    onAction?: (action: InsetCommandDockAction) => void;
    showLabels?: boolean;
    status?: InsetCommandDockStatus;
    ariaLabel?: string;
  };

function normalizeGroups({
  actions,
  groups,
}: Pick<InsetCommandDockProps, "actions" | "groups">) {
  if (groups?.length) {
    return groups;
  }

  return [
    {
      id: "default",
      actions: actions ?? [],
    },
  ];
}

export function InsetCommandDock({
  className,
  actions,
  groups,
  activeId,
  defaultActiveId,
  onAction,
  showLabels = true,
  status,
  ariaLabel = "Command actions",
  shape,
  density,
  variant,
  ...props
}: InsetCommandDockProps) {
  const shouldReduceMotion = useReducedMotion();
  const styles = insetCommandDockVariants({ shape, density, variant });
  const normalizedGroups = useMemo(
    () => normalizeGroups({ actions, groups }),
    [actions, groups],
  );
  const firstActionId = normalizedGroups[0]?.actions[0]?.id;
  const [internalActiveId, setInternalActiveId] = useState(
    defaultActiveId ?? firstActionId,
  );
  const selectedId = activeId ?? internalActiveId;

  function handleAction(action: InsetCommandDockAction) {
    if (action.disabled) {
      return;
    }

    if (activeId === undefined) {
      setInternalActiveId(action.id);
    }

    action.onClick?.(action);
    onAction?.(action);
  }

  return (
    <div
      data-slot="inset-command-dock"
      className={twMerge(styles.root(), className)}
      {...props}
    >
      <motion.div
        data-slot="inset-command-dock-inner"
        role="toolbar"
        aria-label={ariaLabel}
        variants={shouldReduceMotion ? undefined : dockVariants}
        initial={shouldReduceMotion ? false : "hidden"}
        animate="visible"
        className={styles.inner()}
        layout={!shouldReduceMotion}
      >
        {normalizedGroups.map((group, groupIndex) => (
          <InsetCommandDockGroupView
            key={group.id}
            group={group}
            groupIndex={groupIndex}
            actionClassName={styles.action()}
            separatorClassName={styles.separator()}
            selectedId={selectedId}
            showLabels={showLabels}
            shouldReduceMotion={shouldReduceMotion}
            onAction={handleAction}
          />
        ))}

        {status ? (
          <InsetCommandDockStatusView
            status={status}
            shouldReduceMotion={shouldReduceMotion}
            className={styles.status()}
          />
        ) : null}
      </motion.div>
    </div>
  );
}

type InsetCommandDockGroupViewProps = {
  group: InsetCommandDockGroup;
  groupIndex: number;
  actionClassName: string;
  separatorClassName: string;
  selectedId?: string;
  showLabels: boolean;
  shouldReduceMotion: boolean | null;
  onAction: (action: InsetCommandDockAction) => void;
};

function InsetCommandDockGroupView({
  group,
  groupIndex,
  actionClassName,
  separatorClassName,
  selectedId,
  showLabels,
  shouldReduceMotion,
  onAction,
}: InsetCommandDockGroupViewProps) {
  return (
    <>
      {groupIndex > 0 ? (
        <motion.span
          data-slot="inset-command-dock-separator"
          aria-hidden="true"
          variants={shouldReduceMotion ? undefined : separatorVariants}
          initial={shouldReduceMotion ? false : "hidden"}
          animate="visible"
          className={separatorClassName}
        />
      ) : null}

      {group.actions.map((action) => {
        const isActive = selectedId === action.id;

        return (
          <motion.button
            key={action.id}
            type="button"
            data-slot="inset-command-dock-action"
            data-active={isActive ? "true" : "false"}
            aria-label={showLabels ? undefined : action.label}
            aria-pressed={isActive}
            disabled={action.disabled}
            onClick={() => onAction(action)}
            className={actionClassName}
            whileHover={shouldReduceMotion ? undefined : { scale: 1.025 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
          >
            {isActive ? (
              <motion.span
                layoutId="inset-command-dock-active"
                aria-hidden="true"
                className="absolute inset-0 rounded-[inherit] bg-muted"
                transition={{
                  type: "spring",
                  stiffness: 420,
                  damping: 34,
                  mass: 0.8,
                }}
              />
            ) : null}

            {action.icon ? (
              <motion.span
                aria-hidden="true"
                className="relative z-10 inline-flex size-4 items-center justify-center [&_svg]:size-4"
                whileHover={shouldReduceMotion ? undefined : { y: -1 }}
                transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
              >
                {action.icon}
              </motion.span>
            ) : null}

            {showLabels ? (
              <span className="relative z-10 whitespace-nowrap">
                {action.label}
              </span>
            ) : null}
          </motion.button>
        );
      })}
    </>
  );
}

type InsetCommandDockStatusViewProps = {
  status: InsetCommandDockStatus;
  shouldReduceMotion: boolean | null;
  className?: string;
};

function InsetCommandDockStatusView({
  status,
  shouldReduceMotion,
  className,
}: InsetCommandDockStatusViewProps) {
  const isSyncing = status.state === "syncing";

  return (
    <motion.div
      data-slot="inset-command-dock-status"
      className={className}
      initial={shouldReduceMotion ? false : { opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="relative flex size-2 items-center justify-center">
        {isSyncing ? (
          <motion.span
            aria-hidden="true"
            className="absolute size-2 rounded-full bg-primary/20"
            animate={
              shouldReduceMotion
                ? undefined
                : { scale: [1, 1.8, 1.8], opacity: [0.55, 0, 0] }
            }
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeOut",
            }}
          />
        ) : null}
        <span className="relative size-1.5 rounded-full bg-primary" />
      </span>
      <span className="whitespace-nowrap">{status.label}</span>
    </motion.div>
  );
}

export { InsetCommandDockGroupView, InsetCommandDockStatusView };
