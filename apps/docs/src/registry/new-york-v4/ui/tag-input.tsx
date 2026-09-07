"use client";

import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { cva, type VariantProps } from "class-variance-authority";
import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useReducedMotion,
} from "framer-motion";
import { Check, Plus, X } from "lucide-react";
import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import { useCallback, useId, useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import {
  attentionShake,
  motionForOffset,
  pressable,
  spring,
  useExitAnimation,
} from "@/registry/new-york-v4/lib/motion-tokens";
import { surfaceClasses } from "@/registry/new-york-v4/lib/surface-classes";
import { useSurface } from "@/registry/new-york-v4/lib/surface-context";
import {
  Field,
  FieldLabel,
  FieldMessage,
} from "@/registry/new-york-v4/ui/field";

const tagInputMotion = motionForOffset(2);

function getMotionStyle(): CSSProperties {
  return {
    "--motion-duration": `${tagInputMotion.visualDuration}s`,
    "--motion-exit-duration": `${tagInputMotion.exit.duration}s`,
  } as CSSProperties;
}

export const tagInputFieldVariants = cva(
  [
    "not-prose flex w-full flex-wrap items-center gap-1.5 rounded-xl border border-border bg-background px-2 py-1.5 text-sm shadow-xs",
    "transition-[background-color,border-color,box-shadow]",
    "focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/25",
    "data-[invalid=true]:border-destructive data-[invalid=true]:bg-destructive/10 data-[invalid=true]:focus-within:ring-destructive/20",
    "has-[input:disabled]:pointer-events-none has-[input:disabled]:bg-muted/40 has-[input:disabled]:opacity-60",
  ],
  {
    variants: {
      size: {
        sm: "min-h-8 rounded-lg text-xs",
        md: "min-h-9",
        lg: "min-h-10",
      },
    },
    defaultVariants: { size: "md" },
  },
);

const popupClass = cn(
  "not-prose min-w-(--anchor-width) max-w-(--available-width) overflow-hidden rounded-xl p-1 text-sm outline-none",
  "origin-(--transform-origin) transition-[opacity,transform] duration-[var(--motion-duration)] will-change-[opacity,transform]",
  "data-starting-style:translate-y-[-6px] data-starting-style:scale-[0.975] data-starting-style:opacity-0",
  "data-ending-style:translate-y-[-3px] data-ending-style:scale-[0.99] data-ending-style:opacity-0 data-ending-style:duration-[var(--motion-exit-duration)]",
);

const itemClass = cn(
  "flex cursor-default items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-foreground outline-none",
  "transition-colors data-highlighted:bg-muted/70 data-disabled:pointer-events-none data-disabled:opacity-45",
);

type Suggestion = { value: string; label?: ReactNode };

export type TagInputProps = VariantProps<typeof tagInputFieldVariants> & {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (tags: string[]) => void;
  /** Options to autocomplete against. Omit for a pure free-entry field. */
  suggestions?: Array<string | Suggestion>;
  /** Let the reader add a tag that isn't a suggestion. */
  creatable?: boolean;
  /** Cap the number of tags. */
  max?: number;
  allowDuplicates?: boolean;
  /** Split pasted / typed text into several tags. */
  delimiter?: RegExp;
  /** Return `false` or a message to reject a tag. */
  validate?: (tag: string) => boolean | string;
  placeholder?: string;
  disabled?: boolean;
  name?: string;
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  className?: string;
  id?: string;
};

/**
 * A multi-value input: type a tag and press Enter (or pick a suggestion), and
 * it becomes a chip. `@base-ui/react/combobox` with `multiple` carries the
 * keyboard and ARIA — typeahead, arrows through the list, `Backspace` to remove
 * the last chip, `Esc` to close. This component adds the surface styling,
 * free-entry, paste-splitting, `max` / `validate`, and the chip motion.
 *
 * Chips add on `spring.fast` and reflow their neighbours with `layout`; the
 * popup rides `surfaceClasses(useSurface() + 2)`. `prefers-reduced-motion`
 * drops the scale, keeps the fade.
 */
export function TagInput({
  size,
  value: valueProp,
  defaultValue = [],
  onValueChange,
  suggestions,
  creatable = true,
  max,
  allowDuplicates = false,
  delimiter = /[,\n\t]/,
  validate,
  placeholder = "Add a tag…",
  disabled = false,
  name,
  label,
  description,
  error,
  required = false,
  className,
  id: idProp,
}: TagInputProps) {
  const reduce = useReducedMotion();
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const popupLevel = Math.min(useSurface() + 2, 8);
  const shake = useAnimationControls();

  const isControlled = valueProp !== undefined;
  const [internal, setInternal] = useState<string[]>(defaultValue);
  const value = isControlled ? (valueProp ?? []) : internal;

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const items = useMemo<Suggestion[]>(
    () =>
      (suggestions ?? []).map((s) =>
        typeof s === "string" ? { value: s } : s,
      ),
    [suggestions],
  );
  const hasPopup = items.length > 0 || (creatable && query.trim().length > 0);

  const { mounted, onAnimationComplete } = useExitAnimation(
    open && hasPopup,
    tagInputMotion,
  );
  const motionStyle = useMemo(() => getMotionStyle(), []);

  const commit = useCallback(
    (next: string[]) => {
      if (!isControlled) setInternal(next);
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  const addTags = useCallback(
    (raw: string) => {
      const parts = raw
        .split(delimiter)
        .map((part) => part.trim())
        .filter(Boolean);
      if (!parts.length) return;

      const next = [...value];
      for (const tag of parts) {
        if (max !== undefined && next.length >= max) break;
        if (!allowDuplicates && next.includes(tag)) continue;
        const check = validate?.(tag);
        if (check === false || typeof check === "string") {
          setFeedback(
            typeof check === "string" ? check : "That tag isn't allowed.",
          );
          if (!reduce) shake.start(attentionShake.shake);
          continue;
        }
        next.push(tag);
      }
      if (next.length !== value.length) {
        commit(next);
        setFeedback(null);
      }
      setQuery("");
    },
    [allowDuplicates, commit, delimiter, max, reduce, shake, validate, value],
  );

  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.defaultPrevented) return;
    const highlighting = Boolean(
      event.currentTarget.getAttribute("aria-activedescendant"),
    );
    if ((event.key === "Enter" || event.key === "Tab") && !highlighting) {
      if (!query.trim()) return;
      if (!creatable) return;
      event.preventDefault();
      addTags(query);
    }
  };

  const invalid = Boolean(error) || Boolean(feedback);
  const messageId =
    error || feedback || description ? `${id}-message` : undefined;
  const atMax = max !== undefined && value.length >= max;

  const filtered = items.filter(
    (item) =>
      !value.includes(item.value) &&
      item.value.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
  );
  const canCreate =
    creatable &&
    query.trim().length > 0 &&
    !value.includes(query.trim()) &&
    !items.some((item) => item.value === query.trim()) &&
    !atMax;

  return (
    <Field
      data-slot="tag-input"
      className={className}
      style={motionStyle}
      invalid={invalid}
      disabled={disabled}
    >
      {label ? (
        <FieldLabel htmlFor={id} required={required}>
          {label}
        </FieldLabel>
      ) : null}

      <ComboboxPrimitive.Root
        multiple
        items={items.map((item) => item.value)}
        value={value}
        onValueChange={(next: string[]) => {
          commit(next);
          setQuery("");
        }}
        inputValue={query}
        onInputValueChange={setQuery}
        open={open && hasPopup}
        onOpenChange={setOpen}
        disabled={disabled}
      >
        <ComboboxPrimitive.Chips
          className={tagInputFieldVariants({ size })}
          data-invalid={invalid || undefined}
          render={<motion.div animate={shake} />}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {value.map((tag) => (
              <ComboboxPrimitive.Chip
                key={tag}
                aria-label={tag}
                render={
                  <motion.span
                    layout={!reduce}
                    initial={
                      reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8 }
                    }
                    animate={{ opacity: 1, scale: 1 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
                    transition={reduce ? { duration: 0.12 } : spring.fast}
                  />
                }
                className="inline-flex items-center gap-1 rounded-md border border-transparent bg-muted py-0.5 pr-0.5 pl-2 font-medium text-muted-foreground text-xs data-highlighted:bg-muted data-highlighted:ring-2 data-highlighted:ring-ring"
              >
                <span className="truncate">{tag}</span>
                <ComboboxPrimitive.ChipRemove
                  aria-label={`Remove ${tag}`}
                  render={
                    <motion.button
                      type="button"
                      {...pressable({ press: 0.8, lift: 0, reduced: !!reduce })}
                    />
                  }
                  className="grid size-4 shrink-0 place-items-center rounded-sm text-muted-foreground outline-none hover:bg-foreground/10 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-3"
                >
                  <X aria-hidden="true" />
                </ComboboxPrimitive.ChipRemove>
              </ComboboxPrimitive.Chip>
            ))}
          </AnimatePresence>

          <ComboboxPrimitive.Input
            id={id}
            aria-describedby={messageId}
            placeholder={atMax ? "" : value.length ? "" : placeholder}
            disabled={disabled || atMax}
            onKeyDown={onInputKeyDown}
            className="h-6 min-w-[6ch] flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
          />
        </ComboboxPrimitive.Chips>

        {mounted ? (
          <ComboboxPrimitive.Portal>
            <ComboboxPrimitive.Positioner
              sideOffset={6}
              align="start"
              className="z-50 outline-none"
            >
              <ComboboxPrimitive.Popup
                data-slot="tag-input-popup"
                data-surface={popupLevel}
                className={cn(popupClass, surfaceClasses(popupLevel))}
                style={motionStyle}
                onTransitionEnd={(event) => {
                  if (event.currentTarget === event.target) {
                    onAnimationComplete();
                  }
                }}
              >
                <ComboboxPrimitive.List className="max-h-64 overflow-y-auto">
                  {canCreate ? (
                    <button
                      type="button"
                      className={cn(itemClass, "w-full text-left")}
                      onClick={() => addTags(query)}
                    >
                      <Plus
                        className="size-3.5 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <span>
                        Create{" "}
                        <span className="font-medium">“{query.trim()}”</span>
                      </span>
                    </button>
                  ) : null}
                  {filtered.map((item) => (
                    <ComboboxPrimitive.Item
                      key={item.value}
                      value={item.value}
                      className={itemClass}
                    >
                      <span className="min-w-0 flex-1 truncate">
                        {item.label ?? item.value}
                      </span>
                      <ComboboxPrimitive.ItemIndicator className="text-foreground">
                        <Check className="size-3.5" aria-hidden="true" />
                      </ComboboxPrimitive.ItemIndicator>
                    </ComboboxPrimitive.Item>
                  ))}
                  {!canCreate && filtered.length === 0 ? (
                    <p className="px-2.5 py-3 text-center text-muted-foreground text-xs">
                      No matches.
                    </p>
                  ) : null}
                </ComboboxPrimitive.List>
              </ComboboxPrimitive.Popup>
            </ComboboxPrimitive.Positioner>
          </ComboboxPrimitive.Portal>
        ) : null}
      </ComboboxPrimitive.Root>

      {name
        ? value.map((tag) => (
            <input key={tag} type="hidden" name={name} value={tag} />
          ))
        : null}

      {error || feedback || description ? (
        <FieldMessage id={messageId}>
          {error ?? feedback ?? description}
        </FieldMessage>
      ) : null}
    </Field>
  );
}
