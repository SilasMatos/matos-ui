"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import {
  type ComponentProps,
  type MouseEvent,
  type ReactNode,
  useMemo,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

export const breadcrumbVariants = tv({
  slots: {
    root: "w-full overflow-x-auto [mask-image:linear-gradient(to_right,transparent,black_18px,black_calc(100%-18px),transparent)]",
    list: [
      "relative flex min-w-max items-center gap-1 rounded-lg border border-border bg-background/85 px-1.5 py-1 shadow-sm backdrop-blur",
      "before:pointer-events-none before:absolute before:inset-x-3 before:bottom-0 before:h-px before:bg-linear-to-r before:from-transparent before:via-primary/30 before:to-transparent",
    ],
    item: "relative flex items-center",
    control: [
      "group relative inline-flex h-9 items-center gap-2 overflow-hidden rounded-md px-3 text-sm font-medium outline-none",
      "text-muted-foreground transition-colors duration-200",
      "hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "data-[current=true]:text-foreground",
      "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
    ],
    marker: [
      "relative z-10 size-1.5 rounded-full bg-muted-foreground/35 transition-all duration-200",
      "group-hover:bg-foreground/50 group-data-[current=true]:h-4 group-data-[current=true]:w-1 group-data-[current=true]:rounded-full group-data-[current=true]:bg-primary",
    ],
    label: "relative z-10 max-w-40 truncate",
    meta: "relative z-10 hidden text-xs text-muted-foreground/70 sm:inline",
    separator: "mx-0.5 text-muted-foreground/35",
    surface:
      "absolute inset-0 rounded-md border border-border bg-secondary/80 shadow-xs",
  },
  variants: {
    size: {
      sm: {
        list: "px-1 py-0.5",
        control: "h-8 px-2.5 text-xs",
      },
      md: {},
      lg: {
        list: "px-2 py-1.5",
        control: "h-10 px-3.5",
      },
    },
    tone: {
      default: {},
      muted: {
        list: "bg-muted/40 shadow-none",
      },
      floating: {
        list: "bg-background/75 shadow-lg shadow-foreground/5 supports-[backdrop-filter]:bg-background/60",
      },
    },
  },
  defaultVariants: {
    size: "md",
    tone: "default",
  },
});

export type BreadcrumbItem = {
  label: string;
  href?: string;
  icon?: ReactNode;
  meta?: string;
  current?: boolean;
  disabled?: boolean;
};

export type BreadcrumbProps = Omit<ComponentProps<"nav">, "children"> &
  VariantProps<typeof breadcrumbVariants> & {
    items: BreadcrumbItem[];
    activeIndex?: number;
    maxVisible?: number;
    ariaLabel?: string;
    onNavigate?: (item: BreadcrumbItem, index: number) => void;
  };

type VisibleItem =
  | {
      kind: "item";
      item: BreadcrumbItem;
      index: number;
    }
  | {
      kind: "ellipsis";
      index: number;
    };

const smoothEase = [0.22, 1, 0.36, 1] as const;
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 4, scale: 0.98 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.24,
      delay: index * 0.025,
      ease: smoothEase,
    },
  }),
};

function getVisibleItems(
  items: BreadcrumbItem[],
  maxVisible: number,
): VisibleItem[] {
  if (items.length <= maxVisible || maxVisible < 3) {
    return items.map((item, index) => ({ kind: "item", item, index }));
  }

  const tailCount = maxVisible - 2;
  const tail = items.slice(-tailCount).map((item, offset) => ({
    kind: "item" as const,
    item,
    index: items.length - tailCount + offset,
  }));

  return [
    { kind: "item", item: items[0], index: 0 },
    { kind: "ellipsis", index: 1 },
    ...tail,
  ];
}

export function Breadcrumb({
  items,
  activeIndex,
  maxVisible = 5,
  ariaLabel = "Breadcrumb",
  onNavigate,
  className,
  size,
  tone,
  ...props
}: BreadcrumbProps) {
  const styles = breadcrumbVariants({ size, tone });
  const shouldReduceMotion = useReducedMotion();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const currentIndex =
    activeIndex ??
    items.findIndex((item) => item.current) ??
    Math.max(items.length - 1, 0);
  const safeCurrentIndex =
    currentIndex < 0 ? Math.max(items.length - 1, 0) : currentIndex;

  const visibleItems = useMemo(
    () => getVisibleItems(items, maxVisible),
    [items, maxVisible],
  );

  function handleNavigate(
    event: MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
    item: BreadcrumbItem,
    index: number,
  ) {
    if (item.disabled) {
      event.preventDefault();
      return;
    }

    onNavigate?.(item, index);
  }

  return (
    <nav
      data-slot="breadcrumb"
      aria-label={ariaLabel}
      className={twMerge(styles.root(), className)}
      {...props}
    >
      <ol className={styles.list()}>
        {visibleItems.map((entry, visibleIndex) => {
          const isLast = visibleIndex === visibleItems.length - 1;

          if (entry.kind === "ellipsis") {
            return (
              <li
                key="ellipsis"
                className={styles.item()}
                aria-label="Collapsed breadcrumb items"
              >
                <span
                  className={twMerge(
                    styles.control(),
                    "cursor-default px-2 text-muted-foreground/65",
                  )}
                >
                  <MoreHorizontal className="size-4" aria-hidden="true" />
                </span>
                {!isLast ? (
                  <ChevronRight
                    className={twMerge(styles.separator(), "size-3.5")}
                    aria-hidden="true"
                  />
                ) : null}
              </li>
            );
          }

          const isCurrent = entry.index === safeCurrentIndex;
          const isHovered = hoveredIndex === entry.index;
          const showSurface = isCurrent || isHovered;
          const Control = entry.item.href ? motion.a : motion.button;

          return (
            <motion.li
              key={`${entry.item.label}-${entry.index}`}
              className={styles.item()}
              custom={visibleIndex}
              variants={itemVariants}
              initial={shouldReduceMotion ? false : "hidden"}
              animate="visible"
            >
              <Control
                href={entry.item.href}
                type={entry.item.href ? undefined : "button"}
                aria-current={isCurrent ? "page" : undefined}
                data-current={isCurrent}
                data-disabled={entry.item.disabled}
                className={styles.control()}
                onMouseEnter={() => setHoveredIndex(entry.index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onFocus={() => setHoveredIndex(entry.index)}
                onBlur={() => setHoveredIndex(null)}
                onClick={(event) =>
                  handleNavigate(event, entry.item, entry.index)
                }
                whileTap={
                  shouldReduceMotion || entry.item.disabled
                    ? undefined
                    : { scale: 0.98 }
                }
                transition={{ duration: 0.16, ease: smoothEase }}
              >
                <AnimatePresence>
                  {showSurface ? (
                    <motion.span
                      layoutId="breadcrumb-surface"
                      className={styles.surface()}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 360,
                        damping: 34,
                        mass: 0.82,
                      }}
                      aria-hidden="true"
                    />
                  ) : null}
                </AnimatePresence>

                {entry.item.icon ? (
                  <span className="relative z-10 text-muted-foreground transition-colors duration-200 group-hover:text-foreground group-data-[current=true]:text-primary">
                    {entry.item.icon}
                  </span>
                ) : (
                  <span className={styles.marker()} aria-hidden="true" />
                )}
                <span className={styles.label()}>{entry.item.label}</span>
                {entry.item.meta ? (
                  <span className={styles.meta()}>{entry.item.meta}</span>
                ) : null}
              </Control>

              {!isLast ? (
                <motion.span
                  className={styles.separator()}
                  animate={
                    shouldReduceMotion
                      ? undefined
                      : {
                          x: isHovered ? 1 : 0,
                          opacity: isHovered ? 0.85 : 0.45,
                        }
                  }
                  transition={{ duration: 0.18, ease: smoothEase }}
                  aria-hidden="true"
                >
                  <ChevronRight className="size-3.5" />
                </motion.span>
              ) : null}
            </motion.li>
          );
        })}
      </ol>
    </nav>
  );
}
