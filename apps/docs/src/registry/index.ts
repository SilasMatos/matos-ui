import type { Registry } from "shadcn/schema";
import { getSiteUrl } from "../lib/site-url";
import { blocks } from "./registry-blocks";
import { examples } from "./registry-examples";
import { ui } from "./registry-ui";

// Shared between index and style for backward compatibility.
const TEMPLATE_STYLE = {
  type: "registry:style" as const,
  dependencies: ["class-variance-authority", "lucide-react"],
  devDependencies: ["tw-animate-css"],
  registryDependencies: ["utils"],
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
    ...examples,
  ] satisfies Registry["items"],
} satisfies Registry;
