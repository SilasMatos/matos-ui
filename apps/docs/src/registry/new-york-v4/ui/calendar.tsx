"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ComponentProps, KeyboardEvent } from "react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

import {
  addDays,
  addMonths,
  buildMonthGrid,
  type CalendarGridDay,
  clampDate,
  getWeekStart,
  isAfter,
  isOutsideRange,
  isSameDay,
  isSameMonth,
  monthCaption,
  toCalendarDate,
  toISODate,
  weekdayLabels,
} from "@/registry/new-york-v4/lib/date";
import { duration, spring } from "@/registry/new-york-v4/lib/motion-tokens";

export const calendarVariants = tv({
  // `not-prose`: the grid is a real <table>, and `.prose` would force it to
  // full width with its own borders, padding and font-size.
  base: "not-prose inline-flex select-none flex-col gap-2 text-sm",
  variants: {
    size: {
      sm: "[--cal-cell:1.75rem] text-xs",
      md: "[--cal-cell:2rem]",
      lg: "[--cal-cell:2.5rem]",
    },
  },
  defaultVariants: { size: "md" },
});

const navButton =
  "hover-lift [--lift:1px] grid size-7 place-items-center rounded-md text-muted-foreground outline-none " +
  "hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring " +
  "active:scale-95 disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4";

// A partial slide — the month reads as moving without leaving the frame.
const monthVariants = {
  enter: (dir: number) => ({ x: dir >= 0 ? "34%" : "-34%", opacity: 0 }),
  center: { x: "0%", opacity: 1 },
  exit: (dir: number) => ({ x: dir >= 0 ? "-34%" : "34%", opacity: 0 }),
};

export type CalendarProps = Omit<
  ComponentProps<"div">,
  "onChange" | "defaultValue"
> &
  VariantProps<typeof calendarVariants> & {
    /** Controlled selection. `null` clears it. */
    value?: Date | null;
    defaultValue?: Date | null;
    onValueChange?: (value: Date | null) => void;
    /** Controlled visible month. */
    month?: Date;
    defaultMonth?: Date;
    onMonthChange?: (month: Date) => void;
    min?: Date | null;
    max?: Date | null;
    /** Per-day override — return `true` to disable a date the range allows. */
    isDateDisabled?: (date: Date) => boolean;
    /** 0 (Sunday) – 6 (Saturday). Defaults to the locale's first day. */
    weekStartsOn?: number;
    /** BCP-47 tag for weekday / month names. Defaults to `"en-US"`. */
    locale?: string;
    /** Fill the 6-week grid with adjacent-month days. */
    showOutsideDays?: boolean;
  };

/**
 * A month grid, selection of one date.
 *
 * The grid is always six rows — it never changes height, so the `‹` / `›`
 * controls never move under the cursor and there is no height animation to
 * chase. A month change slides the grid a third of its width on `spring.moderate`
 * (`popLayout`, so the outgoing month leaves flow while it goes); the selected
 * day's pill pops in on `spring.fast`. It's a `role="grid"` with a roving
 * tabindex and the full APG keyboard model.
 *
 * `prefers-reduced-motion`: the slide and the pop become opacity crossfades.
 */
export function Calendar({
  className,
  size,
  value: valueProp,
  defaultValue = null,
  onValueChange,
  month: monthProp,
  defaultMonth,
  onMonthChange,
  min,
  max,
  isDateDisabled,
  weekStartsOn,
  locale = "en-US",
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const reduce = useReducedMotion();
  const captionId = useId();

  const isControlled = valueProp !== undefined;
  const [internalValue, setInternalValue] = useState<Date | null>(
    defaultValue ? toCalendarDate(defaultValue) : null,
  );
  const value = isControlled ? (valueProp ?? null) : internalValue;

  const today = useMemo(() => toCalendarDate(new Date()), []);
  const weekStart = weekStartsOn ?? getWeekStart(locale);

  const isMonthControlled = monthProp !== undefined;
  const [internalMonth, setInternalMonth] = useState(() =>
    toCalendarDate(
      new Date(
        (defaultMonth ?? value ?? today).getFullYear(),
        (defaultMonth ?? value ?? today).getMonth(),
        1,
      ),
    ),
  );
  const visibleMonth = isMonthControlled
    ? toCalendarDate(new Date(monthProp.getFullYear(), monthProp.getMonth(), 1))
    : internalMonth;

  const [focusedDay, setFocusedDay] = useState<Date>(() =>
    clampDate(value ?? today, min, max),
  );
  const directionRef = useRef(0);
  const cellRefs = useRef(new Map<string, HTMLButtonElement>());
  const [focusTick, setFocusTick] = useState(0);

  const isDisabled = useCallback(
    (date: Date) =>
      isOutsideRange(date, min, max) || Boolean(isDateDisabled?.(date)),
    [isDateDisabled, min, max],
  );

  const setMonth = useCallback(
    (next: Date, dir: number) => {
      directionRef.current = dir;
      const normalized = toCalendarDate(
        new Date(next.getFullYear(), next.getMonth(), 1),
      );
      if (!isMonthControlled) setInternalMonth(normalized);
      onMonthChange?.(normalized);
    },
    [isMonthControlled, onMonthChange],
  );

  const moveFocus = useCallback(
    (next: Date) => {
      const clamped = clampDate(next, min, max);
      setFocusedDay(clamped);
      setFocusTick((n) => n + 1);
      if (!isSameMonth(clamped, visibleMonth)) {
        setMonth(clamped, isAfter(clamped, visibleMonth) ? 1 : -1);
      }
    },
    [max, min, setMonth, visibleMonth],
  );

  const selectDay = useCallback(
    (date: Date) => {
      if (isDisabled(date)) return;
      const picked = toCalendarDate(date);
      if (!isControlled) setInternalValue(picked);
      onValueChange?.(picked);
      setFocusedDay(picked);
      if (!isSameMonth(picked, visibleMonth)) {
        setMonth(picked, isAfter(picked, visibleMonth) ? 1 : -1);
      }
    },
    [isControlled, isDisabled, onValueChange, setMonth, visibleMonth],
  );

  // Re-focus the DOM cell after a keyboard move (incl. across a month change).
  const registerCell = useCallback(
    (iso: string, node: HTMLButtonElement | null) => {
      if (node) cellRefs.current.set(iso, node);
      else cellRefs.current.delete(iso);
    },
    [],
  );
  // Re-focus after a keyboard move — deferred so the cells for a newly
  // navigated month have mounted before we reach for the ref.
  useEffect(() => {
    if (focusTick === 0) return;
    const frame = requestAnimationFrame(() => {
      cellRefs.current.get(toISODate(focusedDay))?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [focusTick, focusedDay]);

  const onGridKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step: Record<string, () => Date> = {
      ArrowLeft: () => addDays(focusedDay, -1),
      ArrowRight: () => addDays(focusedDay, 1),
      ArrowUp: () => addDays(focusedDay, -7),
      ArrowDown: () => addDays(focusedDay, 7),
      Home: () =>
        addDays(focusedDay, -((focusedDay.getDay() - weekStart + 7) % 7)),
      End: () =>
        addDays(focusedDay, 6 - ((focusedDay.getDay() - weekStart + 7) % 7)),
      PageUp: () => addMonths(focusedDay, event.shiftKey ? -12 : -1),
      PageDown: () => addMonths(focusedDay, event.shiftKey ? 12 : 1),
    };
    if (event.key in step) {
      event.preventDefault();
      moveFocus(step[event.key]());
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectDay(focusedDay);
    }
  };

  const grid = buildMonthGrid(visibleMonth, weekStart);
  const weeks: CalendarGridDay[][] = Array.from({ length: 6 }, (_, w) =>
    grid.slice(w * 7, w * 7 + 7),
  );
  const labels = weekdayLabels(locale, weekStart, "short");
  const caption = monthCaption(visibleMonth, locale);
  const monthKey = `${visibleMonth.getFullYear()}-${visibleMonth.getMonth()}`;

  const prevMonth = addMonths(visibleMonth, -1);
  const nextMonth = addMonths(visibleMonth, 1);
  const prevDisabled =
    !!min &&
    isOutsideRange(
      new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0, 12),
      min,
      null,
    );
  const nextDisabled =
    !!max &&
    isOutsideRange(
      new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1, 12),
      null,
      max,
    );

  return (
    <div
      data-slot="calendar"
      className={twMerge(calendarVariants({ size }), className)}
      {...props}
    >
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          aria-label="Previous month"
          disabled={prevDisabled}
          onClick={() => setMonth(prevMonth, -1)}
          className={navButton}
        >
          <ChevronLeft />
        </button>
        <h2
          id={captionId}
          aria-live="polite"
          className="font-medium text-foreground text-sm capitalize tabular-nums"
        >
          {caption}
        </h2>
        <button
          type="button"
          aria-label="Next month"
          disabled={nextDisabled}
          onClick={() => setMonth(nextMonth, 1)}
          className={navButton}
        >
          <ChevronRight />
        </button>
      </div>

      <div className="relative overflow-hidden">
        {/* A plain <table> of buttons: `<th scope="col">` headers, roving
         *  tabindex + arrow keys on the buttons, `aria-pressed` for selection.
         *  A screen reader navigates it as a table; keyboard users tab past it
         *  in one stop. */}
        <table
          aria-labelledby={captionId}
          onKeyDown={onGridKeyDown}
          className="block border-collapse outline-none"
        >
          <thead className="block">
            <tr className="flex">
              {labels.map((label, index) => (
                <th
                  // biome-ignore lint/suspicious/noArrayIndexKey: fixed 7-column header
                  key={index}
                  scope="col"
                  aria-label={label}
                  className="grid size-[var(--cal-cell)] place-items-center font-normal text-[0.7rem] text-muted-foreground"
                >
                  {label.slice(0, 2)}
                </th>
              ))}
            </tr>
          </thead>

          <AnimatePresence
            mode="popLayout"
            initial={false}
            custom={directionRef.current}
          >
            <motion.tbody
              key={monthKey}
              custom={directionRef.current}
              variants={monthVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={
                reduce ? { duration: duration.fast } : spring.moderate
              }
              className="block"
            >
              {weeks.map((week, weekIndex) => (
                <tr
                  // biome-ignore lint/suspicious/noArrayIndexKey: fixed 6-row grid
                  key={weekIndex}
                  className="flex"
                >
                  {week.map((cell) => (
                    <DayCell
                      key={toISODate(cell.date)}
                      cell={cell}
                      today={today}
                      selected={value}
                      focused={isSameDay(cell.date, focusedDay)}
                      disabled={isDisabled(cell.date)}
                      hideOutside={!showOutsideDays}
                      reduce={!!reduce}
                      onSelect={selectDay}
                      register={registerCell}
                    />
                  ))}
                </tr>
              ))}
            </motion.tbody>
          </AnimatePresence>
        </table>
      </div>
    </div>
  );
}

function DayCell({
  cell,
  today,
  selected,
  focused,
  disabled,
  hideOutside,
  reduce,
  onSelect,
  register,
}: {
  cell: CalendarGridDay;
  today: Date;
  selected: Date | null;
  focused: boolean;
  disabled: boolean;
  hideOutside: boolean;
  reduce: boolean;
  onSelect: (date: Date) => void;
  register: (iso: string, node: HTMLButtonElement | null) => void;
}) {
  const isSelected = isSameDay(cell.date, selected);
  const isToday = isSameDay(cell.date, today);
  const iso = toISODate(cell.date);

  if (cell.isOutside && hideOutside) {
    return <td className="size-[var(--cal-cell)]" />;
  }

  return (
    <td className="p-0">
      <button
        ref={(node) => register(iso, node)}
        type="button"
        aria-pressed={isSelected}
        aria-disabled={disabled || undefined}
        aria-current={isToday ? "date" : undefined}
        aria-label={cell.date.toDateString()}
        tabIndex={focused ? 0 : -1}
        data-outside={cell.isOutside || undefined}
        data-today={isToday || undefined}
        data-selected={isSelected || undefined}
        onClick={() => onSelect(cell.date)}
        className={twMerge(
          "relative grid size-[var(--cal-cell)] place-items-center rounded-md outline-none transition-colors",
          "focus-visible:ring-2 focus-visible:ring-ring",
          disabled
            ? "pointer-events-none text-muted-foreground/35"
            : "hover:bg-muted",
          cell.isOutside && !disabled && "text-muted-foreground/50",
          isToday && !isSelected && "ring-1 ring-ring ring-inset",
          reduce && isSelected && "bg-primary text-primary-foreground",
        )}
      >
        <AnimatePresence>
          {isSelected && !reduce ? (
            <motion.span
              aria-hidden="true"
              className="absolute inset-0.5 rounded-md bg-primary"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={spring.fast}
            />
          ) : null}
        </AnimatePresence>
        <span
          className={twMerge(
            "relative z-10 tabular-nums",
            isSelected && "font-medium text-primary-foreground",
          )}
        >
          {cell.day}
        </span>
      </button>
    </td>
  );
}
