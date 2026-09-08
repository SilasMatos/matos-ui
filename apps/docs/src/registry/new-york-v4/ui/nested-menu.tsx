"use client";

import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { cn } from "@/lib/utils";
import {
  type Direction,
  directionalVariants,
  motionForOffset,
  useExitAnimation,
  withReducedMotion,
} from "@/registry/new-york-v4/lib/motion-tokens";
import { surfaceClasses } from "@/registry/new-york-v4/lib/surface-classes";
import {
  SurfaceProvider,
  useSurface,
} from "@/registry/new-york-v4/lib/surface-context";

/**
 * A cascading menu — a submenu that opens a submenu that opens a submenu.
 *
 * It exists to demonstrate the founding problem of the Surface Philosophy
 * (`DESIGN.md` §2.1): a dropdown with a fixed background opened inside another
 * disappears into it. Here every level is `offset={2}` — the fill climbs the
 * ladder with the nesting (two rungs per level) so no level vanishes into
 * its parent, in either theme, at any depth. The *shadow* is pinned at a
 * constant `shadowLevel` (§2.5.5): a popover's shadow weight is an identity, not
 * a function of how deep it is, so all four levels cast the same
 * `shadow-surface-3`.
 *
 * Motion: each level enters 6px from its resolved side (`directionalVariants`)
 * on `motionForOffset(2)` — `moderate` — and is held mounted through its exit by
 * `useExitAnimation`.
 *
 * Not a motion token: the hover-open delay (`delay` / `closeDelay` on
 * `NestedMenuSubTrigger`) is interaction *logic* — a plain millisecond value —
 * and deliberately isn't derived from `spring` / `duration`.
 */

/** The pinned shadow weight — the same at every rung (DESIGN §2.5.5). */
const FIXED_SHADOW_LEVEL = 3;
const nestedMotion = motionForOffset(2);

function getMotionStyle(style?: CSSProperties): CSSProperties {
  return {
    "--motion-duration": `${nestedMotion.visualDuration}s`,
    "--motion-exit-duration": `${nestedMotion.exit.duration}s`,
    ...style,
  } as CSSProperties;
}

type OpenContextValue = { open: boolean };
const OpenContext = createContext<OpenContextValue>({ open: true });
const useOpenContext = () => useContext(OpenContext);

/** The side the popup travels *from* — the opposite of its resolved placement. */
function enterFrom(resolvedSide: string | null): Direction {
  switch (resolvedSide) {
    case "top":
      return "bottom";
    case "bottom":
      return "top";
    case "left":
    case "inline-start":
      return "right";
    default:
      return "left";
  }
}

function NestedMenu({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  ...props
}: MenuPrimitive.Root.Props) {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const open = openProp ?? uncontrolled;
  const context = useMemo(() => ({ open }), [open]);

  return (
    <OpenContext.Provider value={context}>
      <MenuPrimitive.Root
        data-slot="nested-menu"
        open={open}
        onOpenChange={(next, details) => {
          if (openProp === undefined) setUncontrolled(next);
          onOpenChange?.(next, details);
        }}
        {...props}
      />
    </OpenContext.Provider>
  );
}

function NestedMenuTrigger(props: MenuPrimitive.Trigger.Props) {
  return <MenuPrimitive.Trigger data-slot="nested-menu-trigger" {...props} />;
}

type PanelProps = MenuPrimitive.Popup.Props &
  Pick<
    MenuPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  >;

/**
 * The one place the ladder lives: read the substrate, climb two rungs for this
 * popover, paint `surface-{level}` for the fill and a *fixed* `surface-3`
 * shadow, then re-provide `level` so the next submenu down climbs from here.
 */
function MenuPanel({
  className,
  style,
  align = "start",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  children,
  ...props
}: PanelProps & { children?: ReactNode }) {
  const reduce = useReducedMotion();
  const { open } = useOpenContext();
  const substrate = useSurface();
  const level = Math.min(substrate + 2, 8);
  const { mounted, onAnimationComplete } = useExitAnimation(open, nestedMotion);

  const [resolvedSide, setResolvedSide] = useState<string | null>(side);
  const readSide = useCallback((node: HTMLDivElement | null) => {
    if (node) setResolvedSide(node.getAttribute("data-side"));
  }, []);

  const base = directionalVariants(enterFrom(resolvedSide), nestedMotion);
  const full = {
    hidden: base.hidden,
    visible: base.visible,
    exit: {
      ...base.hidden,
      transition: { duration: nestedMotion.exit.duration },
    },
  };
  // Reduced motion keeps the fade, drops the 6px travel.
  const variants = reduce ? withReducedMotion(full) : full;

  if (!mounted) return null;

  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        className="isolate z-50 outline-none"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <MenuPrimitive.Popup
          data-slot="nested-menu-content"
          data-surface={level}
          style={getMotionStyle(style)}
          className={cn(
            "not-prose min-w-44 rounded-lg border border-border/40 p-1 text-sm outline-none",
            surfaceClasses(level, FIXED_SHADOW_LEVEL),
            className,
          )}
          render={
            <motion.div
              ref={readSide}
              variants={variants}
              initial="hidden"
              animate={open ? "visible" : "exit"}
              onAnimationComplete={(definition) => {
                if (definition === "exit") onAnimationComplete();
              }}
            />
          }
          {...props}
        >
          <SurfaceProvider value={level}>{children}</SurfaceProvider>
        </MenuPrimitive.Popup>
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
}

function NestedMenuContent(props: PanelProps & { children?: ReactNode }) {
  return <MenuPanel {...props} />;
}

function NestedMenuSub({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  ...props
}: MenuPrimitive.SubmenuRoot.Props) {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const open = openProp ?? uncontrolled;
  const context = useMemo(() => ({ open }), [open]);

  return (
    <OpenContext.Provider value={context}>
      <MenuPrimitive.SubmenuRoot
        data-slot="nested-menu-sub"
        open={open}
        onOpenChange={(next, details) => {
          if (openProp === undefined) setUncontrolled(next);
          onOpenChange?.(next, details);
        }}
        {...props}
      />
    </OpenContext.Provider>
  );
}

function NestedMenuSubTrigger({
  className,
  children,
  /** Hover-intent delay in ms — interaction logic, not a motion token. */
  delay = 90,
  closeDelay = 240,
  ...props
}: MenuPrimitive.SubmenuTrigger.Props & {
  delay?: number;
  closeDelay?: number;
}) {
  return (
    <MenuPrimitive.SubmenuTrigger
      data-slot="nested-menu-sub-trigger"
      delay={delay}
      closeDelay={closeDelay}
      className={cn(
        "flex cursor-default select-none items-center gap-2 rounded-md px-2 py-1.5 outline-none",
        "focus:bg-accent focus:text-accent-foreground data-popup-open:bg-accent data-popup-open:text-accent-foreground",
        "[&_svg]:size-4 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    >
      <span className="flex-1 truncate">{children}</span>
      <ChevronRight className="ml-auto text-muted-foreground" />
    </MenuPrimitive.SubmenuTrigger>
  );
}

function NestedMenuSubContent(props: PanelProps & { children?: ReactNode }) {
  return (
    <MenuPanel
      data-slot="nested-menu-sub-content"
      side="right"
      align="start"
      alignOffset={-5}
      sideOffset={2}
      {...props}
    />
  );
}

function NestedMenuItem({
  className,
  variant = "default",
  ...props
}: MenuPrimitive.Item.Props & { variant?: "default" | "destructive" }) {
  return (
    <MenuPrimitive.Item
      data-slot="nested-menu-item"
      data-variant={variant}
      className={cn(
        "flex cursor-default select-none items-center gap-2 rounded-md px-2 py-1.5 outline-none",
        "focus:bg-accent focus:text-accent-foreground",
        "data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10",
        "data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    />
  );
}

function NestedMenuLabel({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="nested-menu-label"
      className={cn(
        "px-2 py-1 font-medium text-muted-foreground text-xs",
        className,
      )}
      {...props}
    />
  );
}

function NestedMenuSeparator({
  className,
  ...props
}: MenuPrimitive.Separator.Props) {
  return (
    <MenuPrimitive.Separator
      data-slot="nested-menu-separator"
      className={cn("-mx-1 my-1 h-px bg-border/60", className)}
      {...props}
    />
  );
}

function NestedMenuShortcut({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="nested-menu-shortcut"
      className={cn(
        "ml-auto text-muted-foreground text-xs tracking-widest",
        className,
      )}
      {...props}
    />
  );
}

export {
  NestedMenu,
  NestedMenuTrigger,
  NestedMenuContent,
  NestedMenuItem,
  NestedMenuLabel,
  NestedMenuSeparator,
  NestedMenuShortcut,
  NestedMenuSub,
  NestedMenuSubTrigger,
  NestedMenuSubContent,
};
