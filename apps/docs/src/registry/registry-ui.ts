import type { Registry } from "shadcn/schema";

export const ui: Registry["items"] = [
  {
    name: "button",
    type: "registry:ui",
    dependencies: ["@base-ui/react"],
    files: [
      {
        path: "ui/button.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "badge",
    type: "registry:ui",
    dependencies: ["tailwind-merge", "tailwind-variants"],
    files: [
      {
        path: "ui/badge.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "divider",
    type: "registry:ui",
    dependencies: ["tailwind-merge", "tailwind-variants"],
    files: [
      {
        path: "ui/divider.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "accordion",
    type: "registry:ui",
    dependencies: ["framer-motion", "lucide-react", "clsx", "tailwind-merge"],
    files: [
      {
        path: "ui/accordion.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "action-bar",
    type: "registry:ui",
    dependencies: ["lucide-react", "tailwind-merge", "tailwind-variants"],
    registryDependencies: ["button"],
    files: [
      {
        path: "ui/action-bar.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "detail-panel",
    type: "registry:ui",
    dependencies: [
      "framer-motion",
      "lucide-react",
      "tailwind-merge",
      "tailwind-variants",
    ],
    files: [
      {
        path: "ui/detail-panel.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "switch",
    type: "registry:ui",
    dependencies: ["lucide-react", "tailwind-merge", "tailwind-variants"],
    files: [
      {
        path: "ui/switch.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "file-upload",
    type: "registry:ui",
    dependencies: ["lucide-react", "tailwind-merge", "tailwind-variants"],
    files: [
      {
        path: "ui/file-upload.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "notification-stack",
    type: "registry:ui",
    dependencies: [
      "framer-motion",
      "lucide-react",
      "tailwind-merge",
      "tailwind-variants",
    ],
    files: [
      {
        path: "ui/notification-stack.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "metric-card",
    type: "registry:ui",
    dependencies: [
      "framer-motion",
      "lucide-react",
      "tailwind-merge",
      "tailwind-variants",
    ],
    files: [
      {
        path: "ui/metric-card.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "feedback-card",
    type: "registry:ui",
    dependencies: [
      "framer-motion",
      "lucide-react",
      "tailwind-merge",
      "tailwind-variants",
    ],
    files: [
      {
        path: "ui/feedback-card.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "spotlight-card",
    type: "registry:ui",
    dependencies: ["framer-motion", "tailwind-merge", "tailwind-variants"],
    files: [
      {
        path: "ui/spotlight-card.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "kinetic-card",
    type: "registry:ui",
    dependencies: ["framer-motion", "tailwind-merge", "tailwind-variants"],
    files: [
      {
        path: "ui/kinetic-card.tsx",
        type: "registry:ui",
      },
    ],
  },
];
