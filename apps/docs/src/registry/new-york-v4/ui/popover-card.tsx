"use client";

import { PreviewCard as PreviewCardPrimitive } from "@base-ui/react/preview-card";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, useReducedMotion } from "framer-motion";
import type * as React from "react";
import {
  type ComponentProps,
  type CSSProperties,
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { cn } from "@/lib/utils";
import {
  motionForOffset,
  stagger,
  staggerContainer,
  useExitAnimation,
} from "@/registry/new-york-v4/lib/motion-tokens";
import { Elevated } from "@/registry/new-york-v4/ui/elevated";

export const popoverCardTriggerVariants = cva(
  [
    "not-prose inline-flex cursor-pointer items-center rounded-md outline-none",
    // The open state pins the trigger at its lifted position, so it keeps an
    // explicit translate alongside the token-driven hover.
    "hover-lift [--lift:1px] data-popup-open:-translate-y-px",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  ],
  {
    variants: {
      underline: {
        true: "underline decoration-dotted decoration-muted-foreground/50 underline-offset-4 hover:decoration-foreground",
        false: "",
      },
    },
    defaultVariants: {
      underline: false,
    },
  },
);

export const popoverCardPopupVariants = cva(
  [
    // Border comes from the shadow-surface-N ring on the <Elevated> popup.
    "not-prose relative z-50 origin-(--transform-origin) rounded-2xl text-popover-foreground outline-none",
    "max-w-(--available-width) will-change-[opacity,transform,filter]",
    "transition-[opacity,transform,filter] duration-[var(--motion-duration)]",
    "data-starting-style:translate-y-[-6px] data-starting-style:scale-[0.96] data-starting-style:opacity-0 data-starting-style:blur-[6px]",
    "data-ending-style:translate-y-[-4px] data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-ending-style:blur-[3px] data-ending-style:duration-[var(--motion-exit-duration)]",
    "motion-reduce:transition-none motion-reduce:data-starting-style:blur-none motion-reduce:data-ending-style:blur-none",
  ],
  {
    variants: {
      size: {
        sm: "w-56",
        md: "w-72",
        lg: "w-80",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

const popoverCardMotion = motionForOffset(2);

type PopoverCardMotionContextValue = {
  open: boolean;
};

const PopoverCardMotionContext =
  createContext<PopoverCardMotionContextValue | null>(null);

function usePopoverCardMotionContext() {
  return useContext(PopoverCardMotionContext) ?? { open: true };
}

function getMotionStyle(style?: CSSProperties): CSSProperties {
  return {
    "--motion-duration": `${popoverCardMotion.duration}s`,
    "--motion-exit-duration": `${popoverCardMotion.exit.duration}s`,
    ...style,
  } as CSSProperties;
}

function getContainerVariants(reduce: boolean) {
  return reduce
    ? { hidden: {}, visible: {} }
    : staggerContainer("moderate", stagger.moderate);
}

function getItemVariants(reduce: boolean) {
  return reduce
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 6, filter: "blur(4px)" },
        visible: { opacity: 1, y: 0, filter: "blur(0px)" },
      };
}

export type PopoverCardProps = PreviewCardPrimitive.Root.Props;

export function PopoverCard({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  ...props
}: PopoverCardProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = openProp ?? uncontrolledOpen;
  const contextValue = useMemo(() => ({ open }), [open]);

  const handleOpenChange = useCallback<
    NonNullable<PreviewCardPrimitive.Root.Props["onOpenChange"]>
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
    <PopoverCardMotionContext.Provider value={contextValue}>
      <PreviewCardPrimitive.Root
        open={open}
        onOpenChange={handleOpenChange}
        {...props}
      />
    </PopoverCardMotionContext.Provider>
  );
}

export type PopoverCardTriggerProps = Omit<
  PreviewCardPrimitive.Trigger.Props,
  "className"
> &
  VariantProps<typeof popoverCardTriggerVariants> & {
    className?: string;
  };

export function PopoverCardTrigger({
  className,
  underline,
  style,
  ...props
}: PopoverCardTriggerProps) {
  const motionStyle = useMemo(() => getMotionStyle(style), [style]);

  return (
    <PreviewCardPrimitive.Trigger
      data-slot="popover-card-trigger"
      className={cn(popoverCardTriggerVariants({ underline }), className)}
      style={motionStyle}
      {...props}
    />
  );
}

export type PopoverCardContentProps = Omit<
  PreviewCardPrimitive.Popup.Props,
  "className" | "render"
> &
  VariantProps<typeof popoverCardPopupVariants> & {
    className?: string;
    children?: ReactNode;
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
    sideOffset?: number;
    alignOffset?: number;
    showArrow?: boolean;
    positionerClassName?: string;
    contentClassName?: string;
  };

export function PopoverCardContent({
  className,
  contentClassName,
  positionerClassName,
  children,
  size,
  side = "bottom",
  align = "center",
  sideOffset = 10,
  alignOffset = 0,
  showArrow = true,
  style,
  onTransitionEnd,
  ...props
}: PopoverCardContentProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const { open } = usePopoverCardMotionContext();
  const { mounted, onAnimationComplete } = useExitAnimation(
    open,
    popoverCardMotion,
  );
  const motionStyle = useMemo(() => getMotionStyle(style), [style]);
  const handleTransitionEnd = useCallback<
    React.TransitionEventHandler<HTMLDivElement>
  >(
    (event) => {
      onTransitionEnd?.(
        event as Parameters<
          NonNullable<PreviewCardPrimitive.Popup.Props["onTransitionEnd"]>
        >[0],
      );
      if (event.currentTarget === event.target) {
        onAnimationComplete();
      }
    },
    [onAnimationComplete, onTransitionEnd],
  );

  if (!mounted) {
    return null;
  }

  return (
    <PreviewCardPrimitive.Portal>
      <PreviewCardPrimitive.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        className={cn("z-50 outline-none", positionerClassName)}
      >
        <PreviewCardPrimitive.Popup
          render={<Elevated offset={2} />}
          data-slot="popover-card"
          className={cn(popoverCardPopupVariants({ size }), className)}
          style={motionStyle}
          onTransitionEnd={handleTransitionEnd}
          {...props}
        >
          {showArrow ? (
            <PreviewCardPrimitive.Arrow
              data-slot="popover-card-arrow"
              className={cn(
                "transition-[transform,top,bottom,left,right] duration-[var(--motion-duration)]",
                "data-[side=top]:rotate-180 data-[side=left]:-rotate-90 data-[side=right]:rotate-90",
                "data-starting-style:scale-75 data-starting-style:opacity-0",
              )}
            >
              <PopoverCardArrowSvg />
            </PreviewCardPrimitive.Arrow>
          ) : null}
          <motion.div
            data-slot="popover-card-content"
            className={cn("flex flex-col gap-3 p-4", contentClassName)}
            variants={getContainerVariants(shouldReduceMotion)}
            initial="hidden"
            animate="visible"
          >
            {children}
          </motion.div>
        </PreviewCardPrimitive.Popup>
      </PreviewCardPrimitive.Positioner>
    </PreviewCardPrimitive.Portal>
  );
}

function PopoverCardArrowSvg() {
  return (
    <svg
      width="20"
      height="10"
      viewBox="0 0 20 10"
      fill="none"
      aria-hidden="true"
      className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.04)]"
    >
      <path
        d="M9.66 2.6 4.81 6.97A4.5 4.5 0 0 1 2.13 8H0v2h20V8h-1.46a4.5 4.5 0 0 1-3.02-1.03L10.66 2.6a0.75 0.75 0 0 0-1 0Z"
        className="fill-popover"
      />
      <path
        d="M10.33 3.35 5.48 7.72A6 6 0 0 1 2.13 9H0V8h2.13a4.5 4.5 0 0 0 2.68-1.03l4.85-4.37a0.75 0.75 0 0 1 1 0l4.86 4.37A4.5 4.5 0 0 0 18.54 8H20v1h-1.46a6 6 0 0 1-3.35-1.28l-4.86-4.37Z"
        className="fill-border"
      />
    </svg>
  );
}

type ItemProps = ComponentProps<"div">;

export function PopoverCardHeader({ className, ...props }: ItemProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;

  return (
    <motion.div
      data-slot="popover-card-header"
      className={cn("flex items-center gap-3", className)}
      variants={getItemVariants(shouldReduceMotion)}
      transition={shouldReduceMotion ? undefined : popoverCardMotion}
      {...(props as object)}
    >
      {props.children}
    </motion.div>
  );
}

export function PopoverCardBody({ className, ...props }: ItemProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;

  return (
    <motion.div
      data-slot="popover-card-body"
      className={cn("text-sm leading-relaxed text-muted-foreground", className)}
      variants={getItemVariants(shouldReduceMotion)}
      transition={shouldReduceMotion ? undefined : popoverCardMotion}
      {...(props as object)}
    >
      {props.children}
    </motion.div>
  );
}

export function PopoverCardFooter({ className, ...props }: ItemProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;

  return (
    <motion.div
      data-slot="popover-card-footer"
      className={cn(
        "flex items-center gap-2 border-border/60 border-t pt-3",
        className,
      )}
      variants={getItemVariants(shouldReduceMotion)}
      transition={shouldReduceMotion ? undefined : popoverCardMotion}
      {...(props as object)}
    >
      {props.children}
    </motion.div>
  );
}

export function PopoverCardItem({ className, ...props }: ItemProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;

  return (
    <motion.div
      data-slot="popover-card-item"
      className={className}
      variants={getItemVariants(shouldReduceMotion)}
      transition={shouldReduceMotion ? undefined : popoverCardMotion}
      {...(props as object)}
    >
      {props.children}
    </motion.div>
  );
}

export type PopoverCardTitleProps = ComponentProps<"div">;

export function PopoverCardTitle({
  className,
  ...props
}: PopoverCardTitleProps) {
  return (
    <div
      data-slot="popover-card-title"
      className={cn(
        "text-sm font-semibold leading-none text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export type PopoverCardDescriptionProps = ComponentProps<"div">;

export function PopoverCardDescription({
  className,
  ...props
}: PopoverCardDescriptionProps) {
  return (
    <div
      data-slot="popover-card-description"
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}
