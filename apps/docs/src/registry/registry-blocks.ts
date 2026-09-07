import type { Registry } from "shadcn/schema";

const REGISTRY_URL = "https://matos-ui.com/r";

function dep(name: string) {
  return `${REGISTRY_URL}/${name}.json`;
}

export const blocks: Registry["items"] = [
  {
    name: "notification-center-01",
    type: "registry:block",
    description:
      "Notification centre on the Surfaces system — every card lifts one step off the panel and another under the cursor, new items slide in, and dismissals play their exit before the list closes the gap.",
    dependencies: ["framer-motion", "lucide-react", "tailwind-merge"],
    registryDependencies: [
      dep("badge"),
      dep("button"),
      dep("elevated"),
      dep("motion-tokens"),
      dep("surface-classes"),
      dep("surface-context"),
    ],
    files: [
      {
        path: "blocks/notification-center-01/notification-center-01.tsx",
        type: "registry:block",
      },
    ],
  },
  {
    name: "command-menu-01",
    type: "registry:block",
    description:
      "Command palette that spells out the elevation rule: a dialog-weight Elevated over a scrim, with a popover-weight Elevated highlight nested inside it, sliding between rows on arrow keys.",
    dependencies: ["framer-motion", "lucide-react", "tailwind-merge"],
    registryDependencies: [
      dep("elevated"),
      dep("motion-tokens"),
      dep("surface-classes"),
      dep("surface-context"),
    ],
    files: [
      {
        path: "blocks/command-menu-01/command-menu-01.tsx",
        type: "registry:block",
      },
    ],
  },
  {
    name: "pricing-tiers-01",
    type: "registry:block",
    description:
      "Pricing table where the featured tier sits a full elevation rung above its neighbours, with a shared-layoutId billing toggle and a price that slides on switch.",
    dependencies: ["framer-motion", "lucide-react", "tailwind-merge"],
    registryDependencies: [
      dep("badge"),
      dep("button"),
      dep("elevated"),
      dep("motion-tokens"),
      dep("surface-classes"),
      dep("surface-context"),
    ],
    files: [
      {
        path: "blocks/pricing-tiers-01/pricing-tiers-01.tsx",
        type: "registry:block",
      },
    ],
  },
  {
    name: "stat-tiles-01",
    type: "registry:block",
    description:
      "A row of KPI tiles that reads its substrate and animates once on scroll — reveal + stagger, counting numbers, and a self-drawing sparkline per tile.",
    dependencies: ["framer-motion", "lucide-react", "tailwind-merge"],
    registryDependencies: [
      dep("elevated"),
      dep("motion-tokens"),
      dep("surface-classes"),
      dep("surface-context"),
    ],
    files: [
      {
        path: "blocks/stat-tiles-01/stat-tiles-01.tsx",
        type: "registry:block",
      },
    ],
  },
  {
    name: "dashboard-overview-01",
    type: "registry:block",
    description:
      "Responsive analytics dashboard with selectable date ranges, animated metrics, export actions, and a recent activity feed.",
    dependencies: ["lucide-react"],
    registryDependencies: [
      dep("badge"),
      dep("button"),
      dep("elevated"),
      dep("metric-card"),
    ],
    files: [
      {
        path: "blocks/dashboard-overview-01/dashboard-overview-01.tsx",
        type: "registry:block",
      },
    ],
  },
  {
    name: "profile-settings-01",
    type: "registry:block",
    description:
      "Responsive account settings screen with profile navigation, editable identity fields, validation, and saving feedback.",
    dependencies: ["lucide-react"],
    registryDependencies: [
      dep("badge"),
      dep("button"),
      dep("input"),
      dep("textarea"),
    ],
    files: [
      {
        path: "blocks/profile-settings-01/profile-settings-01.tsx",
        type: "registry:block",
      },
    ],
  },
  {
    name: "sidebar-surface-01",
    type: "registry:block",
    description:
      "Application sidebar built on the Surfaces system — the panel lifts off the app background, the active item and the user menu popover elevate one and two steps, and collapsible nav groups keep everything readable in light and dark.",
    dependencies: ["framer-motion", "lucide-react", "tailwind-merge"],
    registryDependencies: [
      dep("elevated"),
      dep("surface-context"),
      dep("surface-classes"),
      dep("badge"),
    ],
    files: [
      {
        path: "blocks/sidebar-surface-01/sidebar-surface-01.tsx",
        type: "registry:block",
      },
      {
        path: "blocks/sidebar-surface-01/components/nav-section.tsx",
        type: "registry:component",
      },
      {
        path: "blocks/sidebar-surface-01/components/user-menu.tsx",
        type: "registry:component",
      },
      {
        path: "blocks/sidebar-surface-01/data.tsx",
        type: "registry:component",
      },
    ],
  },
  {
    name: "sign-in-01",
    type: "registry:block",
    description:
      "Split sign-in screen with social auth, email and password validation, loading, error and success states, and a responsive marketing aside.",
    dependencies: ["framer-motion", "lucide-react", "tailwind-merge"],
    registryDependencies: [
      dep("button"),
      dep("badge"),
      dep("input"),
      dep("password-input"),
      dep("checkbox"),
    ],
    files: [
      {
        path: "blocks/sign-in-01/sign-in-01.tsx",
        type: "registry:block",
      },
      {
        path: "blocks/sign-in-01/components/auth-aside.tsx",
        type: "registry:component",
      },
    ],
  },
];
