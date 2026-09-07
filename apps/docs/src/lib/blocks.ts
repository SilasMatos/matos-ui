import { getRegistryBaseUrl } from "@/lib/site-url";

export const blockCategories = [
  "All",
  "Application",
  "Authentication",
  "Dashboard",
  "Marketing",
  "Settings",
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
    id: "notification-center-01",
    name: "Notification Center",
    description:
      "Cards that lift off the panel and again under the cursor, with slide-in arrivals and animated dismissals.",
    category: "Application",
    tags: ["notifications", "surface", "animation", "list"],
    status: "stable",
    isNew: true,
    dependencies: ["framer-motion", "lucide-react", "tailwind-merge"],
    matosComponents: ["elevated", "surface-context", "badge", "button"],
  },
  {
    id: "command-menu-01",
    name: "Command Menu",
    description:
      "A ⌘K palette: a dialog-weight surface over a scrim with a popover-weight highlight nested inside, sliding between rows.",
    category: "Application",
    tags: ["command", "palette", "surface", "keyboard"],
    status: "stable",
    isNew: true,
    dependencies: ["framer-motion", "lucide-react", "tailwind-merge"],
    matosComponents: ["elevated", "surface-context", "motion-tokens"],
  },
  {
    id: "pricing-tiers-01",
    name: "Pricing Tiers",
    description:
      "The featured tier sits a full elevation rung above its neighbours, with a sliding billing toggle and a price that swaps on switch.",
    category: "Marketing",
    tags: ["pricing", "marketing", "surface", "toggle"],
    status: "stable",
    isNew: true,
    dependencies: ["framer-motion", "lucide-react", "tailwind-merge"],
    matosComponents: ["elevated", "surface-context", "badge", "button"],
  },
  {
    id: "stat-tiles-01",
    name: "Stat Tiles",
    description:
      "KPI tiles that read their substrate and animate once on scroll — reveal, counting numbers, and a self-drawing sparkline.",
    category: "Dashboard",
    tags: ["dashboard", "stats", "kpi", "sparkline", "scroll"],
    status: "stable",
    isNew: true,
    dependencies: ["framer-motion", "lucide-react", "tailwind-merge"],
    matosComponents: ["elevated", "surface-context", "motion-tokens"],
  },
  {
    id: "dashboard-overview-01",
    name: "Dashboard Overview",
    description:
      "Responsive analytics overview with date ranges, animated metrics, actions, and a recent activity feed.",
    category: "Dashboard",
    tags: ["dashboard", "analytics", "metrics", "activity"],
    status: "stable",
    isNew: true,
    dependencies: ["lucide-react"],
    matosComponents: ["metric-card", "elevated", "button", "badge"],
  },
  {
    id: "profile-settings-01",
    name: "Profile Settings",
    description:
      "Account settings with profile navigation, editable fields, validation, and saving feedback.",
    category: "Settings",
    tags: ["settings", "profile", "form", "account"],
    status: "stable",
    isNew: true,
    dependencies: ["lucide-react"],
    matosComponents: ["input", "textarea", "button", "badge"],
  },
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
