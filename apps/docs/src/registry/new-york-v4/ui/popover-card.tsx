"use client";

import { PreviewCard as PreviewCardPrimitive } from "@base-ui/react/preview-card";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, useReducedMotion } from "framer-motion";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

export const popoverCardTriggerVariants = cva(
  [
    "not-prose inline-flex cursor-pointer items-center rounded-md outline-none",
    "transition-[transform,opacity,color] duration-200 ease-out",
    "hover:-translate-y-px data-popup-open:-translate-y-px motion-reduce:transform-none",
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
    "not-prose relative z-50 origin-(--transform-origin) rounded-2xl border border-border bg-popover/95 text-popover-foreground shadow-xl shadow-black/5 backdrop-blur-xl outline-none",
    "max-w-(--available-width) will-change-[opacity,transform,filter]",
    "transition-[opacity,transform,filter] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
    "data-starting-style:translate-y-[-6px] data-starting-style:scale-[0.96] data-starting-style:opacity-0 data-starting-style:blur-[6px]",
    "data-ending-style:translate-y-[-4px] data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-ending-style:blur-[3px] data-ending-style:duration-[180ms] data-ending-style:ease-in",
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

const STAGGER_EASE = [0.22, 1, 0.36, 1] as const;

function getContainerVariants(reduce: boolean) {
  return {
    hidden: {},
    visible: {
      transition: {
        delayChildren: reduce ? 0 : 0.06,
        staggerChildren: reduce ? 0 : 0.05,
      },
    },
  };
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

export function PopoverCard(props: PopoverCardProps) {
  return <PreviewCardPrimitive.Root {...props} />;
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
  ...props
}: PopoverCardTriggerProps) {
  return (
    <PreviewCardPrimitive.Trigger
      data-slot="popover-card-trigger"
      className={cn(popoverCardTriggerVariants({ underline }), className)}
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
  ...props
}: PopoverCardContentProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;

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
          data-slot="popover-card"
          className={cn(popoverCardPopupVariants({ size }), className)}
          {...props}
        >
          {showArrow ? (
            <PreviewCardPrimitive.Arrow
              data-slot="popover-card-arrow"
              className={cn(
                "transition-[transform,top,bottom,left,right] duration-200 ease-out",
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
      transition={{
        duration: shouldReduceMotion ? 0 : 0.3,
        ease: STAGGER_EASE,
      }}
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
      transition={{
        duration: shouldReduceMotion ? 0 : 0.3,
        ease: STAGGER_EASE,
      }}
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
      transition={{
        duration: shouldReduceMotion ? 0 : 0.3,
        ease: STAGGER_EASE,
      }}
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
      transition={{
        duration: shouldReduceMotion ? 0 : 0.3,
        ease: STAGGER_EASE,
      }}
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
