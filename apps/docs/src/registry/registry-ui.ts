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
    name: "reactive-button",
    type: "registry:ui",
    dependencies: [
      "framer-motion",
      "lucide-react",
      "tailwind-merge",
      "tailwind-variants",
    ],
    files: [
      {
        path: "ui/reactive-button.tsx",
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
    name: "data-table",
    type: "registry:ui",
    dependencies: ["@tanstack/react-table", "lucide-react"],
    files: [
      {
        path: "ui/data-table.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "activity-feed",
    type: "registry:ui",
    dependencies: [
      "framer-motion",
      "lucide-react",
      "tailwind-merge",
      "tailwind-variants",
    ],
    files: [
      {
        path: "ui/activity-feed.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "status-pulse-card",
    type: "registry:ui",
    dependencies: [
      "framer-motion",
      "lucide-react",
      "tailwind-merge",
      "tailwind-variants",
    ],
    files: [
      {
        path: "ui/status-pulse-card.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "inset-command-dock",
    type: "registry:ui",
    dependencies: [
      "framer-motion",
      "lucide-react",
      "tailwind-merge",
      "tailwind-variants",
    ],
    files: [
      {
        path: "ui/inset-command-dock.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "dynamic-island",
    type: "registry:ui",
    dependencies: [
      "framer-motion",
      "lucide-react",
      "tailwind-merge",
      "tailwind-variants",
    ],
    files: [
      {
        path: "ui/dynamic-island.tsx",
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
    name: "command-dock",
    type: "registry:ui",
    dependencies: [
      "framer-motion",
      "lucide-react",
      "tailwind-merge",
      "tailwind-variants",
    ],
    files: [
      {
        path: "ui/command-dock.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "file-upload",
    type: "registry:ui",
    dependencies: [
      "framer-motion",
      "lucide-react",
      "tailwind-merge",
      "tailwind-variants",
    ],
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
    name: "motion-tabs",
    type: "registry:ui",
    dependencies: ["framer-motion", "tailwind-merge", "tailwind-variants"],
    files: [
      {
        path: "ui/motion-tabs.tsx",
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
  {
    name: "progress-orbit",
    type: "registry:ui",
    dependencies: [
      "framer-motion",
      "lucide-react",
      "tailwind-merge",
      "tailwind-variants",
    ],
    files: [
      {
        path: "ui/progress-orbit.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "process-timeline-engine",
    type: "registry:ui",
    dependencies: [
      "framer-motion",
      "lucide-react",
      "tailwind-merge",
      "tailwind-variants",
    ],
    files: [
      {
        path: "ui/process-timeline-engine.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "field",
    type: "registry:ui",
    dependencies: [
      "framer-motion",
      "lucide-react",
      "tailwind-merge",
      "tailwind-variants",
    ],
    files: [
      {
        path: "ui/field.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "input",
    type: "registry:ui",
    dependencies: [
      "@base-ui/react",
      "class-variance-authority",
      "framer-motion",
      "lucide-react",
    ],
    registryDependencies: ["field"],
    files: [
      {
        path: "ui/input.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "password-input",
    type: "registry:ui",
    dependencies: [
      "framer-motion",
      "lucide-react",
      "tailwind-merge",
      "tailwind-variants",
    ],
    registryDependencies: ["field", "input"],
    files: [
      {
        path: "ui/password-input.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "select",
    type: "registry:ui",
    dependencies: [
      "@base-ui/react",
      "class-variance-authority",
      "lucide-react",
    ],
    registryDependencies: ["field"],
    files: [
      {
        path: "ui/select.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "textarea",
    type: "registry:ui",
    dependencies: ["tailwind-merge", "tailwind-variants"],
    registryDependencies: ["field"],
    files: [
      {
        path: "ui/textarea.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "form-grid",
    type: "registry:ui",
    dependencies: ["tailwind-merge", "tailwind-variants"],
    files: [
      {
        path: "ui/form-grid.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "form-section",
    type: "registry:ui",
    dependencies: ["framer-motion", "tailwind-merge", "tailwind-variants"],
    files: [
      {
        path: "ui/form-section.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "checkbox",
    type: "registry:ui",
    dependencies: [
      "@base-ui/react",
      "class-variance-authority",
      "lucide-react",
    ],
    registryDependencies: ["field"],
    files: [
      {
        path: "ui/checkbox.tsx",
        type: "registry:ui",
      },
    ],
  },
];
