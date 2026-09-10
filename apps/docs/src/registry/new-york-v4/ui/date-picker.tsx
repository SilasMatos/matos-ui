"use client";

import { CalendarDays } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useId, useState } from "react";
import { twMerge } from "tailwind-merge";

import {
  formatDate as defaultFormat,
  parseDate as defaultParse,
  isOutsideRange,
  toCalendarDate,
  toISODate,
} from "@/registry/new-york-v4/lib/date";
import { surfaceClasses } from "@/registry/new-york-v4/lib/surface-classes";
import { useSurface } from "@/registry/new-york-v4/lib/surface-context";
import {
  Calendar,
  type CalendarProps,
} from "@/registry/new-york-v4/ui/calendar";
import { Input } from "@/registry/new-york-v4/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/new-york-v4/ui/popover";

export type DatePickerProps = Pick<
  CalendarProps,
  | "min"
  | "max"
  | "isDateDisabled"
  | "weekStartsOn"
  | "locale"
  | "showOutsideDays"
> & {
  value?: Date | null;
  defaultValue?: Date | null;
  onValueChange?: (value: Date | null) => void;
  placeholder?: string;
  /** Render the value in the input. Defaults to `Intl.DateTimeFormat`. */
  format?: (date: Date) => string;
  /** Parse what the reader typed. Defaults to ISO + the locale's numeric form. */
  parse?: (input: string, locale: string) => Date | null;
  /** Name for a hidden input, so the value (ISO `yyyy-mm-dd`) posts in a form. */
  name?: string;
  disabled?: boolean;
  readOnly?: boolean;
  id?: string;
  "aria-label"?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  children?: ReactNode;
};

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 12);
}

/**
 * An editable date field with a calendar in a popover.
 *
 * Type a date (ISO or the locale's numeric form — no natural language) and it
 * parses on blur / Enter; an unparseable value flags the field rather than
 * clearing it. Picking in the calendar fills the input and closes. The popover
 * rides the surface ladder — two rungs above wherever the field sits — and Base
 * UI moves focus into the grid on open and back to the trigger on close.
 */
export function DatePicker({
  value: valueProp,
  defaultValue = null,
  onValueChange,
  placeholder = "Select a date",
  format = (date) => defaultFormat(date, locale),
  parse = defaultParse,
  name,
  disabled = false,
  readOnly = false,
  id: idProp,
  "aria-label": ariaLabel,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  className,
  min,
  max,
  isDateDisabled,
  weekStartsOn,
  locale = "en-US",
  showOutsideDays,
}: DatePickerProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const popupLevel = Math.min(useSurface() + 2, 8);

  const isControlled = valueProp !== undefined;
  const [internalValue, setInternalValue] = useState<Date | null>(
    defaultValue ? toCalendarDate(defaultValue) : null,
  );
  const value = isControlled ? (valueProp ?? null) : internalValue;

  const isOpenControlled = openProp !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = isOpenControlled ? openProp : internalOpen;

  const [text, setText] = useState(value ? format(value) : "");
  const [invalid, setInvalid] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(value ?? new Date()),
  );

  // Keep the input text in sync when the value changes from outside.
  // biome-ignore lint/correctness/useExhaustiveDependencies: format is derived from locale
  useEffect(() => {
    setText(value ? format(value) : "");
    setInvalid(false);
    if (value) setVisibleMonth(startOfMonth(value));
  }, [value, locale]);

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isOpenControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isOpenControlled, onOpenChange],
  );

  const commit = useCallback(
    (next: Date | null) => {
      const normalized = next ? toCalendarDate(next) : null;
      if (!isControlled) setInternalValue(normalized);
      onValueChange?.(normalized);
    },
    [isControlled, onValueChange],
  );

  const commitText = () => {
    const trimmed = text.trim();
    if (!trimmed) {
      commit(null);
      setInvalid(false);
      return;
    }
    const parsed = parse(trimmed, locale);
    if (parsed && !isOutsideRange(parsed, min, max)) {
      commit(parsed);
      setText(format(parsed));
      setInvalid(false);
    } else {
      setInvalid(true);
    }
  };

  const handlePick = (date: Date | null) => {
    commit(date);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div
        className={twMerge("not-prose relative inline-flex w-56", className)}
      >
        <Input
          id={id}
          value={text}
          onChange={(event) => setText(event.currentTarget.value)}
          onBlur={commitText}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commitText();
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          aria-label={ariaLabel}
          aria-invalid={invalid || undefined}
          autoComplete="off"
          className="pr-9"
        />
        <PopoverTrigger
          disabled={disabled || readOnly}
          aria-label="Open calendar"
          render={
            <button
              type="button"
              className="absolute inset-y-0 right-0 grid w-9 place-items-center rounded-r-xl text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4"
            >
              <CalendarDays />
            </button>
          }
        />
      </div>

      <PopoverContent
        align="start"
        sideOffset={6}
        className={twMerge(
          "w-auto border-0 p-2 ring-0",
          surfaceClasses(popupLevel),
        )}
      >
        <Calendar
          value={value}
          onValueChange={handlePick}
          month={visibleMonth}
          onMonthChange={setVisibleMonth}
          min={min}
          max={max}
          isDateDisabled={isDateDisabled}
          weekStartsOn={weekStartsOn}
          locale={locale}
          showOutsideDays={showOutsideDays}
        />
      </PopoverContent>

      {name ? (
        <input
          type="hidden"
          name={name}
          value={value ? toISODate(value) : ""}
        />
      ) : null}
    </Popover>
  );
}
