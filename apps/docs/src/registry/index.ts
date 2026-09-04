import type { Registry } from "shadcn/schema";
import { getSiteUrl } from "../lib/site-url";
import { blocks } from "./registry-blocks";
import { examples } from "./registry-examples";
import { palettes } from "./registry-palettes";
import { ui } from "./registry-ui";

const radiusCss = {
  "@theme inline": {
    "--radius-sm": "calc(var(--radius) - 4px)",
    "--radius-md": "calc(var(--radius) - 2px)",
    "--radius-lg": "var(--radius)",
    "--radius-xl": "calc(var(--radius) + 4px)",
    "--radius-2xl": "calc(var(--radius) + 10px)",
    "--radius-3xl": "calc(var(--radius) + 18px)",
  },
};

// Shared between index and style for backward compatibility.
const TEMPLATE_STYLE = {
  type: "registry:style" as const,
  dependencies: ["class-variance-authority", "lucide-react"],
  devDependencies: ["tw-animate-css"],
  registryDependencies: ["utils"],
  css: radiusCss,
  files: [],
};

export const registry = {
  name: "matos/ui",
  homepage: `${getSiteUrl()}/`,
  items: [
    {
      name: "index",
      ...TEMPLATE_STYLE,
    },
    {
      name: "style",
      ...TEMPLATE_STYLE,
    },
    ...ui,
    ...blocks,
    ...palettes,
    ...examples,
  ] satisfies Registry["items"],
} satisfies Registry;
