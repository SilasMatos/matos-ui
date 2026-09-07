"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Copy, Eye, EyeOff } from "lucide-react";
import type { ComponentProps, MouseEvent, ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

import {
  duration,
  ease,
  spring,
} from "@/registry/new-york-v4/lib/motion-tokens";

/**
 * Writes to the clipboard and holds a `copied` flag for `timeout` ms. Returns
 * `false` when the write fails (insecure context, denied permission) so the UI
 * can stay in its resting state instead of lying about success.
 */
function useClipboard(timeout = 2000) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), timeout);
        return true;
      } catch {
        setCopied(false);
        return false;
      }
    },
    [timeout],
  );

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return { copied, copy };
}

export const copyButtonVariants = tv({
  base: [
    "hover-lift [--lift:1px] inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md font-medium",
    "text-muted-foreground outline-none hover:bg-muted hover:text-foreground",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "active:scale-[0.96] motion-reduce:active:scale-100",
    "disabled:pointer-events-none disabled:opacity-50",
    "data-[copied]:text-primary data-[copied]:hover:text-primary",
  ],
  variants: {
    size: {
      sm: "h-7 min-w-7 px-1.5 text-xs [&_svg]:size-3.5",
      md: "h-8 min-w-8 px-2 text-sm [&_svg]:size-4",
      lg: "h-9 min-w-9 px-2.5 text-sm [&_svg]:size-4",
    },
  },
  defaultVariants: { size: "md" },
});

export type CopyButtonProps = Omit<
  ComponentProps<"button">,
  "value" | "children" | "onCopy"
> &
  VariantProps<typeof copyButtonVariants> & {
    /** The string written to the clipboard. */
    value: string;
    /** How long the copied state shows, in ms. */
    timeout?: number;
    /** Fires after a successful copy. */
    onCopy?: (value: string) => void;
    /** Optional text beside the icon; swaps to "Copied" while active. */
    label?: ReactNode;
  };

/**
 * Copy a value to the clipboard. Icon-only by default; pass `label` for a
 * labelled button.
 *
 * The clipboard glyph swaps to a check on `spring.playful` — the tier the
 * system keeps for a small thing that went right — and reverts on `spring.fast`
 * after `timeout`. A visually-hidden live region announces the result. Under
 * `prefers-reduced-motion` the swap is a plain crossfade.
 */
export function CopyButton({
  className,
  size,
  value,
  timeout = 2000,
  onCopy,
  label,
  onClick,
  "aria-label": ariaLabel,
  ...props
}: CopyButtonProps) {
  const reduce = useReducedMotion();
  const { copied, copy } = useClipboard(timeout);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    void copy(value).then((ok) => {
      if (ok) onCopy?.(value);
    });
  };

  return (
    <button
      type="button"
      data-slot="copy-button"
      data-copied={copied || undefined}
      aria-label={ariaLabel ?? (copied ? "Copied" : "Copy")}
      onClick={handleClick}
      className={twMerge(copyButtonVariants({ size }), className)}
      {...props}
    >
      <span className="relative grid shrink-0 place-items-center">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={copied ? "check" : "copy"}
            className="col-start-1 row-start-1 flex"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.4 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.4 }}
            transition={
              reduce
                ? { duration: duration.fast }
                : copied
                  ? spring.playful
                  : spring.fast
            }
          >
            {copied ? <Check /> : <Copy />}
          </motion.span>
        </AnimatePresence>
      </span>

      {label != null ? (
        <span className="relative grid overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={copied ? "done" : "idle"}
              className="col-start-1 row-start-1 whitespace-nowrap"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
              transition={reduce ? { duration: duration.fast } : spring.fast}
            >
              {copied ? "Copied" : label}
            </motion.span>
          </AnimatePresence>
        </span>
      ) : null}

      <span aria-live="polite" className="sr-only">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </button>
  );
}

function maskValue(value: string, keep: number) {
  if (value.length <= keep) return "•".repeat(Math.max(value.length, 3));
  const dots = Math.min(8, Math.max(1, value.length - keep));
  return "•".repeat(dots) + value.slice(-keep);
}

export const copyFieldVariants = tv({
  base: [
    "inline-flex items-center gap-1 rounded-lg border border-input bg-transparent pl-3",
    "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
  ],
  variants: {
    size: {
      sm: "h-8 pr-1 text-xs",
      md: "h-9 pr-1 text-sm",
    },
  },
  defaultVariants: { size: "md" },
});

export type CopyFieldProps = Omit<
  ComponentProps<"div">,
  "children" | "onCopy"
> &
  VariantProps<typeof copyFieldVariants> & {
    /** The full value — copied whole even while masked. */
    value: string;
    /** Mask the value and show a reveal toggle. For keys, tokens, secrets. */
    secret?: boolean;
    /** Trailing characters left visible while masked. */
    revealChars?: number;
    timeout?: number;
    onCopy?: (value: string) => void;
  };

/**
 * A read-only value with a copy affordance — the shape an API key, resource id
 * or webhook URL takes in a settings page. `secret` masks it behind dots with a
 * reveal toggle; copy always takes the whole value.
 *
 * Flush on its substrate (a 1px border, no fill) like the input it mirrors.
 */
export function CopyField({
  className,
  size = "md",
  value,
  secret = false,
  revealChars = 4,
  timeout,
  onCopy,
  ...props
}: CopyFieldProps) {
  const reduce = useReducedMotion();
  const [revealed, setRevealed] = useState(!secret);
  const shown = secret && !revealed ? maskValue(value, revealChars) : value;

  return (
    <div
      data-slot="copy-field"
      className={twMerge(copyFieldVariants({ size }), className)}
      {...props}
    >
      <span className="relative grid min-w-0 flex-1 overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={revealed ? "clear" : "masked"}
            className="col-start-1 row-start-1 block truncate font-mono text-foreground tabular-nums"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration.fast, ease: ease.standard }}
          >
            {shown}
          </motion.span>
        </AnimatePresence>
      </span>

      {secret ? (
        <button
          type="button"
          onClick={() => setRevealed((v) => !v)}
          aria-label={revealed ? "Hide value" : "Reveal value"}
          aria-pressed={revealed}
          className={twMerge(
            "hover-lift [--lift:1px] grid size-7 shrink-0 place-items-center rounded-md",
            "text-muted-foreground outline-none hover:bg-muted hover:text-foreground",
            "focus-visible:ring-2 focus-visible:ring-ring",
            "active:scale-[0.96] motion-reduce:active:scale-100 [&_svg]:size-3.5",
          )}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={revealed ? "off" : "on"}
              className="col-start-1 row-start-1 flex"
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
              transition={reduce ? { duration: duration.fast } : spring.fast}
            >
              {revealed ? <EyeOff /> : <Eye />}
            </motion.span>
          </AnimatePresence>
        </button>
      ) : null}

      <CopyButton
        value={value}
        size="sm"
        timeout={timeout}
        onCopy={onCopy}
        aria-label="Copy value"
      />
    </div>
  );
}
