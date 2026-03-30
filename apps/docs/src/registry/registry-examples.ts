import type { Registry } from "shadcn/schema";

export const examples: Registry["items"] = [
  {
    name: "button-demo",
    type: "registry:example",
    registryDependencies: ["button"],
    files: [
      {
        path: "examples/button-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "badge-demo",
    type: "registry:example",
    registryDependencies: ["badge"],
    files: [
      {
        path: "examples/badge-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "divider-demo",
    type: "registry:example",
    registryDependencies: ["divider"],
    files: [
      {
        path: "examples/divider-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "accordion-demo",
    type: "registry:example",
    registryDependencies: ["accordion"],
    files: [
      {
        path: "examples/accordion-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "action-bar-demo",
    type: "registry:example",
    registryDependencies: ["action-bar"],
    files: [
      {
        path: "examples/action-bar-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "detail-panel-demo",
    type: "registry:example",
    registryDependencies: ["detail-panel", "button"],
    files: [
      {
        path: "examples/detail-panel-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "switch-demo",
    type: "registry:example",
    registryDependencies: ["switch"],
    files: [
      {
        path: "examples/switch-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "file-upload-demo",
    type: "registry:example",
    registryDependencies: ["file-upload"],
    files: [
      {
        path: "examples/file-upload-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "notification-stack-demo",
    type: "registry:example",
    registryDependencies: ["notification-stack", "button"],
    files: [
      {
        path: "examples/notification-stack-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "metric-card-demo",
    type: "registry:example",
    registryDependencies: ["metric-card"],
    files: [
      {
        path: "examples/metric-card-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "feedback-card-demo",
    type: "registry:example",
    registryDependencies: ["feedback-card"],
    files: [
      {
        path: "examples/feedback-card-demo.tsx",
        type: "registry:example",
      },
    ],
  },
];
