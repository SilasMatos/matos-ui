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
import { Elevated } from "@/registry/new-york-v4/ui/elevated";

/**
 * Surface rung, deliberately *below* the conventional dialog offset of 4.
 *
 * A command palette is read as a dark slab you type into, not as a lit panel
 * floating over the page. The dark ladder climbs in lightness, so offset 4
 * lands this at surface-5 (L* 28.9) — against the `bg-popover` it replaced
 * (#171717, L* 7.7) that is nearly four times brighter, and the palette stops
 * reading as a palette. Offset 1 puts it on surface-2 (L* 14.2): the darkest
 * rung that still separates cleanly from the page floor (L* 5.8) underneath.
 *
 * The two dialogs that *are* lit panels — stacked-dialog, sheet-panel — keep
 * offset 4. This is a deliberate exception for one component, not a change to
 * the convention.
 */
const COMMAND_DIALOG_OFFSET = 1;

/**
 * Shadow weight, pinned apart from the fill. The palette sits dark, but it
 * still floats a dialog's distance off the page, so it should cast a dialog's
 * drop rather than the thin surface-2 ring its fill would otherwise imply.
 */
const COMMAND_DIALOG_SHADOW = 5;

/**
 * Motion tier, also pinned apart from the fill. `motionForOffset` reads
 * distance, and this thing still *travels* like a dialog even though it is
 * coloured like a slab — driving the tier off the surface offset above would
 * hand a full-screen modal the 80ms toggle spring.
 */
const commandDialogMotion = motionForOffset(4);

/**
 * The results panel and the search field, both one step above the dialog they
 * sit in. Same rung on purpose: they are the two halves of one content layer,
 * and the dialog chrome showing through between them is what gives the palette
 * its two-tone read.
 */
const COMMAND_PANEL_OFFSET = 1;
const COMMAND_INPUT_OFFSET = 1;

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
    "--motion-duration": `${commandDialogMotion.visualDuration}s`,
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
            // No border, no bg, no shadow of its own: <Elevated> supplies all
            // three from the ladder, and the 1px ring inside --shadow-N *is*
            // the border. The `before:bg-muted/72` tint this used to carry is
            // gone too — the two-tone read between the input row and the
            // results panel is now the ladder doing its job (5 under 6),
            // rather than a hand-picked overlay that only matched one theme.
            "-translate-y-[calc(1.25rem*var(--nested-dialogs))] relative row-start-2 flex max-h-105 min-h-0 w-full min-w-0 max-w-xl scale-[calc(1-0.1*var(--nested-dialogs))] flex-col rounded-2xl text-foreground opacity-[calc(1-0.1*var(--nested-dialogs))] outline-none transition-[scale,opacity,translate] duration-[var(--motion-duration)] data-ending-style:duration-[var(--motion-exit-duration)] motion-reduce:transition-none will-change-transform data-nested:data-ending-style:translate-y-8 data-nested:data-starting-style:translate-y-8 data-nested-dialog-open:origin-top data-ending-style:scale-98 data-starting-style:scale-98 data-ending-style:opacity-0 data-starting-style:opacity-0 **:data-[slot=scroll-area-viewport]:data-has-overflow-y:pe-1",
            className,
          )}
          data-slot="command-dialog-popup"
          style={motionStyle}
          onTransitionEnd={handleTransitionEnd}
          render={(popupProps) => (
            <Elevated
              offset={COMMAND_DIALOG_OFFSET}
              shadowLevel={COMMAND_DIALOG_SHADOW}
              {...popupProps}
            />
          )}
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
      {/* The field's fill and edge come from the ladder, so the inner <Input>
          is forced transparent and borderless: two surfaces stacked on the
          same box would double the ring.

          Any leading icon belongs on AutocompleteInput's `startAddon`, not on
          an absolutely-positioned sibling: the addon is `inset-y-0` inside the
          input's own wrapper, so it centres on the input itself rather than on
          whatever padding box a caller happens to wrap around it. */}
      <Elevated offset={COMMAND_INPUT_OFFSET} className="rounded-xl">
        <AutocompleteInput
          autoFocus
          className={cn(
            "border-transparent! bg-transparent! shadow-none before:hidden has-focus-visible:ring-0",
            className,
          )}
          placeholder={placeholder}
          {...props}
        />
      </Elevated>
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
    <Elevated
      offset={COMMAND_PANEL_OFFSET}
      data-slot="command-panel"
      // The negative margins and clip-path insets this used to carry existed
      // only to hide the seam where its border met the popup's. With neither
      // element drawing a border, the panel can simply sit inside the popup.
      className={cn(
        // The scroll chain has to be spelled out end to end. Base UI's
        // ScrollArea viewport is `size-full`, so it only becomes a scroller
        // once its Root has a *resolved* height — and Root only resolves if
        // every ancestor between it and the popup's `max-h` is a flex item
        // allowed to shrink. `flex-col` + `min-h-0` here, `min-h-0` on the
        // Root below. No `flex-1`: the panel still hugs a short result list
        // instead of stretching to the full 105.
        "relative flex min-h-0 flex-col overflow-hidden rounded-t-xl not-has-[+[data-slot=command-footer]]:rounded-b-2xl",
        "[&_[data-slot=scroll-area]]:min-h-0 **:data-[slot=scroll-area-scrollbar]:mt-2",
        className,
      )}
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
