import { defineRouting } from "next-intl/routing";

export const locales = ["en"] as const;
export const defaultLocale = "en";

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "as-needed",
});
