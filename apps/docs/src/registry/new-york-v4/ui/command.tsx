"use client";

import { Dialog as CommandDialogPrimitive } from "@base-ui/react/dialog";
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
import {
  Autocomplete,
  AutocompleteCollection,
  AutocompleteEmpty,
  AutocompleteGroup,
  AutocompleteGroupLabel,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompleteSeparator,
} from "@/registry/new-york-v4/ui/auto-complete";

const commandDialogMotion = motionForOffset(4);

type CommandDialogMotionContextValue = {
  open: boolean;
};

const CommandDialogMotionContext =
  createContext<CommandDialogMotionContextValue | null>(null);

function useCommandDialogMotionContext() {
  return useContext(CommandDialogMotionContext) ?? { open: true };
}

function getMotionStyle(style?: CSSProperties): CSSProperties {
  return {
    "--motion-duration": `${commandDialogMotion.duration}s`,
    "--motion-exit-duration": `${commandDialogMotion.exit.duration}s`,
    ...style,
  } as CSSProperties;
}

function CommandDialog({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  ...props
}: CommandDialogPrimitive.Root.Props) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = openProp ?? uncontrolledOpen;
  const contextValue = useMemo(() => ({ open }), [open]);

  const handleOpenChange = useCallback<
    NonNullable<CommandDialogPrimitive.Root.Props["onOpenChange"]>
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
    <CommandDialogMotionContext.Provider value={contextValue}>
      <CommandDialogPrimitive.Root
        open={open}
        onOpenChange={handleOpenChange}
        {...props}
      />
    </CommandDialogMotionContext.Provider>
  );
}

const CommandDialogPortal = CommandDialogPrimitive.Portal;

const CommandCreateHandle = CommandDialogPrimitive.createHandle;

function CommandDialogTrigger(props: CommandDialogPrimitive.Trigger.Props) {
  return (
    <CommandDialogPrimitive.Trigger
      data-slot="command-dialog-trigger"
      {...props}
    />
  );
}

function CommandDialogBackdrop({
  className,
  style,
  ...props
}: CommandDialogPrimitive.Backdrop.Props) {
  const motionStyle = useMemo(() => getMotionStyle(style), [style]);

  return (
    <CommandDialogPrimitive.Backdrop
      className={cn(
        "fixed inset-0 z-50 bg-black/32 backdrop-blur-sm transition-all duration-[var(--motion-duration)] data-ending-style:duration-[var(--motion-exit-duration)] data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none",
        className,
      )}
      data-slot="command-dialog-backdrop"
      style={motionStyle}
      {...props}
    />
  );
}

function CommandDialogViewport({
  className,
  ...props
}: CommandDialogPrimitive.Viewport.Props) {
  return (
    <CommandDialogPrimitive.Viewport
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center px-4 py-[max(--spacing(4),4vh)] sm:py-[10vh]",
        className,
      )}
      data-slot="command-dialog-viewport"
      {...props}
    />
  );
}

function CommandDialogPopup({
  className,
  children,
  style,
  onTransitionEnd,
  ...props
}: CommandDialogPrimitive.Popup.Props) {
  const { open } = useCommandDialogMotionContext();
  const { mounted, onAnimationComplete } = useExitAnimation(
    open,
    commandDialogMotion,
  );
  const motionStyle = useMemo(() => getMotionStyle(style), [style]);
  const handleTransitionEnd = useCallback<
    React.TransitionEventHandler<HTMLDivElement>
  >(
    (event) => {
      onTransitionEnd?.(
        event as Parameters<
          NonNullable<CommandDialogPrimitive.Popup.Props["onTransitionEnd"]>
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
    <CommandDialogPortal>
      <CommandDialogBackdrop />
      <CommandDialogViewport>
        <CommandDialogPrimitive.Popup
          className={cn(
            "-translate-y-[calc(1.25rem*var(--nested-dialogs))] relative row-start-2 flex max-h-105 min-h-0 w-full min-w-0 max-w-xl scale-[calc(1-0.1*var(--nested-dialogs))] flex-col rounded-2xl border bg-popover not-dark:bg-clip-padding text-popover-foreground opacity-[calc(1-0.1*var(--nested-dialogs))] shadow-lg/5 outline-none transition-[scale,opacity,translate] duration-[var(--motion-duration)] data-ending-style:duration-[var(--motion-exit-duration)] motion-reduce:transition-none will-change-transform before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-2xl)-1px)] before:bg-muted/72 before:shadow-[0_1px_--theme(--color-black/4%)] data-nested:data-ending-style:translate-y-8 data-nested:data-starting-style:translate-y-8 data-nested-dialog-open:origin-top data-ending-style:scale-98 data-starting-style:scale-98 data-ending-style:opacity-0 data-starting-style:opacity-0 **:data-[slot=scroll-area-viewport]:data-has-overflow-y:pe-1 dark:before:shadow-[0_-1px_--theme(--color-white/6%)]",
            className,
          )}
          data-slot="command-dialog-popup"
          style={motionStyle}
          onTransitionEnd={handleTransitionEnd}
          {...props}
        >
          {children}
        </CommandDialogPrimitive.Popup>
      </CommandDialogViewport>
    </CommandDialogPortal>
  );
}

function Command({
  autoHighlight = "always",
  keepHighlight = true,
  ...props
}: React.ComponentProps<typeof Autocomplete>) {
  return (
    <Autocomplete
      autoHighlight={autoHighlight}
      inline
      keepHighlight={keepHighlight}
      open
      {...props}
    />
  );
}

function CommandInput({
  className,
  placeholder = undefined,
  ...props
}: React.ComponentProps<typeof AutocompleteInput>) {
  return (
    <div className="px-2.5 py-1.5">
      <AutocompleteInput
        autoFocus
        className={cn(
          "border-transparent! bg-transparent! shadow-none before:hidden has-focus-visible:ring-0",
          className,
        )}
        placeholder={placeholder}
        {...props}
      />
    </div>
  );
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof AutocompleteList>) {
  return (
    <AutocompleteList
      className={cn("not-empty:scroll-py-2 not-empty:p-2", className)}
      data-slot="command-list"
      {...props}
    />
  );
}

function CommandEmpty({
  className,
  ...props
}: React.ComponentProps<typeof AutocompleteEmpty>) {
  return (
    <AutocompleteEmpty
      className={cn("not-empty:py-6", className)}
      data-slot="command-empty"
      {...props}
    />
  );
}

function CommandPanel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className="-mx-px not-has-[+[data-slot=command-footer]]:-mb-px relative min-h-0 rounded-t-xl not-has-[+[data-slot=command-footer]]:rounded-b-2xl border border-b-0 bg-popover bg-clip-padding shadow-xs/5 [clip-path:inset(0_1px)] not-has-[+[data-slot=command-footer]]:[clip-path:inset(0_1px_1px_1px_round_0_0_calc(var(--radius-2xl)-1px)_calc(var(--radius-2xl)-1px))] before:pointer-events-none before:absolute before:inset-0 before:rounded-t-[calc(var(--radius-xl)-1px)] **:data-[slot=scroll-area-scrollbar]:mt-2"
      {...props}
    />
  );
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof AutocompleteGroup>) {
  return (
    <AutocompleteGroup
      className={className}
      data-slot="command-group"
      {...props}
    />
  );
}

function CommandGroupLabel({
  className,
  ...props
}: React.ComponentProps<typeof AutocompleteGroupLabel>) {
  return (
    <AutocompleteGroupLabel
      className={className}
      data-slot="command-group-label"
      {...props}
    />
  );
}

function CommandCollection({
  ...props
}: React.ComponentProps<typeof AutocompleteCollection>) {
  return <AutocompleteCollection data-slot="command-collection" {...props} />;
}

function CommandItem({
  className,
  ...props
}: React.ComponentProps<typeof AutocompleteItem>) {
  return (
    <AutocompleteItem
      className={cn("py-1.5", className)}
      data-slot="command-item"
      {...props}
    />
  );
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof AutocompleteSeparator>) {
  return (
    <AutocompleteSeparator
      className={cn("my-2", className)}
      data-slot="command-separator"
      {...props}
    />
  );
}

function CommandShortcut({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      className={cn(
        "ms-auto font-medium font-sans text-muted-foreground/72 text-xs tracking-widest",
        className,
      )}
      data-slot="command-shortcut"
      {...props}
    />
  );
}

function CommandFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 rounded-b-[calc(var(--radius-2xl)-1px)] border-t px-5 py-3 text-muted-foreground text-xs",
        className,
      )}
      data-slot="command-footer"
      {...props}
    />
  );
}

export {
  CommandCreateHandle,
  Command,
  CommandCollection,
  CommandDialog,
  CommandDialogPopup,
  CommandDialogTrigger,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList,
  CommandPanel,
  CommandSeparator,
  CommandShortcut,
  CommandDialogPrimitive,
};
