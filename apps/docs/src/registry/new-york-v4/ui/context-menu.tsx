"use client";

import { ContextMenu as ContextMenuPrimitive } from "@base-ui/react/context-menu";
import type { Menu as MenuPrimitive } from "@base-ui/react/menu";
import {
  motion,
  type Target,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { CheckIcon, ChevronRightIcon } from "lucide-react";
import {
  type ComponentProps,
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
  liftVariants,
  motionForOffset,
  useExitAnimation,
} from "@/registry/new-york-v4/lib/motion-tokens";
import { Elevated } from "@/registry/new-york-v4/ui/elevated";

// Same rung as dropdown / popover / select. This one is on the elevation
// ladder rather than on `bg-popover`, which is what lets it accept an offset
// at all.
const CONTEXT_MENU_OFFSET = 2;

// The overlay path, not the celebration path: a right-click menu is an
// ordinary popup, so its timing comes from the offset mapping instead of a
// hand-picked tier.
const contextMenuMotion = motionForOffset(CONTEXT_MENU_OFFSET);

const MotionElevated = motion.create(Elevated);

type Side = MenuPrimitive.Popup.State["side"];

/**
 * A popup enters *from* the side it is anchored to, which is the opposite of
 * where collision detection put it: a menu that had to flip above the cursor
 * (side "top") grows upward out of the pointer, so it travels from "bottom".
 *
 * Same mapping as the `slide-in-from-*` classes on Dropdown Menu, just as a
 * value instead of a class. Logical sides are read left-to-right; in RTL the
 * horizontal pair swaps, which costs 6px of travel in the wrong axis and
 * nothing else.
 */
const directionForSide: Record<Side, Direction> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
  "inline-start": "right",
  "inline-end": "left",
};

/**
 * The two halves of the entrance, composed.
 *
 * `liftVariants` carries the elevation half — the fade, the scale, and the
 * tier resolved from the offset. `directionalVariants` carries the origin
 * half — which axis the menu travels on to grow out of the pointer. The lift's
 * own travel is zeroed out (`y: 0`) so the direction owns that decision
 * outright instead of adding a stray 4px on the wrong axis.
 *
 * Both helpers land on the same tier here — `liftVariants(2)` resolves
 * `motionForOffset(2)` internally and `contextMenuMotion` is that same value —
 * so the merge can't produce two competing timings.
 */
function popupVariantsFor(side: Side): Variants {
  const lift = liftVariants(CONTEXT_MENU_OFFSET, { y: 0 });
  const origin = directionalVariants(directionForSide[side], contextMenuMotion);
  return {
    hidden: { ...(lift.hidden as Target), ...(origin.hidden as Target) },
    visible: { ...(lift.visible as Target), ...(origin.visible as Target) },
  };
}

const reducedPopupVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0 } },
};

type ContextMenuMotionContextValue = { open: boolean };

const ContextMenuMotionContext =
  createContext<ContextMenuMotionContextValue | null>(null);

function useContextMenuMotionContext() {
  return useContext(ContextMenuMotionContext) ?? { open: true };
}

export type ContextMenuProps = ContextMenuPrimitive.Root.Props;

/**
 * Right-click / long-press menu.
 *
 * Base UI's ContextMenu re-exports the same `Menu.*` parts Dropdown Menu is
 * built on — Item, Group, SubmenuRoot and the rest are literally the same
 * components. Roving focus, typeahead, Esc-to-close and submenu timing are
 * therefore shared implementation, not a second copy of them; only the
 * anchor (a virtual element at the pointer) and the surface differ.
 */
export function ContextMenu({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  ...props
}: ContextMenuProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = openProp ?? uncontrolledOpen;
  const contextValue = useMemo(() => ({ open }), [open]);

  const handleOpenChange = useCallback<
    NonNullable<ContextMenuPrimitive.Root.Props["onOpenChange"]>
  >(
    (nextOpen, eventDetails) => {
      if (openProp === undefined) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.(nextOpen, eventDetails);
    },
    [onOpenChange, openProp],
  );

  return (
    <ContextMenuMotionContext.Provider value={contextValue}>
      <ContextMenuPrimitive.Root
        open={open}
        onOpenChange={handleOpenChange}
        {...props}
      />
    </ContextMenuMotionContext.Provider>
  );
}

export type ContextMenuTriggerProps = ContextMenuPrimitive.Trigger.Props;

export function ContextMenuTrigger(props: ContextMenuTriggerProps) {
  return (
    <ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" {...props} />
  );
}

// React's DOM handlers for CSS animations and native drag collide with
// framer-motion's props of the same name. Base UI never passes them to the
// render prop, so dropping them here costs nothing.
type PopupRenderProps = Omit<
  ComponentProps<"div">,
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onAnimationIteration"
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
>;

type ContextMenuSurfaceProps = PopupRenderProps & {
  side: Side;
  open: boolean;
  shouldReduceMotion: boolean;
  onAnimationComplete: () => void;
};

function ContextMenuSurface({
  side,
  open,
  shouldReduceMotion,
  onAnimationComplete,
  ...props
}: ContextMenuSurfaceProps) {
  const variants = useMemo<Variants>(
    () => (shouldReduceMotion ? reducedPopupVariants : popupVariantsFor(side)),
    [side, shouldReduceMotion],
  );

  return (
    <MotionElevated
      offset={CONTEXT_MENU_OFFSET}
      // Pinned shadow weight, per Elevated's own guidance for menus: the fill
      // still tracks whatever substrate the menu opened over, but a menu
      // opened inside a dialog shouldn't cast a heavier drop than one opened
      // on the page.
      shadowLevel={3}
      variants={variants}
      initial="hidden"
      animate={open ? "visible" : "hidden"}
      // `hidden` carries no transition of its own, so this default only takes
      // effect on the way out — and it has to be the tier's *exit* duration,
      // because useExitAnimation arms its force-unmount fallback off that same
      // number. An exit running the longer entrance duration would be cut off
      // by its own guard.
      transition={
        open ? undefined : { duration: contextMenuMotion.exit.duration }
      }
      onAnimationComplete={onAnimationComplete}
      {...props}
    />
  );
}

export type ContextMenuContentProps = Omit<
  MenuPrimitive.Popup.Props,
  "className" | "render"
> &
  Pick<
    MenuPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  > & {
    className?: string;
  };

export function ContextMenuContent({
  align = "start",
  alignOffset = 2,
  side = "bottom",
  sideOffset = 2,
  className,
  ...props
}: ContextMenuContentProps) {
  const shouldReduceMotion = useReducedMotion();
  const { open } = useContextMenuMotionContext();
  const { mounted, onAnimationComplete } = useExitAnimation(
    open,
    contextMenuMotion,
  );

  if (!mounted) {
    return null;
  }

  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Positioner
        className="isolate z-50 outline-none"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <ContextMenuPrimitive.Popup
          data-slot="context-menu-content"
          className={cn(
            // No border: the shadow-surface ring on <Elevated> draws the edge.
            "max-h-(--available-height) min-w-40 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-xl p-1 outline-none",
            className,
          )}
          render={(popupProps, state) => (
            <ContextMenuSurface
              {...popupProps}
              side={state.side}
              open={open}
              shouldReduceMotion={Boolean(shouldReduceMotion)}
              onAnimationComplete={onAnimationComplete}
            />
          )}
          {...props}
        />
      </ContextMenuPrimitive.Positioner>
    </ContextMenuPrimitive.Portal>
  );
}

// Highlight tints the surface rather than replacing it, so a highlighted item
// stays on its rung of the ladder instead of jumping to an unrelated fill.
const menuItemClassName = [
  "relative flex cursor-default items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-foreground outline-hidden select-none",
  "transition-colors data-highlighted:bg-foreground/8 data-highlighted:text-foreground",
  "data-disabled:pointer-events-none data-disabled:opacity-50",
  "data-inset:pl-8",
  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
].join(" ");

const dangerItemClassName = [
  "data-[variant=danger]:text-destructive",
  "data-[variant=danger]:[&_svg]:text-destructive",
  "data-[variant=danger]:data-highlighted:bg-destructive/10",
  "data-[variant=danger]:data-highlighted:text-destructive",
].join(" ");

export type ContextMenuItemProps = Omit<
  MenuPrimitive.Item.Props,
  "className"
> & {
  className?: string;
  inset?: boolean;
  variant?: "default" | "danger";
  /**
   * Alias for `onClick`, matching the naming most menu APIs use. Both fire.
   */
  onSelect?: MenuPrimitive.Item.Props["onClick"];
};

export function ContextMenuItem({
  className,
  inset,
  variant = "default",
  onSelect,
  onClick,
  ...props
}: ContextMenuItemProps) {
  const handleClick = useCallback<
    NonNullable<MenuPrimitive.Item.Props["onClick"]>
  >(
    (event) => {
      onClick?.(event);
      onSelect?.(event);
    },
    [onClick, onSelect],
  );

  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      data-inset={inset}
      data-variant={variant}
      onClick={handleClick}
      className={cn(menuItemClassName, dangerItemClassName, className)}
      {...props}
    />
  );
}

export type ContextMenuGroupProps = MenuPrimitive.Group.Props;

export function ContextMenuGroup(props: ContextMenuGroupProps) {
  return (
    <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />
  );
}

export type ContextMenuLabelProps = Omit<
  MenuPrimitive.GroupLabel.Props,
  "className"
> & {
  className?: string;
  inset?: boolean;
};

export function ContextMenuLabel({
  className,
  inset,
  ...props
}: ContextMenuLabelProps) {
  return (
    <ContextMenuPrimitive.GroupLabel
      data-slot="context-menu-label"
      data-inset={inset}
      className={cn(
        "px-2 py-1.5 text-xs font-medium text-muted-foreground data-inset:pl-8",
        className,
      )}
      {...props}
    />
  );
}

export type ContextMenuSeparatorProps = Omit<
  ComponentProps<typeof ContextMenuPrimitive.Separator>,
  "className"
> & {
  className?: string;
};

export function ContextMenuSeparator({
  className,
  ...props
}: ContextMenuSeparatorProps) {
  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"
      // A tint of the foreground rather than `border-border`: on an elevated
      // surface a full border line out-contrasts the shadow ring drawing the
      // menu's own edge. Slightly stronger than the highlight tint, so it
      // reads as structure and not as a hover state.
      className={cn("-mx-1 my-1 h-px bg-foreground/10", className)}
      {...props}
    />
  );
}

export type ContextMenuShortcutProps = ComponentProps<"span">;

export function ContextMenuShortcut({
  className,
  ...props
}: ContextMenuShortcutProps) {
  return (
    <span
      data-slot="context-menu-shortcut"
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export type ContextMenuCheckboxItemProps = Omit<
  MenuPrimitive.CheckboxItem.Props,
  "className"
> & {
  className?: string;
};

export function ContextMenuCheckboxItem({
  className,
  children,
  ...props
}: ContextMenuCheckboxItemProps) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
      className={cn(menuItemClassName, "pr-8 pl-2", className)}
      {...props}
    >
      <span
        className="pointer-events-none absolute right-2 flex items-center justify-center"
        data-slot="context-menu-checkbox-item-indicator"
      >
        <ContextMenuPrimitive.CheckboxItemIndicator>
          <CheckIcon className="size-4" />
        </ContextMenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  );
}

export type ContextMenuRadioGroupProps = MenuPrimitive.RadioGroup.Props;

export function ContextMenuRadioGroup(props: ContextMenuRadioGroupProps) {
  return (
    <ContextMenuPrimitive.RadioGroup
      data-slot="context-menu-radio-group"
      {...props}
    />
  );
}

export type ContextMenuRadioItemProps = Omit<
  MenuPrimitive.RadioItem.Props,
  "className"
> & {
  className?: string;
};

export function ContextMenuRadioItem({
  className,
  children,
  ...props
}: ContextMenuRadioItemProps) {
  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
      className={cn(menuItemClassName, "pr-8 pl-2", className)}
      {...props}
    >
      <span
        className="pointer-events-none absolute right-2 flex items-center justify-center"
        data-slot="context-menu-radio-item-indicator"
      >
        <ContextMenuPrimitive.RadioItemIndicator>
          <CheckIcon className="size-4" />
        </ContextMenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  );
}

export type ContextMenuSubProps = MenuPrimitive.SubmenuRoot.Props;

export function ContextMenuSub({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  ...props
}: ContextMenuSubProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = openProp ?? uncontrolledOpen;
  const contextValue = useMemo(() => ({ open }), [open]);

  const handleOpenChange = useCallback<
    NonNullable<MenuPrimitive.SubmenuRoot.Props["onOpenChange"]>
  >(
    (nextOpen, eventDetails) => {
      if (openProp === undefined) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.(nextOpen, eventDetails);
    },
    [onOpenChange, openProp],
  );

  return (
    <ContextMenuMotionContext.Provider value={contextValue}>
      <ContextMenuPrimitive.SubmenuRoot
        open={open}
        onOpenChange={handleOpenChange}
        {...props}
      />
    </ContextMenuMotionContext.Provider>
  );
}

export type ContextMenuSubTriggerProps = Omit<
  MenuPrimitive.SubmenuTrigger.Props,
  "className"
> & {
  className?: string;
  inset?: boolean;
};

export function ContextMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: ContextMenuSubTriggerProps) {
  return (
    <ContextMenuPrimitive.SubmenuTrigger
      data-slot="context-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        menuItemClassName,
        "data-popup-open:bg-foreground/8",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="cn-rtl-flip ml-auto size-4" />
    </ContextMenuPrimitive.SubmenuTrigger>
  );
}

export type ContextMenuSubContentProps = ContextMenuContentProps;

export function ContextMenuSubContent({
  align = "start",
  alignOffset = -4,
  side = "inline-end",
  sideOffset = 0,
  className,
  ...props
}: ContextMenuSubContentProps) {
  return (
    <ContextMenuContent
      data-slot="context-menu-sub-content"
      className={cn("min-w-32", className)}
      align={align}
      alignOffset={alignOffset}
      side={side}
      sideOffset={sideOffset}
      {...props}
    />
  );
}
