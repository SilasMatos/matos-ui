/**
 * Gregorian date helpers for the Calendar / DatePicker — pure, no React, no
 * dependency. The public boundary of both components is the native `Date`, and
 * this file is the only thing that knows how a month grid is shaped; swapping it
 * for `@internationalized/date` later would be a local refactor, not a breaking
 * change.
 *
 * Everything works in *local* calendar terms (year / month / day) and never in
 * UTC timestamps. Dates are constructed at noon so that adding days across a
 * daylight-saving boundary can't land in the missing hour and roll the date.
 */

export type CalendarGridDay = {
  date: Date;
  day: number;
  month: number;
  year: number;
  /** Belongs to the previous or next month — shown to fill the 6-week grid. */
  isOutside: boolean;
};

/** Noon on the given calendar day, DST-safe for day arithmetic. */
export function toCalendarDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
}

export function addDays(date: Date, amount: number): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + amount,
    12,
  );
}

export function addMonths(date: Date, amount: number): Date {
  const target = new Date(date.getFullYear(), date.getMonth() + amount, 1, 12);
  // Clamp the day so `Jan 31 + 1 month` lands on the last of February, not March.
  const lastDay = new Date(
    target.getFullYear(),
    target.getMonth() + 1,
    0,
  ).getDate();
  target.setDate(Math.min(date.getDate(), lastDay));
  return target;
}

export function isSameDay(a: Date | null, b: Date | null): boolean {
  return (
    !!a &&
    !!b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function isBefore(a: Date, b: Date): boolean {
  return toCalendarDate(a).getTime() < toCalendarDate(b).getTime();
}

export function isAfter(a: Date, b: Date): boolean {
  return toCalendarDate(a).getTime() > toCalendarDate(b).getTime();
}

export function clampDate(
  date: Date,
  min?: Date | null,
  max?: Date | null,
): Date {
  if (min && isBefore(date, min)) return toCalendarDate(min);
  if (max && isAfter(date, max)) return toCalendarDate(max);
  return toCalendarDate(date);
}

export function isOutsideRange(
  date: Date,
  min?: Date | null,
  max?: Date | null,
): boolean {
  return (!!min && isBefore(date, min)) || (!!max && isAfter(date, max));
}

// --- Week start ------------------------------------------------------------
//
// `Intl.Locale.prototype.getWeekInfo()` is not implemented in Firefox and does
// not block Baseline, so this table is the primary path, not a fallback. The
// world default is Monday; these are the regions that don't follow it.

const SUNDAY_START = new Set([
  "US",
  "CA",
  "JP",
  "BR",
  "IL",
  "KR",
  "IN",
  "ZA",
  "PH",
  "MX",
  "AU",
  "NZ",
  "CN",
  "TW",
  "HK",
  "CO",
  "AR",
  "SG",
  "TH",
  "ID",
  "PE",
  "VE",
  "PK",
  "BD",
  "DO",
  "GT",
  "HN",
  "NI",
  "PA",
  "PR",
]);
const SATURDAY_START = new Set([
  "AE",
  "EG",
  "SA",
  "QA",
  "KW",
  "BH",
  "OM",
  "JO",
  "IQ",
  "DZ",
  "LY",
  "SD",
  "SY",
  "YE",
  "AF",
]);

/** 0 (Sunday) – 6 (Saturday). `weekStartsOn` prop always wins over this. */
export function getWeekStart(locale: string): number {
  try {
    const info = (
      new Intl.Locale(locale) as Intl.Locale & {
        getWeekInfo?: () => { firstDay: number };
      }
    ).getWeekInfo?.();
    // CLDR firstDay is 1 (Mon) – 7 (Sun); normalize to JS 0 (Sun) – 6 (Sat).
    if (info && typeof info.firstDay === "number") return info.firstDay % 7;
  } catch {
    // getWeekInfo unsupported — fall through to the table.
  }
  let region = "";
  try {
    region = new Intl.Locale(locale).maximize().region ?? "";
  } catch {
    region = "";
  }
  if (SUNDAY_START.has(region)) return 0;
  if (SATURDAY_START.has(region)) return 6;
  return 1;
}

// --- Grid + labels --------------------------------------------------------

/** Always 42 cells (6 weeks) so the grid never changes height. */
export function buildMonthGrid(
  visibleMonth: Date,
  weekStartsOn: number,
): CalendarGridDay[] {
  const first = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth(),
    1,
    12,
  );
  const lead = (first.getDay() - weekStartsOn + 7) % 7;
  const start = addDays(first, -lead);
  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(start, index);
    return {
      date,
      day: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear(),
      isOutside: date.getMonth() !== visibleMonth.getMonth(),
    };
  });
}

export function weekdayLabels(
  locale: string,
  weekStartsOn: number,
  width: "short" | "narrow" = "short",
): string[] {
  const format = new Intl.DateTimeFormat(locale, { weekday: width });
  // 2021-08-01 was a Sunday.
  return Array.from({ length: 7 }, (_, index) =>
    format.format(new Date(2021, 7, 1 + ((weekStartsOn + index) % 7))),
  );
}

export function monthCaption(visibleMonth: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(visibleMonth);
}

export function formatDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

// --- ISO + parse --------------------------------------------------------

export function toISODate(date: Date): string {
  const y = String(date.getFullYear()).padStart(4, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function makeValid(y: number, m: number, d: number): Date | null {
  const date = new Date(y, m, d, 12);
  return date.getFullYear() === y &&
    date.getMonth() === m &&
    date.getDate() === d
    ? date
    : null;
}

/**
 * Accepts ISO `yyyy-mm-dd` (or `yyyy/mm/dd`) and the locale's *numeric* format
 * — the field order is read from `Intl.DateTimeFormat` so `11/22/2033` parses
 * under `en-US` and `22/11/2033` under `en-GB`. No natural language.
 */
export function parseDate(input: string, locale: string): Date | null {
  const text = input.trim();
  if (!text) return null;

  const iso = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/.exec(text);
  if (iso) return makeValid(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));

  const nums = text.match(/\d+/g);
  if (!nums || nums.length !== 3) return null;

  const order = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  })
    .formatToParts(new Date(2033, 10, 22, 12))
    .filter(
      (part) =>
        part.type === "year" || part.type === "month" || part.type === "day",
    )
    .map((part) => part.type);

  const picked: Record<string, number> = {};
  order.forEach((type, index) => {
    picked[type] = Number(nums[index]);
  });

  const year = picked.year < 100 ? 2000 + picked.year : picked.year;
  return makeValid(year, picked.month - 1, picked.day);
}
