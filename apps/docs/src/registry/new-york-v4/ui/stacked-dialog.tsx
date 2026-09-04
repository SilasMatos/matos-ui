"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import {
  type ComponentProps,
  type CSSProperties,
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";
import {
  motionForOffset,
  type SpringTier,
  spring,
  useExitAnimation,
} from "@/registry/new-york-v4/lib/motion-tokens";
import { useSurface } from "@/registry/new-york-v4/lib/surface-context";
import { Elevated } from "@/registry/new-york-v4/ui/elevated";

// Every level asks for the same relative lift — Elevated resolves it against
// whatever substrate it's nested in, so a dialog opened from the page and one
// opened from inside another dialog both read "4 steps up from here" without
// either one computing an absolute level by hand.
const STACKED_DIALOG_OFFSET = 4;

const MotionElevated = motion.create(Elevated);

type StackedDialogMotionContextValue = { open: boolean };

const StackedDialogMotionContext =
  createContext<StackedDialogMotionContextValue | null>(null);

function useStackedDialogMotionContext() {
  return useContext(StackedDialogMotionContext) ?? { open: true };
}

type StackedDialogVariant = "default" | "danger";

const StackedDialogVariantContext =
  createContext<StackedDialogVariant>("default");

type StackedDialogStackContextValue = {
  registerChild: (close: () => void) => () => void;
};

const StackedDialogStackContext =
  createContext<StackedDialogStackContextValue | null>(null);

export type StackedDialogProps = DialogPrimitive.Root.Props;

export function StackedDialog({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  ...props
}: StackedDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = openProp ?? uncontrolledOpen;
  const actionsRef = useRef<DialogPrimitive.Root.Actions>(null);
  const childClosersRef = useRef<Set<() => void>>(new Set());
  const parentStack = useContext(StackedDialogStackContext);

  const registerChild = useCallback((close: () => void) => {
    childClosersRef.current.add(close);
    return () => {
      childClosersRef.current.delete(close);
    };
  }, []);

  // Closing this dialog while a child is still open must take the child with
  // it — otherwise the child's own `open` state survives the unmount and it
  // reappears already-open the next time this dialog is reopened.
  const closeSelf = useCallback(() => {
    actionsRef.current?.close();
  }, []);

  useEffect(() => {
    if (!parentStack) return;
    return parentStack.registerChild(closeSelf);
  }, [parentStack, closeSelf]);

  const handleOpenChange = useCallback<
    NonNullable<DialogPrimitive.Root.Props["onOpenChange"]>
  >(
    (nextOpen, eventDetails) => {
      if (!nextOpen) {
        for (const close of childClosersRef.current) close();
      }
      if (openProp === undefined) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.(nextOpen, eventDetails);
    },
    [onOpenChange, openProp],
  );

  const stackContextValue = useMemo<StackedDialogStackContextValue>(
    () => ({ registerChild }),
    [registerChild],
  );
  const motionContextValue = useMemo<StackedDialogMotionContextValue>(
    () => ({ open }),
    [open],
  );

  return (
    <StackedDialogStackContext.Provider value={stackContextValue}>
      <StackedDialogMotionContext.Provider value={motionContextValue}>
        <DialogPrimitive.Root
          open={open}
          onOpenChange={handleOpenChange}
          actionsRef={actionsRef}
          {...props}
        />
      </StackedDialogMotionContext.Provider>
    </StackedDialogStackContext.Provider>
  );
}

export type StackedDialogTriggerProps = DialogPrimitive.Trigger.Props;

export function StackedDialogTrigger(props: StackedDialogTriggerProps) {
  return (
    <DialogPrimitive.Trigger data-slot="stacked-dialog-trigger" {...props} />
  );
}

export type StackedDialogCloseProps = DialogPrimitive.Close.Props;

export function StackedDialogClose(props: StackedDialogCloseProps) {
  return <DialogPrimitive.Close data-slot="stacked-dialog-close" {...props} />;
}

const stackedDialogBackdropVariants = cva([
  "not-prose fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px]",
  "data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0",
  "duration-[var(--stacked-dialog-duration)] data-ending-style:duration-[var(--stacked-dialog-exit-duration)]",
  "motion-reduce:transition-none",
]);

const stackedDialogPopupVariants = cva(
  [
    // The shadow-surface-N ring on <Elevated> draws the edge — no
    // border-border here.
    "not-prose fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl p-5 outline-none",
    "transition-[filter] duration-[var(--stacked-dialog-dim-duration)] motion-reduce:transition-none",
    // A child dialog opening dims this one without hiding it, so the user
    // keeps their place in the stack instead of losing context underneath.
    "data-nested-dialog-open:[filter:brightness(0.85)_blur(1.5px)]",
  ],
  {
    variants: {
      variant: {
        default: "",
        danger:
          "data-[variant=danger]:ring-1 data-[variant=danger]:ring-destructive/25",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function getMotionStyle(
  tier: SpringTier,
  style?: CSSProperties,
): CSSProperties {
  return {
    "--stacked-dialog-duration": `${tier.visualDuration}s`,
    "--stacked-dialog-exit-duration": `${tier.exit.duration}s`,
    "--stacked-dialog-dim-duration": `${spring.fast.visualDuration}s`,
    ...style,
  } as CSSProperties;
}

export type StackedDialogContentProps = Omit<
  DialogPrimitive.Popup.Props,
  "className" | "render"
> &
  VariantProps<typeof stackedDialogPopupVariants> & {
    className?: string;
    children?: ReactNode;
    showClose?: boolean;
    backdropClassName?: string;
  };

export function StackedDialogContent({
  className,
  backdropClassName,
  children,
  variant = "default",
  showClose = true,
  style,
  ...props
}: StackedDialogContentProps) {
  const shouldReduceMotion = useReducedMotion();
  const { open } = useStackedDialogMotionContext();
  // The substrate this dialog is nested in — the page for a top-level
  // dialog, or the parent dialog's own Elevated level when this one opens
  // from inside another. `motionForOffset` then reads off that accumulated
  // level, not the local +4 offset, so a dialog buried two levels deep gets
  // the tier its actual depth calls for.
  const substrate = useSurface();
  const level = Math.min(substrate + STACKED_DIALOG_OFFSET, 8);
  const tier = motionForOffset(level);
  const { mounted, onAnimationComplete } = useExitAnimation(open, tier);
  const motionStyle = useMemo(() => getMotionStyle(tier, style), [tier, style]);

  const hidden = shouldReduceMotion
    ? { opacity: 0 }
    : { opacity: 0, scale: 0.95, y: 12 };
  const visible = shouldReduceMotion
    ? { opacity: 1 }
    : { opacity: 1, scale: 1, y: 0 };

  if (!mounted) {
    return null;
  }

  return (
    <StackedDialogVariantContext.Provider value={variant ?? "default"}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop
          data-slot="stacked-dialog-backdrop"
          className={cn(stackedDialogBackdropVariants(), backdropClassName)}
          style={motionStyle}
        />
        <DialogPrimitive.Popup
          data-slot="stacked-dialog-content"
          data-variant={variant}
          render={
            <MotionElevated
              offset={STACKED_DIALOG_OFFSET}
              initial={hidden}
              animate={open ? visible : hidden}
              transition={shouldReduceMotion ? { duration: 0 } : tier}
              onAnimationComplete={onAnimationComplete}
            />
          }
          className={cn(stackedDialogPopupVariants({ variant }), className)}
          style={motionStyle}
          {...props}
        >
          {children}
          {showClose ? (
            <DialogPrimitive.Close
              data-slot="stacked-dialog-close-button"
              aria-label="Close dialog"
              className={cn(
                "absolute top-3 right-3 inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground outline-none",
                "transition-colors duration-150 hover:bg-muted/70 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
              )}
            >
              <X className="size-4" aria-hidden="true" />
            </DialogPrimitive.Close>
          ) : null}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </StackedDialogVariantContext.Provider>
  );
}

export type StackedDialogHeaderProps = ComponentProps<"div">;

export function StackedDialogHeader({
  className,
  ...props
}: StackedDialogHeaderProps) {
  return (
    <div
      data-slot="stacked-dialog-header"
      className={cn("flex flex-col gap-1 pr-8", className)}
      {...props}
    />
  );
}

export type StackedDialogTitleProps = DialogPrimitive.Title.Props;

export function StackedDialogTitle({
  className,
  ...props
}: StackedDialogTitleProps) {
  const variant = useContext(StackedDialogVariantContext);
  return (
    <DialogPrimitive.Title
      data-slot="stacked-dialog-title"
      className={cn(
        "text-base font-semibold leading-none tracking-tight text-foreground",
        variant === "danger" && "text-destructive",
        className,
      )}
      {...props}
    />
  );
}

export type StackedDialogDescriptionProps = DialogPrimitive.Description.Props;

export function StackedDialogDescription({
  className,
  ...props
}: StackedDialogDescriptionProps) {
  return (
    <DialogPrimitive.Description
      data-slot="stacked-dialog-description"
      className={cn("text-sm leading-relaxed text-muted-foreground", className)}
      {...props}
    />
  );
}

export type StackedDialogFooterProps = ComponentProps<"div">;

export function StackedDialogFooter({
  className,
  ...props
}: StackedDialogFooterProps) {
  return (
    <div
      data-slot="stacked-dialog-footer"
      className={cn("mt-4 flex items-center justify-end gap-2", className)}
      {...props}
    />
  );
}
