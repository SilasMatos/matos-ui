export const chartCategories = [
  "All",
  "Area",
  "Line",
  "Bar",
  "Bubble",
  "Candles",
  "Flow",
  "Grid",
  "Radial",
  "Waterfall",
  "Band",
  "Matrix",
  "Map",
] as const;

export type ChartCategory = (typeof chartCategories)[number];

export const chartCollection = [
  {
    id: "animated-area-chart",
    name: "Animated Area Chart",
    description: "Masked area path with active dots and a theme-aware tooltip.",
    category: "Area",
    installable: true,
  },
  {
    id: "allocation-performance-chart",
    name: "Allocation Performance Chart",
    description:
      "Inset allocation columns with textured tracks and expressive fill states.",
    category: "Bar",
    installable: true,
  },
  {
    id: "sparkline-card",
    name: "Sparkline Card",
    description:
      "Metric card with a dense trend line, area mask and trend badge.",
    category: "Line",
    installable: true,
  },
  {
    id: "signal-flow-chart",
    name: "Signal Flow Chart",
    description:
      "Curved channel cables with particles flowing from a source bus to value-scaled sinks.",
    category: "Flow",
    installable: true,
  },
  {
    id: "activity-heatmap-chart",
    name: "Activity Heatmap Chart",
    description:
      "Calendar-style activity grid with a diagonal reveal wave, hover tooltip and live recent cells.",
    category: "Grid",
    installable: true,
  },
  {
    id: "candlestick-chart",
    name: "Candlestick Chart",
    description:
      "OHLC price candles with bullish/bearish tones, growing bodies and an interactive tooltip.",
    category: "Candles",
    installable: true,
  },
  {
    id: "bubble-chart",
    name: "Bubble Chart",
    description:
      "Weighted gradient bubbles that scale in, float gently and reveal values on hover.",
    category: "Bubble",
    installable: true,
  },
  {
    id: "activity-waveform-chart",
    name: "Activity Waveform Chart",
    description:
      "Dense spending waveform with a metric header, hover tooltip and a split ratio bar.",
    category: "Bar",
    installable: true,
  },
  {
    id: "performance-waterfall-chart",
    name: "Performance Waterfall Chart",
    description:
      "Gantt-style resource timeline with staggered bar reveals, a milestone marker and slowest-step highlight.",
    category: "Waterfall",
    installable: true,
  },
  {
    id: "threshold-band-chart",
    name: "Threshold Band Chart",
    description:
      "Quality bands (Good / Needs improvement / Poor) with a sliding diamond marker and active-zone glow.",
    category: "Band",
    installable: true,
  },
  {
    id: "impact-priority-matrix",
    name: "Impact Priority Matrix",
    description:
      "2×2 effort–impact matrix with spring-in dots, quadrant labels and a detail tooltip on hover.",
    category: "Matrix",
    installable: true,
  },
  {
    id: "resource-treemap-chart",
    name: "Resource Treemap Chart",
    description:
      "Proportional block layout with radial gradient fills, scale-in animation and percentage tooltips.",
    category: "Map",
    installable: true,
  },
  {
    id: "score-radar-chart",
    name: "Score Radar Chart",
    description:
      "Multi-axis radar polygon with pathLength reveal, ring grid and pulsing vertex nodes.",
    category: "Radial",
    installable: true,
  },
  {
    id: "risk-score-gauge",
    name: "Risk Score Gauge",
    description:
      "A semi-radial risk meter with striped remainder, glow marker and score label.",
    category: "Radial",
    installable: false,
  },
] as const;

export type ChartItem = (typeof chartCollection)[number];
export type ChartId = ChartItem["id"];

export function getChartById(id: string) {
  return chartCollection.find((chart) => chart.id === id);
}
