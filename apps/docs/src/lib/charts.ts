export const chartCategories = [
  "All",
  "Analytics",
  "Revenue",
  "Progress",
  "Comparison",
  "Realtime",
] as const;

export type ChartCategory = (typeof chartCategories)[number];

export const chartCollection = [
  {
    id: "animated-area-chart",
    name: "Animated Area Chart",
    description: "Masked area path with active dots and a theme-aware tooltip.",
    category: "Analytics",
    badge: "Analytics",
    installable: true,
  },
  {
    id: "interactive-bar-chart",
    name: "Interactive Bar Chart",
    description: "Focusable bars with custom SVG shapes and value labels.",
    category: "Analytics",
    badge: "Analytics",
    installable: true,
  },
  {
    id: "allocation-performance-chart",
    name: "Allocation Performance Chart",
    description:
      "Inset allocation columns with textured tracks and expressive fill states.",
    category: "Analytics",
    badge: "Analytics",
    installable: false,
  },
  {
    id: "radial-metric-chart",
    name: "Radial Metric Chart",
    description:
      "A compact radial metric with dash reveal and active endpoint.",
    category: "Progress",
    badge: "Progress",
    installable: true,
  },
  {
    id: "sparkline-card",
    name: "Sparkline Card",
    description:
      "Metric card with a dense trend line, area mask and trend badge.",
    category: "Analytics",
    badge: "Analytics",
    installable: true,
  },
  {
    id: "donut-progress-chart",
    name: "Donut Progress Chart",
    description: "Segmented donut preview for completion and quota states.",
    category: "Progress",
    badge: "Progress",
    installable: false,
  },
  {
    id: "risk-score-gauge",
    name: "Risk Score Gauge",
    description:
      "A semi-radial risk meter with striped remainder, glow marker and score label.",
    category: "Progress",
    badge: "Progress",
    installable: false,
  },
  {
    id: "stacked-revenue-chart",
    name: "Stacked Revenue Chart",
    description: "Layered revenue bars with subtle patterns for mixed series.",
    category: "Revenue",
    badge: "Revenue",
    installable: false,
  },
  {
    id: "comparison-chart",
    name: "Comparison Chart",
    description: "Dual-line comparison with active rings and floating deltas.",
    category: "Comparison",
    badge: "Comparison",
    installable: false,
  },
  {
    id: "realtime-activity-chart",
    name: "Realtime Activity Chart",
    description: "Streaming activity pulses with animated internal markers.",
    category: "Realtime",
    badge: "Realtime",
    installable: false,
  },
] as const;

export type ChartItem = (typeof chartCollection)[number];
export type ChartId = ChartItem["id"];

export function getChartById(id: string) {
  return chartCollection.find((chart) => chart.id === id);
}
