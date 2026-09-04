"use client";

import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import type * as React from "react";
import {
  type CSSProperties,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { cn } from "@/lib/utils";
import {
  motionForOffset,
  useExitAnimation,
} from "@/registry/new-york-v4/lib/motion-tokens";

const popoverMotion = motionForOffset(2);

type PopoverMotionContextValue = {
  open: boolean;
};

const PopoverMotionContext = createContext<PopoverMotionContextValue | null>(
  null,
);

function usePopoverMotionContext() {
  return useContext(PopoverMotionContext) ?? { open: true };
}

function getMotionStyle(style?: CSSProperties): CSSProperties {
  return {
    "--motion-duration": `${popoverMotion.visualDuration}s`,
    "--motion-exit-duration": `${popoverMotion.exit.duration}s`,
    ...style,
  } as CSSProperties;
}

function Popover({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  ...props
}: PopoverPrimitive.Root.Props) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = openProp ?? uncontrolledOpen;
  const contextValue = useMemo(() => ({ open }), [open]);

  const handleOpenChange = useCallback<
    NonNullable<PopoverPrimitive.Root.Props["onOpenChange"]>
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
    <PopoverMotionContext.Provider value={contextValue}>
      <PopoverPrimitive.Root
        data-slot="popover"
        open={open}
        onOpenChange={handleOpenChange}
        {...props}
      />
    </PopoverMotionContext.Provider>
  );
}

function PopoverTrigger({ ...props }: PopoverPrimitive.Trigger.Props) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverContent({
  className,
  align = "center",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  style,
  onTransitionEnd,
  ...props
}: PopoverPrimitive.Popup.Props &
  Pick<
    PopoverPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  >) {
  const { open } = usePopoverMotionContext();
  const { mounted, onAnimationComplete } = useExitAnimation(
    open,
    popoverMotion,
  );
  const motionStyle = useMemo(() => getMotionStyle(style), [style]);
  const handleTransitionEnd = useCallback<
    React.TransitionEventHandler<HTMLDivElement>
  >(
    (event) => {
      onTransitionEnd?.(
        event as Parameters<
          NonNullable<PopoverPrimitive.Popup.Props["onTransitionEnd"]>
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
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50"
      >
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(
            "bg-popover text-popover-foreground data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 flex flex-col gap-2.5 rounded-lg p-2.5 text-sm shadow-md ring-1 duration-[var(--motion-duration)] data-ending-style:duration-[var(--motion-exit-duration)] motion-reduce:transition-none data-[side=inline-start]:slide-in-from-right-2 data-[side=inline-end]:slide-in-from-left-2 z-50 w-72 origin-(--transform-origin) outline-hidden",
            className,
          )}
          style={motionStyle}
          onTransitionEnd={handleTransitionEnd}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}

function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popover-header"
      className={cn("flex flex-col gap-0.5 text-sm", className)}
      {...props}
    />
  );
}

function PopoverTitle({ className, ...props }: PopoverPrimitive.Title.Props) {
  return (
    <PopoverPrimitive.Title
      data-slot="popover-title"
      className={cn("font-medium", className)}
      {...props}
    />
  );
}

function PopoverDescription({
  className,
  ...props
}: PopoverPrimitive.Description.Props) {
  return (
    <PopoverPrimitive.Description
      data-slot="popover-description"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
};
