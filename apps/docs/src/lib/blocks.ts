import { getRegistryBaseUrl } from "@/lib/site-url";

export const blockCategories = [
  "All",
  "Application",
  "Authentication",
] as const;

export type BlockCategory = (typeof blockCategories)[number];

export type BlockStatus = "stable" | "beta";

export type BlockMeta = {
  id: string;
  name: string;
  description: string;
  category: Exclude<BlockCategory, "All">;
  tags: string[];
  status: BlockStatus;
  isNew?: boolean;
  /** npm packages the block relies on. */
  dependencies: string[];
  /** Matos UI registry components composed by the block. */
  matosComponents: string[];
};

export const blockCollection: BlockMeta[] = [
  {
    id: "sidebar-surface-01",
    name: "Surface Sidebar",
    description:
      "Application sidebar built on the Surfaces system: the panel, active item and user menu popover each lift one step off their substrate, in light and dark.",
    category: "Application",
    tags: ["sidebar", "navigation", "surface", "layout"],
    status: "stable",
    isNew: true,
    dependencies: ["framer-motion", "lucide-react", "tailwind-merge"],
    matosComponents: ["elevated", "surface-context", "badge"],
  },
  {
    id: "sign-in-01",
    name: "Sign In",
    description:
      "Split sign-in with social auth, validation, and loading, error and success states.",
    category: "Authentication",
    tags: ["auth", "login", "form", "validation"],
    status: "stable",
    isNew: true,
    dependencies: ["framer-motion", "lucide-react", "tailwind-merge"],
    matosComponents: ["input", "password-input", "checkbox", "button", "badge"],
  },
];

export type BlockId = (typeof blockCollection)[number]["id"];

export function getBlockById(id: string): BlockMeta | undefined {
  return blockCollection.find((block) => block.id === id);
}

export function getBlockInstallCommand(id: string): string {
  return `npx shadcn@latest add ${getRegistryBaseUrl()}/${id}.json`;
}
