import { defineI18n } from "fumadocs-core/i18n";

import { defaultLocale, locales } from "@/i18n/routing";

export const i18n = defineI18n({
  defaultLanguage: defaultLocale,
  languages: [...locales],
  parser: "dot",
  hideLocale: "default-locale",
});
