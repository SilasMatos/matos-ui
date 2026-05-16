"use client";

import { useState } from "react";
import {
  StatusPulseCard,
  type StatusPulseCardProps,
  type StatusPulseCardService,
} from "@/registry/new-york-v4/ui/status-pulse-card";

const services: Record<string, StatusPulseCardService[]> = {
  operational: [
    {
      name: "API Gateway",
      response: "82ms",
      status: "Operational",
      tone: "operational",
    },
    {
      name: "Database",
      response: "104ms",
      status: "Stable",
      tone: "operational",
    },
    {
      name: "Auth Service",
      response: "71ms",
      status: "Operational",
      tone: "operational",
    },
  ],
  monitoring: [
    {
      name: "API Gateway",
      response: "96ms",
      status: "Operational",
      tone: "operational",
    },
    {
      name: "Billing Queue",
      response: "242ms",
      status: "Monitoring",
      tone: "monitoring",
    },
    {
      name: "Auth Service",
      response: "84ms",
      status: "Operational",
      tone: "operational",
    },
  ],
  incident: [
    {
      name: "API Gateway",
      response: "138ms",
      status: "Operational",
      tone: "operational",
    },
    {
      name: "Auth Service",
      response: "612ms",
      status: "Incident",
      tone: "incident",
    },
    {
      name: "Billing Queue",
      response: "188ms",
      status: "Monitoring",
      tone: "monitoring",
    },
  ],
};

const variations = {
  operational: {
    label: "Operational",
    title: "All systems operational",
    description: "Latency is stable across all regions.",
    metricValue: 99.98,
    metricDescription: "Last 30 days",
    tone: "operational",
    services: services.operational,
  },
  monitoring: {
    label: "Monitoring",
    title: "Latency under review",
    description: "Queue throughput is being watched.",
    metricValue: 99.91,
    metricDescription: "Elevated queue wait",
    tone: "monitoring",
    services: services.monitoring,
  },
  incident: {
    label: "Incident",
    title: "Partial incident detected",
    description: "Sign-ins are degraded in one region.",
    metricValue: 96.42,
    metricDescription: "Response in progress",
    tone: "incident",
    services: services.incident,
  },
} satisfies Record<string, StatusPulseCardProps & { label: string }>;

type Variation = keyof typeof variations;

export default function StatusPulseCardDemo() {
  const [variation, setVariation] = useState<Variation>("operational");
  const current = variations[variation];

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="inline-flex rounded-2xl border border-border bg-secondary p-1">
        {(Object.keys(variations) as Variation[]).map((key) => (
          <button
            key={key}
            type="button"
            data-active={variation === key}
            onClick={() => setVariation(key)}
            className="rounded-xl px-3 py-1.5 text-muted-foreground text-xs font-medium transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[active=true]:bg-card data-[active=true]:text-foreground"
          >
            {variations[key].label}
          </button>
        ))}
      </div>

      <StatusPulseCard
        className="max-w-[420px]"
        title={current.title}
        description={current.description}
        metricValue={current.metricValue}
        metricSuffix="% uptime"
        metricDescription={current.metricDescription}
        tone={current.tone}
        services={current.services}
      />
    </div>
  );
}
