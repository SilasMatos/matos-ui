"use client";

import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useReducedMotion,
} from "framer-motion";
import { Check, X } from "lucide-react";
import type {
  FocusEvent as ReactFocusEvent,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
} from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { tv, type VariantProps } from "tailwind-variants";

import { cn } from "@/lib/utils";
import {
  attentionShake,
  duration,
  ease,
  spring,
} from "@/registry/new-york-v4/lib/motion-tokens";
import { surfaceClasses } from "@/registry/new-york-v4/lib/surface-classes";
import {
  SurfaceProvider,
  useSurface,
} from "@/registry/new-york-v4/lib/surface-context";

type Size = "sm" | "md" | "lg";

/**
 * The chrome that morphs: at rest the box is flush with its substrate — no fill,
 * no ring — and reads as plain text. Entering edit it climbs one rung, grows its
 * padding, rounds its corners and draws a border. All of it on `spring.morph`,
 * the shape tier, deliberately small — the same tier a bento uses across
 * hundreds of pixels, shown here across a handful.
 */
export const editInPlaceVariants = tv({
  base: [
    "inline-flex items-center border outline-none",
    "transition-[background-color,border-color,box-shadow,color]",
  ],
  variants: {
    size: {
      sm: "gap-0.5 text-xs",
      md: "gap-1 text-sm",
      lg: "gap-1.5 text-base",
    },
    editing: {
      true: "border-border",
      false: "border-transparent bg-transparent text-foreground shadow-none",
    },
  },
  compoundVariants: [
    { editing: false, size: "sm", class: "px-1 py-0.5" },
    { editing: false, size: "md", class: "px-1.5 py-1" },
    { editing: false, size: "lg", class: "px-2 py-1" },
    { editing: true, size: "sm", class: "px-2 py-1" },
    { editing: true, size: "md", class: "px-2.5 py-1.5" },
    { editing: true, size: "lg", class: "px-3 py-2" },
  ],
  defaultVariants: { size: "md", editing: false },
});

const SIZES: Record<
  Size,
  { key: string; svg: string; radius: { rest: number; edit: number } }
> = {
  sm: { key: "size-5", svg: "[&_svg]:size-3", radius: { rest: 6, edit: 8 } },
  md: { key: "size-6", svg: "[&_svg]:size-3.5", radius: { rest: 8, edit: 12 } },
  lg: { key: "size-7", svg: "[&_svg]:size-4", radius: { rest: 10, edit: 14 } },
};

export type EditInPlaceProps = VariantProps<typeof editInPlaceVariants> & {
  value: string;
  /** Commit — Enter, the ✓ key, or blur (see `submitOnBlur`). */
  onValueChange: (value: string) => void;
  /** Fires on Escape or the ✕ key, after the value is reverted. */
  onCancel?: () => void;
  /** Accessible name for the field, e.g. "Project name". */
  label: string;
  placeholder?: string;
  /** Return a string to reject the commit and show it as an error. */
  validate?: (value: string) => boolean | string;
  /** Commit when focus leaves the field. Default `true`; `false` reverts instead. */
  submitOnBlur?: boolean;
  /** Select the text when editing starts. Default `true`. */
  selectOnEdit?: boolean;
  /** Trim surrounding whitespace on commit. Default `true`. */
  trim?: boolean;
  maxLength?: number;
  disabled?: boolean;
  /** Format the resting display. The editable string is always `value`. */
  renderValue?: (value: string) => ReactNode;
  editing?: boolean;
  defaultEditing?: boolean;
  onEditingChange?: (editing: boolean) => void;
  /** Name for a hidden input, so the committed value posts with a form. */
  name?: string;
  className?: string;
};

/**
 * Text that becomes an input where it sits. One click (or Enter, Space, F2) and
 * the box climbs a rung, grows and rounds; committing drops it back. Elevation
 * *is* the edit state, and the box change is `spring.morph` at small scale.
 *
 * The swap is seamless: an invisible sizer holds the exact text width and the
 * button and input each overlay it, so nothing reflows as they trade places and
 * the caret lands where the text was. The ✓ key winds back before it pops in —
 * `ease.anticipate`, the 12-principles anticipation beat.
 *
 * `prefers-reduced-motion` keeps the crossfade and the colour shift, drops the
 * box scale, the travel and the anticipation dip.
 */
export function EditInPlace({
  value,
  onValueChange,
  onCancel,
  label,
  placeholder = "Empty",
  validate,
  submitOnBlur = true,
  selectOnEdit = true,
  trim = true,
  maxLength,
  disabled = false,
  renderValue,
  size = "md",
  editing: editingProp,
  defaultEditing = false,
  onEditingChange,
  name,
  className,
}: EditInPlaceProps) {
  const reduce = !!useReducedMotion();
  const s = SIZES[size ?? "md"];
  const substrate = useSurface();
  const editLevel = Math.min(substrate + 1, 8);
  const isEditingControlled = editingProp !== undefined;

  const [internalEditing, setInternalEditing] = useState(defaultEditing);
  const editing = isEditingControlled ? editingProp : internalEditing;
  const editingRef = useRef(editing);

  const [draft, setDraft] = useState(value);
  const draftRef = useRef(draft);

  const [error, setError] = useState<string | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const refocusTrigger = useRef(false);
  const shake = useAnimationControls();
  const errorId = useId();

  useEffect(() => {
    editingRef.current = editing;
  }, [editing]);
  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  const setEditing = useCallback(
    (next: boolean) => {
      if (!isEditingControlled) setInternalEditing(next);
      onEditingChange?.(next);
    },
    [isEditingControlled, onEditingChange],
  );

  const startEditing = useCallback(() => {
    if (disabled || editingRef.current) return;
    setDraft(value);
    setError(null);
    setEditing(true);
  }, [disabled, value, setEditing]);

  const cancelEdit = useCallback(() => {
    if (!editingRef.current) return;
    setDraft(value);
    setError(null);
    refocusTrigger.current = true;
    setEditing(false);
    onCancel?.();
  }, [value, setEditing, onCancel]);

  const commit = useCallback(() => {
    if (!editingRef.current) return;
    const next = trim ? draftRef.current.trim() : draftRef.current;
    const verdict = validate?.(next);
    if (typeof verdict === "string") {
      setError(verdict);
      if (!reduce) shake.start(attentionShake.shake);
      return;
    }
    setError(null);
    refocusTrigger.current = true;
    setEditing(false);
    if (next !== value) onValueChange(next);
  }, [trim, validate, reduce, shake, value, onValueChange, setEditing]);

  // Focus + select the input as it opens.
  useEffect(() => {
    if (!editing) return;
    const el = inputRef.current;
    if (!el) return;
    el.focus();
    if (selectOnEdit) el.select();
  }, [editing, selectOnEdit]);

  // Return focus to the trigger when a user action closed the editor.
  useEffect(() => {
    if (editing || !refocusTrigger.current) return;
    refocusTrigger.current = false;
    triggerRef.current?.focus();
  }, [editing]);

  const onInputKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      cancelEdit();
    }
  };

  const onInputBlur = (e: ReactFocusEvent<HTMLInputElement>) => {
    const next = e.relatedTarget as Node | null;
    if (next && rootRef.current?.contains(next)) return;
    if (submitOnBlur) commit();
    else cancelEdit();
  };

  const sizerContent = editing
    ? draft || placeholder || " "
    : value
      ? (renderValue?.(value) ?? value)
      : placeholder || " ";
  const fieldText = "min-w-0 bg-transparent font-medium tracking-[inherit]";

  return (
    <motion.div
      ref={rootRef}
      data-slot="edit-in-place"
      data-editing={editing || undefined}
      animate={shake}
      className={cn(
        "not-prose inline-flex flex-col items-start gap-1",
        className,
      )}
    >
      <SurfaceProvider value={editing ? editLevel : substrate}>
        <motion.div
          layout={!reduce}
          layoutDependency={editing}
          data-slot="edit-in-place-box"
          style={{ borderRadius: editing ? s.radius.edit : s.radius.rest }}
          transition={reduce ? { duration: 0 } : spring.morph}
          className={cn(
            editInPlaceVariants({ size, editing }),
            editing &&
              cn(
                surfaceClasses(editLevel),
                "focus-within:ring-2 focus-within:ring-ring",
              ),
          )}
        >
          <motion.span
            layout={!reduce}
            layoutDependency={editing}
            className="relative grid"
          >
            <span
              aria-hidden="true"
              className={cn(
                "col-start-1 row-start-1 block min-w-[1ch] whitespace-pre px-px",
                fieldText,
                "invisible",
              )}
            >
              {sizerContent}
            </span>

            <AnimatePresence initial={false}>
              {editing ? (
                <motion.input
                  key="input"
                  ref={inputRef}
                  type="text"
                  value={draft}
                  disabled={disabled}
                  maxLength={maxLength}
                  aria-label={label}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? errorId : undefined}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={onInputKeyDown}
                  onBlur={onInputBlur}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={
                    reduce ? { duration: duration.fast } : spring.fast
                  }
                  className={cn(
                    "absolute inset-0 col-start-1 row-start-1 h-full w-full px-px",
                    "text-foreground outline-none placeholder:text-muted-foreground",
                    fieldText,
                  )}
                  placeholder={placeholder}
                />
              ) : (
                <motion.button
                  key="text"
                  ref={triggerRef}
                  type="button"
                  disabled={disabled}
                  aria-label={`Edit ${label}`}
                  onClick={startEditing}
                  onKeyDown={(e) => {
                    if (e.key === "F2") {
                      e.preventDefault();
                      startEditing();
                    }
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={
                    reduce ? { duration: duration.fast } : spring.fast
                  }
                  className={cn(
                    "absolute inset-0 col-start-1 row-start-1 h-full w-full px-px text-left",
                    "rounded-[inherit] outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    "disabled:cursor-not-allowed disabled:opacity-60",
                    fieldText,
                  )}
                >
                  {value ? (
                    renderValue ? (
                      renderValue(value)
                    ) : (
                      value
                    )
                  ) : (
                    <span className="text-muted-foreground">{placeholder}</span>
                  )}
                </motion.button>
              )}
            </AnimatePresence>
          </motion.span>

          <AnimatePresence initial={false} mode="popLayout">
            {editing && (
              <motion.div
                key="keys"
                className={cn(
                  "flex items-center",
                  s.svg,
                  size === "sm" ? "gap-0.5" : "gap-1",
                )}
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
                animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                exit={
                  reduce
                    ? { opacity: 0 }
                    : {
                        opacity: 0,
                        scale: 0.5,
                        transition: { duration: spring.fast.exit.duration },
                      }
                }
                transition={
                  reduce
                    ? { duration: duration.fast }
                    : {
                        duration: duration.moderate,
                        ease: ease.anticipate,
                        delay: 0.14,
                      }
                }
              >
                <button
                  type="button"
                  onClick={commit}
                  onMouseDown={(e) => e.preventDefault()}
                  aria-label={`Save ${label}`}
                  className={cn(
                    "grid shrink-0 place-items-center rounded-md bg-primary text-primary-foreground outline-none",
                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                    "transition-transform active:scale-95 motion-reduce:active:scale-100",
                    s.key,
                  )}
                >
                  <Check aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  onMouseDown={(e) => e.preventDefault()}
                  aria-label={`Cancel editing ${label}`}
                  className={cn(
                    "grid shrink-0 place-items-center rounded-md text-muted-foreground outline-none",
                    "hover:bg-foreground/8 hover:text-foreground",
                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                    "transition-transform active:scale-95 motion-reduce:active:scale-100",
                    s.key,
                  )}
                >
                  <X aria-hidden="true" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {name ? <input type="hidden" name={name} value={value} /> : null}
        </motion.div>
      </SurfaceProvider>

      <AnimatePresence>
        {error ? (
          <motion.p
            key="error"
            id={errorId}
            role="alert"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration.fast }}
            className="text-destructive text-xs"
          >
            {error}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
