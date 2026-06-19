"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

export const sheetPanelBackdropVariants = cva([
  "not-prose fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px]",
  "transition-[opacity,backdrop-filter] duration-400 ease-out",
  "data-starting-style:opacity-0 data-starting-style:backdrop-blur-none",
  "data-ending-style:opacity-0 data-ending-style:backdrop-blur-none data-ending-style:duration-250",
  "motion-reduce:transition-none motion-reduce:backdrop-blur-none",
]);

export const SHEET_PANEL_DOT_PATTERN =
  "url(\"data:image/svg+xml,%3Csvg width='48' height='48' viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg' fill='none'%3E%3Cg opacity='0.18'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M12 11H11V12H12V11Z' fill='%23A1A1AA'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M12 23H11V24H12V23Z' fill='%23A1A1AA'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M11 35H12V36H11V35Z' fill='%23A1A1AA'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M12 47H11V48H12V47Z' fill='%23A1A1AA'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M23 11H24V12H23V11Z' fill='%23A1A1AA'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M24 23H23V24H24V23Z' fill='%23A1A1AA'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M23 35H24V36H23V35Z' fill='%23A1A1AA'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M24 47H23V48H24V47Z' fill='%23A1A1AA'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M35 11H36V12H35V11Z' fill='%23A1A1AA'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M36 23H35V24H36V23Z' fill='%23A1A1AA'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M35 35H36V36H35V35Z' fill='%23A1A1AA'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M36 47H35V48H36V47Z' fill='%23A1A1AA'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M47 11H48V12H47V11Z' fill='%23A1A1AA'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M48 23H47V24H48V23Z' fill='%23A1A1AA'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M47 35H48V36H47V35Z' fill='%23A1A1AA'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M48 47H47V48H48V47Z' fill='%23A1A1AA'/%3E%3C/g%3E%3C/svg%3E\")";

export const sheetPanelPopupVariants = cva(
  [
    "not-prose fixed z-50 flex flex-col overflow-hidden bg-muted text-foreground outline-none",
    "transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.32,1.36,0.5,1)] will-change-transform",
    "data-ending-style:duration-250 data-ending-style:ease-[cubic-bezier(0.4,0,1,1)]",
    "motion-reduce:transition-none",
  ],
  {
    variants: {
      side: {
        right:
          "inset-y-0 right-0 h-dvh rounded-l-2xl border-border border-l data-starting-style:translate-x-full data-ending-style:translate-x-full",
        left: "inset-y-0 left-0 h-dvh rounded-r-2xl border-border border-r data-starting-style:-translate-x-full data-ending-style:-translate-x-full",
        top: "inset-x-0 top-0 w-full rounded-b-2xl border-border border-b data-starting-style:-translate-y-full data-ending-style:-translate-y-full",
        bottom:
          "inset-x-0 bottom-0 w-full rounded-t-2xl border-border border-t data-starting-style:translate-y-full data-ending-style:translate-y-full",
      },
      size: {
        sm: "",
        md: "",
        lg: "",
        xl: "",
      },
    },
    compoundVariants: [
      { side: ["left", "right"], size: "sm", class: "w-full max-w-sm" },
      { side: ["left", "right"], size: "md", class: "w-full max-w-md" },
      { side: ["left", "right"], size: "lg", class: "w-full max-w-lg" },
      { side: ["left", "right"], size: "xl", class: "w-full max-w-xl" },
      { side: ["top", "bottom"], size: "sm", class: "max-h-[40dvh]" },
      { side: ["top", "bottom"], size: "md", class: "max-h-[55dvh]" },
      { side: ["top", "bottom"], size: "lg", class: "max-h-[70dvh]" },
      { side: ["top", "bottom"], size: "xl", class: "max-h-[88dvh]" },
    ],
    defaultVariants: {
      side: "right",
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
        delayChildren: reduce ? 0 : 0.12,
        staggerChildren: reduce ? 0 : 0.06,
      },
    },
  };
}

function getItemVariants(reduce: boolean) {
  return reduce
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
        visible: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: { duration: 0.4, ease: STAGGER_EASE },
        },
      };
}

export type SheetPanelProps = DialogPrimitive.Root.Props;

export function SheetPanel(props: SheetPanelProps) {
  return <DialogPrimitive.Root {...props} />;
}

export type SheetPanelTriggerProps = DialogPrimitive.Trigger.Props;

export function SheetPanelTrigger(props: SheetPanelTriggerProps) {
  return <DialogPrimitive.Trigger data-slot="sheet-panel-trigger" {...props} />;
}

export type SheetPanelCloseProps = DialogPrimitive.Close.Props;

export function SheetPanelClose(props: SheetPanelCloseProps) {
  return <DialogPrimitive.Close data-slot="sheet-panel-close" {...props} />;
}

export type SheetPanelContentProps = Omit<
  DialogPrimitive.Popup.Props,
  "className" | "render"
> &
  VariantProps<typeof sheetPanelPopupVariants> & {
    className?: string;
    children?: ReactNode;
    showClose?: boolean;
    texture?: boolean;
    backdropClassName?: string;
    contentClassName?: string;
  };

export function SheetPanelContent({
  className,
  contentClassName,
  backdropClassName,
  children,
  side = "right",
  size = "md",
  showClose = true,
  texture = true,
  style,
  ...props
}: SheetPanelContentProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop
        data-slot="sheet-panel-backdrop"
        className={cn(sheetPanelBackdropVariants(), backdropClassName)}
      />
      <DialogPrimitive.Popup
        data-slot="sheet-panel"
        className={cn(sheetPanelPopupVariants({ side, size }), className)}
        style={
          texture
            ? {
                backgroundImage: SHEET_PANEL_DOT_PATTERN,
                backgroundSize: "48px 48px",
                backgroundRepeat: "repeat",
                backgroundClip: "padding-box",
                ...style,
              }
            : style
        }
        {...props}
      >
        {showClose ? (
          <DialogPrimitive.Close
            data-slot="sheet-panel-close-button"
            aria-label="Close panel"
            className={cn(
              "absolute top-4 right-4 z-10 inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground",
              "transition-[background-color,color,transform] duration-200 ease-out hover:bg-muted/70 hover:text-foreground active:scale-95",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transform-none",
            )}
          >
            <X className="size-4" aria-hidden="true" />
          </DialogPrimitive.Close>
        ) : null}
        <motion.div
          data-slot="sheet-panel-content"
          className={cn("flex min-h-0 flex-1 flex-col", contentClassName)}
          variants={getContainerVariants(shouldReduceMotion)}
          initial="hidden"
          animate="visible"
        >
          {children}
        </motion.div>
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  );
}

export type SheetPanelHeaderProps = ComponentProps<"div">;

export function SheetPanelHeader({
  className,
  children,
  ...props
}: SheetPanelHeaderProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;

  return (
    <motion.div
      data-slot="sheet-panel-header"
      className={cn(
        "flex shrink-0 flex-col gap-1 px-5 pt-5 pr-14 pb-3",
        className,
      )}
      variants={getItemVariants(shouldReduceMotion)}
      {...(props as object)}
    >
      {children}
    </motion.div>
  );
}

export type SheetPanelTitleProps = DialogPrimitive.Title.Props;

export function SheetPanelTitle({ className, ...props }: SheetPanelTitleProps) {
  return (
    <DialogPrimitive.Title
      data-slot="sheet-panel-title"
      className={cn(
        "font-semibold text-base text-foreground leading-none tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

export type SheetPanelDescriptionProps = DialogPrimitive.Description.Props;

export function SheetPanelDescription({
  className,
  ...props
}: SheetPanelDescriptionProps) {
  return (
    <DialogPrimitive.Description
      data-slot="sheet-panel-description"
      className={cn("text-muted-foreground text-sm leading-relaxed", className)}
      {...props}
    />
  );
}

export type SheetPanelBodyProps = ComponentProps<"div">;

export function SheetPanelBody({
  className,
  children,
  ...props
}: SheetPanelBodyProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;

  return (
    <motion.div
      data-slot="sheet-panel-body"
      className={cn(
        "mx-2.5 flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto rounded-xl border border-border/60 bg-background p-5",
        className,
      )}
      variants={{
        hidden: getItemVariants(shouldReduceMotion).hidden,
        visible: {
          ...getItemVariants(shouldReduceMotion).visible,
          transition: {
            duration: shouldReduceMotion ? 0 : 0.4,
            ease: STAGGER_EASE,
            delayChildren: shouldReduceMotion ? 0 : 0.05,
            staggerChildren: shouldReduceMotion ? 0 : 0.06,
          },
        },
      }}
      {...(props as object)}
    >
      {children}
    </motion.div>
  );
}

export type SheetPanelSectionProps = ComponentProps<"div"> & {
  title?: ReactNode;
};

export function SheetPanelSection({
  className,
  title,
  children,
  ...props
}: SheetPanelSectionProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;

  return (
    <motion.div
      data-slot="sheet-panel-section"
      className={cn("flex flex-col gap-3", className)}
      variants={getItemVariants(shouldReduceMotion)}
      {...(props as object)}
    >
      {title ? (
        <span className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
          {title}
        </span>
      ) : null}
      {children}
    </motion.div>
  );
}

export type SheetPanelItemProps = ComponentProps<"div">;

export function SheetPanelItem({
  className,
  children,
  ...props
}: SheetPanelItemProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;

  return (
    <motion.div
      data-slot="sheet-panel-item"
      className={className}
      variants={getItemVariants(shouldReduceMotion)}
      {...(props as object)}
    >
      {children}
    </motion.div>
  );
}

export type SheetPanelFooterProps = ComponentProps<"div">;

export function SheetPanelFooter({
  className,
  children,
  ...props
}: SheetPanelFooterProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;

  return (
    <motion.div
      data-slot="sheet-panel-footer"
      className={cn(
        "flex shrink-0 items-center justify-end gap-2 px-5 pt-3 pb-5",
        className,
      )}
      variants={getItemVariants(shouldReduceMotion)}
      {...(props as object)}
    >
      {children}
    </motion.div>
  );
}
