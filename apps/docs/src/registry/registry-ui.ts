import type { Registry } from "shadcn/schema";

// Surface elevation tokens shipped with the `elevated` primitive so that
// `npx shadcn add elevated.json` also installs the 8-level ladder into the
// consumer's globals.css (both the raw vars and the Tailwind theme mapping).
const surfaceCssVars = {
  light: {
    "surface-1": "#fafafa",
    "surface-2": "#fcfcfc",
    "surface-3": "#ffffff",
    "surface-4": "#ffffff",
    "surface-5": "#ffffff",
    "surface-6": "#ffffff",
    "surface-7": "#ffffff",
    "surface-8": "#ffffff",
    // The ring alpha ramps with the level: light-mode elevation is carried by
    // shadow (the fill is pure white from level 3 up), so a fixed ring made
    // every level draw the same 1px line. Drops accumulate on top.
    "shadow-color": "rgb(0 0 0 / 0.06)",
    "lm-ring-2": "rgb(0 0 0 / 0.07)",
    "lm-ring-3": "rgb(0 0 0 / 0.08)",
    "lm-ring-4": "rgb(0 0 0 / 0.09)",
    "lm-ring-5": "rgb(0 0 0 / 0.1)",
    "lm-ring-6": "rgb(0 0 0 / 0.11)",
    "lm-ring-7": "rgb(0 0 0 / 0.12)",
    "lm-ring-8": "rgb(0 0 0 / 0.13)",
    "lm-drop": "rgb(0 0 0 / 0.07)",
    "shadow-1": "0 0 0 1px var(--shadow-color)",
    "shadow-2": "0 0 0 1px var(--lm-ring-2), 0 1px 1px -0.5px var(--lm-drop)",
    "shadow-3":
      "0 0 0 1px var(--lm-ring-3), 0 1px 1px -0.5px var(--lm-drop), 0 3px 3px -1.5px var(--lm-drop)",
    "shadow-4":
      "0 0 0 1px var(--lm-ring-4), 0 1px 1px -0.5px var(--lm-drop), 0 3px 3px -1.5px var(--lm-drop), 0 6px 6px -3px var(--lm-drop)",
    "shadow-5":
      "0 0 0 1px var(--lm-ring-5), 0 1px 1px -0.5px var(--lm-drop), 0 3px 3px -1.5px var(--lm-drop), 0 6px 6px -3px var(--lm-drop), 0 12px 12px -6px var(--lm-drop)",
    "shadow-6":
      "0 0 0 1px var(--lm-ring-6), 0 1px 1px -0.5px var(--lm-drop), 0 3px 3px -1.5px var(--lm-drop), 0 6px 6px -3px var(--lm-drop), 0 12px 12px -6px var(--lm-drop), 0 24px 24px -12px var(--lm-drop)",
    "shadow-7":
      "0 0 0 1px var(--lm-ring-7), 0 1px 1px -0.5px var(--lm-drop), 0 3px 3px -1.5px var(--lm-drop), 0 6px 6px -3px var(--lm-drop), 0 12px 12px -6px var(--lm-drop), 0 24px 24px -12px var(--lm-drop), 0 48px 48px -24px var(--lm-drop)",
    "shadow-8":
      "0 0 0 1px var(--lm-ring-8), 0 1px 1px -0.5px var(--lm-drop), 0 3px 3px -1.5px var(--lm-drop), 0 6px 6px -3px var(--lm-drop), 0 12px 12px -6px var(--lm-drop), 0 24px 24px -12px var(--lm-drop), 0 48px 48px -24px var(--lm-drop), 0 96px 96px -48px var(--lm-drop)",
  },
  dark: {
    // Spaced in CIE L* (~4-6 per level), not in raw sRGB: a uniform sRGB step
    // decays to ~3 L* at the top of the ladder and stops reading as elevation.
    "surface-1": "#191919",
    "surface-2": "#242424",
    "surface-3": "#2e2e2e",
    "surface-4": "#393939",
    "surface-5": "#444444",
    "surface-6": "#4e4e4e",
    "surface-7": "#575757",
    "surface-8": "#616161",
    "dm-hi-base": "rgba(255,255,255,0.01)",
    "dm-hi-mid": "rgba(255,255,255,0.02)",
    "dm-hi-high": "rgba(255,255,255,0.04)",
    "dm-hi-peak": "rgba(255,255,255,0.06)",
    "dm-ring-base": "rgba(255,255,255,0.02)",
    "dm-ring-mid": "rgba(255,255,255,0.04)",
    "dm-ring-high": "rgba(255,255,255,0.06)",
    "dm-drop": "rgba(0,0,0,0.18)",
    "shadow-1": "inset 0 0 0 1px var(--dm-ring-base)",
    "shadow-2":
      "inset 0 1px 0 0 var(--dm-hi-base), inset 0 0 0 1px var(--dm-ring-base), 0 1px 1px -0.5px var(--dm-drop)",
    "shadow-3":
      "inset 0 1px 0 0 var(--dm-hi-mid), inset 0 0 0 1px var(--dm-ring-base), 0 0 0 1px rgba(0,0,0,0.12), 0 1px 1px -0.5px var(--dm-drop), 0 3px 3px -1.5px var(--dm-drop)",
    "shadow-4":
      "inset 0 1px 0 0 var(--dm-hi-mid), inset 0 0 0 1px var(--dm-ring-mid), 0 0 0 1px rgba(0,0,0,0.14), 0 1px 1px -0.5px var(--dm-drop), 0 3px 3px -1.5px var(--dm-drop), 0 6px 6px -3px var(--dm-drop)",
    "shadow-5":
      "inset 0 1px 0 0 var(--dm-hi-high), inset 0 0 0 1px var(--dm-ring-mid), 0 0 0 1px rgba(0,0,0,0.16), 0 1px 1px -0.5px var(--dm-drop), 0 3px 3px -1.5px var(--dm-drop), 0 6px 6px -3px var(--dm-drop), 0 12px 12px -6px var(--dm-drop)",
    "shadow-6":
      "inset 0 1px 0 0 var(--dm-hi-high), inset 0 0 0 1px var(--dm-ring-high), 0 0 0 1px rgba(0,0,0,0.18), 0 1px 1px -0.5px var(--dm-drop), 0 3px 3px -1.5px var(--dm-drop), 0 6px 6px -3px var(--dm-drop), 0 12px 12px -6px var(--dm-drop), 0 24px 24px -12px var(--dm-drop)",
    "shadow-7":
      "inset 0 1px 0 0 var(--dm-hi-peak), inset 0 0 0 1px var(--dm-ring-high), 0 0 0 1px rgba(0,0,0,0.2), 0 1px 1px -0.5px var(--dm-drop), 0 3px 3px -1.5px var(--dm-drop), 0 6px 6px -3px var(--dm-drop), 0 12px 12px -6px var(--dm-drop), 0 24px 24px -12px var(--dm-drop), 0 48px 48px -24px var(--dm-drop)",
    "shadow-8":
      "inset 0 1px 0 0 var(--dm-hi-peak), inset 0 0 0 1px var(--dm-ring-high), 0 0 0 1px rgba(0,0,0,0.22), 0 1px 1px -0.5px var(--dm-drop), 0 3px 3px -1.5px var(--dm-drop), 0 6px 6px -3px var(--dm-drop), 0 12px 12px -6px var(--dm-drop), 0 24px 24px -12px var(--dm-drop), 0 48px 48px -24px var(--dm-drop), 0 96px 96px -48px var(--dm-drop)",
  },
};

const surfaceCss = {
  "@theme inline": {
    "--color-surface-1": "var(--surface-1)",
    "--color-surface-2": "var(--surface-2)",
    "--color-surface-3": "var(--surface-3)",
    "--color-surface-4": "var(--surface-4)",
    "--color-surface-5": "var(--surface-5)",
    "--color-surface-6": "var(--surface-6)",
    "--color-surface-7": "var(--surface-7)",
    "--color-surface-8": "var(--surface-8)",
    "--shadow-surface-1": "var(--shadow-1)",
    "--shadow-surface-2": "var(--shadow-2)",
    "--shadow-surface-3": "var(--shadow-3)",
    "--shadow-surface-4": "var(--shadow-4)",
    "--shadow-surface-5": "var(--shadow-5)",
    "--shadow-surface-6": "var(--shadow-6)",
    "--shadow-surface-7": "var(--shadow-7)",
    "--shadow-surface-8": "var(--shadow-8)",
  },
};

// The hover-lift motion token, shipped with every component that lifts so that
// `npx shadcn add button.json` installs the utility and not just the class name
// that references it. The utility owns the transition *property list* as well
// as the timing: Tailwind v4 animates `translate`/`scale`, not `transform`, and
// a call site that lists the wrong one gets an untransitioned jump with no
// error to show for it.
const liftCssVars = {
  theme: {
    "ease-lift": "cubic-bezier(0.4, 0, 0.2, 1)",
    "duration-lift": "320ms",
    "duration-lift-press": "120ms",
  },
};

const liftCss = {
  "@utility hover-lift": {
    "--lift": "2px",
    "transition-property":
      "translate, scale, box-shadow, background-color, border-color, border-radius, color, opacity",
    "transition-duration": "var(--duration-lift)",
    "transition-timing-function": "var(--ease-lift)",
    "@media (hover: hover)": {
      "&:hover": {
        translate: "0 calc(var(--lift) * -1)",
      },
    },
    "&:active": {
      translate: "0 0",
      "transition-duration": "var(--duration-lift-press)",
    },
    "@media (prefers-reduced-motion: reduce)": {
      "transition-property": "background-color, border-color, color, opacity",
      "&:hover, &:active": {
        translate: "none",
        scale: "none",
      },
    },
  },
};

const physicsDeps = ["framer-motion", "tailwind-merge", "tailwind-variants"];

export const ui: Registry["items"] = [
  {
    name: "magnetic-card",
    type: "registry:ui",
    dependencies: physicsDeps,
    files: [{ path: "ui/magnetic-card.tsx", type: "registry:ui" }],
  },
  {
    name: "spring-slider",
    type: "registry:ui",
    dependencies: physicsDeps,
    files: [{ path: "ui/spring-slider.tsx", type: "registry:ui" }],
  },
  {
    name: "bouncy-toggle",
    type: "registry:ui",
    dependencies: physicsDeps,
    files: [{ path: "ui/bouncy-toggle.tsx", type: "registry:ui" }],
  },
  {
    name: "physics-counter",
    type: "registry:ui",
    dependencies: physicsDeps,
    files: [{ path: "ui/physics-counter.tsx", type: "registry:ui" }],
  },
  {
    name: "floating-action-menu",
    type: "registry:ui",
    dependencies: [...physicsDeps, "lucide-react"],
    registryDependencies: ["elevated", "motion-tokens"],
    files: [{ path: "ui/floating-action-menu.tsx", type: "registry:ui" }],
  },
  {
    name: "button",
    type: "registry:ui",
    cssVars: liftCssVars,
    css: liftCss,
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
    cssVars: liftCssVars,
    css: liftCss,
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
    name: "theme-toggler-button",
    type: "registry:ui",
    dependencies: [
      "framer-motion",
      "lucide-react",
      "next-themes",
      "tailwind-merge",
      "tailwind-variants",
    ],
    files: [
      {
        path: "ui/theme-toggler-button.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "badge",
    type: "registry:ui",
    cssVars: liftCssVars,
    css: liftCss,
    dependencies: ["tailwind-merge", "tailwind-variants"],
    registryDependencies: ["surface-context", "surface-classes"],
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
    registryDependencies: ["elevated"],
    files: [
      {
        path: "ui/data-table.tsx",
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
    registryDependencies: ["button", "elevated"],
    files: [
      {
        path: "ui/action-bar.tsx",
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
    registryDependencies: ["elevated", "motion-tokens"],
    files: [
      {
        path: "ui/file-upload.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "expandable-list",
    type: "registry:ui",
    dependencies: ["framer-motion", "lucide-react"],
    registryDependencies: ["elevated", "motion-tokens"],
    files: [
      {
        path: "ui/expandable-list.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "live-queue",
    type: "registry:ui",
    dependencies: ["framer-motion", "lucide-react"],
    registryDependencies: ["elevated", "motion-tokens"],
    files: [
      {
        path: "ui/live-queue.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "achievement-toast",
    type: "registry:ui",
    dependencies: ["framer-motion", "lucide-react"],
    registryDependencies: ["elevated", "motion-tokens"],
    files: [
      {
        path: "ui/achievement-toast.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "context-menu",
    type: "registry:ui",
    dependencies: ["@base-ui/react", "framer-motion", "lucide-react"],
    registryDependencies: ["elevated", "motion-tokens"],
    files: [
      {
        path: "ui/context-menu.tsx",
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
    registryDependencies: ["elevated", "motion-tokens"],
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
    name: "animated-area-chart",
    type: "registry:ui",
    dependencies: [
      "framer-motion",
      "recharts",
      "tailwind-merge",
      "tailwind-variants",
    ],
    files: [
      {
        path: "ui/animated-area-chart.tsx",
        type: "registry:ui",
      },
      { path: "ui/chart-interaction.ts", type: "registry:ui" },
    ],
  },
  {
    name: "allocation-performance-chart",
    type: "registry:ui",
    dependencies: [
      "framer-motion",
      "lucide-react",
      "tailwind-merge",
      "tailwind-variants",
    ],
    files: [
      {
        path: "ui/allocation-performance-chart.tsx",
        type: "registry:ui",
      },
      { path: "ui/chart-interaction.ts", type: "registry:ui" },
    ],
  },
  {
    name: "sparkline-card",
    type: "registry:ui",
    dependencies: [
      "framer-motion",
      "lucide-react",
      "recharts",
      "tailwind-merge",
      "tailwind-variants",
    ],
    files: [
      {
        path: "ui/sparkline-card.tsx",
        type: "registry:ui",
      },
      { path: "ui/chart-interaction.ts", type: "registry:ui" },
    ],
  },
  {
    name: "signal-flow-chart",
    type: "registry:ui",
    dependencies: ["framer-motion", "tailwind-merge", "tailwind-variants"],
    files: [
      {
        path: "ui/signal-flow-chart.tsx",
        type: "registry:ui",
      },
      { path: "ui/chart-interaction.ts", type: "registry:ui" },
    ],
  },
  {
    name: "activity-heatmap-chart",
    type: "registry:ui",
    dependencies: ["framer-motion", "tailwind-merge", "tailwind-variants"],
    files: [
      {
        path: "ui/activity-heatmap-chart.tsx",
        type: "registry:ui",
      },
      { path: "ui/chart-interaction.ts", type: "registry:ui" },
    ],
  },
  {
    name: "candlestick-chart",
    type: "registry:ui",
    dependencies: ["framer-motion", "tailwind-merge", "tailwind-variants"],
    files: [
      {
        path: "ui/candlestick-chart.tsx",
        type: "registry:ui",
      },
      { path: "ui/chart-interaction.ts", type: "registry:ui" },
    ],
  },
  {
    name: "bubble-chart",
    type: "registry:ui",
    dependencies: ["framer-motion", "tailwind-merge", "tailwind-variants"],
    files: [
      {
        path: "ui/bubble-chart.tsx",
        type: "registry:ui",
      },
      { path: "ui/chart-interaction.ts", type: "registry:ui" },
    ],
  },
  {
    name: "activity-waveform-chart",
    type: "registry:ui",
    dependencies: ["framer-motion", "tailwind-merge", "tailwind-variants"],
    files: [
      {
        path: "ui/activity-waveform-chart.tsx",
        type: "registry:ui",
      },
      { path: "ui/chart-interaction.ts", type: "registry:ui" },
    ],
  },
  {
    name: "performance-waterfall-chart",
    type: "registry:ui",
    dependencies: ["framer-motion", "tailwind-merge", "tailwind-variants"],
    files: [
      {
        path: "ui/performance-waterfall-chart.tsx",
        type: "registry:ui",
      },
      { path: "ui/chart-interaction.ts", type: "registry:ui" },
    ],
  },
  {
    name: "threshold-band-chart",
    type: "registry:ui",
    dependencies: ["framer-motion", "tailwind-merge", "tailwind-variants"],
    files: [
      {
        path: "ui/threshold-band-chart.tsx",
        type: "registry:ui",
      },
      { path: "ui/chart-interaction.ts", type: "registry:ui" },
    ],
  },
  {
    name: "impact-priority-matrix",
    type: "registry:ui",
    dependencies: ["framer-motion", "tailwind-merge", "tailwind-variants"],
    files: [
      {
        path: "ui/impact-priority-matrix.tsx",
        type: "registry:ui",
      },
      { path: "ui/chart-interaction.ts", type: "registry:ui" },
    ],
  },
  {
    name: "resource-treemap-chart",
    type: "registry:ui",
    dependencies: ["framer-motion", "tailwind-merge", "tailwind-variants"],
    files: [
      {
        path: "ui/resource-treemap-chart.tsx",
        type: "registry:ui",
      },
      { path: "ui/chart-interaction.ts", type: "registry:ui" },
    ],
  },
  {
    name: "score-radar-chart",
    type: "registry:ui",
    dependencies: ["framer-motion", "tailwind-merge", "tailwind-variants"],
    files: [
      {
        path: "ui/score-radar-chart.tsx",
        type: "registry:ui",
      },
      { path: "ui/chart-interaction.ts", type: "registry:ui" },
    ],
  },
  {
    name: "motion-tabs",
    type: "registry:ui",
    dependencies: ["framer-motion", "tailwind-merge", "tailwind-variants"],
    registryDependencies: ["elevated", "motion-tokens"],
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
    registryDependencies: ["elevated", "motion-tokens"],
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
  {
    name: "otp-input",
    type: "registry:ui",
    dependencies: ["framer-motion", "tailwind-merge", "tailwind-variants"],
    registryDependencies: ["field"],
    files: [
      {
        path: "ui/otp-input.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "popover-card",
    type: "registry:ui",
    cssVars: liftCssVars,
    css: liftCss,
    dependencies: [
      "@base-ui/react",
      "class-variance-authority",
      "framer-motion",
    ],
    registryDependencies: ["elevated", "motion-tokens"],
    files: [
      {
        path: "ui/popover-card.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "sheet-panel",
    type: "registry:ui",
    dependencies: [
      "@base-ui/react",
      "class-variance-authority",
      "framer-motion",
      "lucide-react",
    ],
    registryDependencies: ["elevated", "motion-tokens"],
    files: [
      {
        path: "ui/sheet-panel.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "stacked-dialog",
    type: "registry:ui",
    dependencies: [
      "@base-ui/react",
      "class-variance-authority",
      "framer-motion",
      "lucide-react",
    ],
    registryDependencies: ["elevated", "motion-tokens"],
    files: [
      {
        path: "ui/stacked-dialog.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "surface-context",
    type: "registry:lib",
    files: [
      {
        path: "lib/surface-context.tsx",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "surface-classes",
    type: "registry:lib",
    files: [
      {
        path: "lib/surface-classes.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "motion-tokens",
    type: "registry:lib",
    dependencies: ["framer-motion"],
    files: [
      {
        path: "lib/motion-tokens.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "elevated",
    type: "registry:ui",
    registryDependencies: [
      "https://matos-ui.com/r/surface-context.json",
      "https://matos-ui.com/r/surface-classes.json",
    ],
    cssVars: { ...surfaceCssVars, theme: liftCssVars.theme },
    css: { ...surfaceCss, ...liftCss },
    files: [
      {
        path: "ui/elevated.tsx",
        type: "registry:ui",
      },
    ],
  },
];
