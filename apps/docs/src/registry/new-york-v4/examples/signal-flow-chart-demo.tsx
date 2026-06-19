"use client";

import { SignalFlowChart } from "@/registry/new-york-v4/ui/signal-flow-chart";

const channels = [
  { label: "API Gateway", value: 92, hint: "Edge ingress" },
  { label: "Auth Service", value: 58, tone: "chart-4", hint: "Token mint" },
  { label: "Media CDN", value: 76, hint: "Asset stream" },
  { label: "Webhooks", value: 34, tone: "destructive", hint: "Outbound" },
  { label: "Analytics", value: 61, hint: "Event sink" },
];

export default function SignalFlowChartDemo() {
  return (
    <div className="flex w-full justify-center">
      <SignalFlowChart
        data={channels}
        title="Signal Flow"
        description="Live throughput across service channels"
        valueFormatter={(value) => `${Math.round(value)}%`}
      />
    </div>
  );
}
