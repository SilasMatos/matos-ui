import type { Registry } from "shadcn/schema";

const REGISTRY_URL = "https://matos-ui.com/r";

function dep(name: string) {
  return `${REGISTRY_URL}/${name}.json`;
}

export const blocks: Registry["items"] = [
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
