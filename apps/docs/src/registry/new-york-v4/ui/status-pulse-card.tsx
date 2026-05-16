"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import {
  Activity,
  CheckCircle2,
  CircleAlert,
  TriangleAlert,
} from "lucide-react";
import { type ComponentProps, type ReactNode, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

export const statusPulseCardVariants = tv({
  base: [
    "not-prose w-full overflow-hidden rounded-2xl border border-border",
    "bg-secondary p-2 text-foreground",
  ],
  variants: {
    size: {
      sm: "max-w-[340px]",
      md: "max-w-[420px]",
      lg: "max-w-[520px]",
    },
  },
  defaultVariants: {
    size: undefined,
  },
});

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.36,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const contentVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.08,
      staggerChildren: 0.055,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.28,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const serviceHover = {
  x: 2,
  transition: {
    duration: 0.16,
    ease: [0.4, 0, 0.2, 1],
  },
} as const;

const toneStyles = {
  operational: {
    label: "Operational",
    icon: CheckCircle2,
    pulse: "bg-primary",
    pulseAura: "bg-primary/15",
    indicator: "border-primary/20 bg-primary/10 text-primary",
    badge: "border-primary/20 bg-primary/10 text-primary",
    dot: "bg-primary",
  },
  monitoring: {
    label: "Monitoring",
    icon: Activity,
    pulse: "bg-muted-foreground",
    pulseAura: "bg-muted-foreground/15",
    indicator: "border-border/70 bg-muted text-muted-foreground",
    badge: "border-border/70 bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  incident: {
    label: "Incident",
    icon: TriangleAlert,
    pulse: "bg-destructive",
    pulseAura: "bg-destructive/15",
    indicator: "border-destructive/20 bg-destructive/10 text-destructive",
    badge: "border-destructive/20 bg-destructive/10 text-destructive",
    dot: "bg-destructive",
  },
} as const;

export type StatusPulseCardTone = keyof typeof toneStyles;

export type StatusPulseCardService = {
  id?: string;
  name: ReactNode;
  response: ReactNode;
  status: ReactNode;
  tone?: StatusPulseCardTone;
};

export type StatusPulseCardProps = ComponentProps<"div"> &
  VariantProps<typeof statusPulseCardVariants> & {
    label?: ReactNode;
    title?: ReactNode;
    description?: ReactNode;
    tone?: StatusPulseCardTone;
    metricValue?: number;
    metricSuffix?: string;
    metricDescription?: ReactNode;
    metricDecimals?: number;
    services?: StatusPulseCardService[];
  };

const defaultServices: StatusPulseCardService[] = [
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
  {
    name: "Billing Queue",
    response: "128ms",
    status: "Monitoring",
    tone: "monitoring",
  },
];

export function StatusPulseCard({
  className,
  size,
  label = "SYSTEM STATUS",
  title = "All systems operational",
  description = "API latency is stable across all regions.",
  tone = "operational",
  metricValue = 99.98,
  metricSuffix = "% uptime",
  metricDescription = "Measured over the last 30 days",
  metricDecimals = 2,
  services = defaultServices,
  ...props
}: StatusPulseCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const toneStyle = toneStyles[tone];
  const StatusIcon = toneStyle.icon;

  return (
    <div
      data-slot="status-pulse-card"
      className={twMerge(statusPulseCardVariants({ size }), className)}
      {...props}
    >
      <motion.div
        variants={shouldReduceMotion ? undefined : cardVariants}
        initial={shouldReduceMotion ? false : "hidden"}
        animate="visible"
      >
        <div className="px-1.5 pb-1.5 pt-0.5">
          <motion.p
            variants={shouldReduceMotion ? undefined : itemVariants}
            className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground"
          >
            {label}
          </motion.p>
          <motion.div
            variants={shouldReduceMotion ? undefined : itemVariants}
            className="mt-2 flex items-start justify-between gap-3"
          >
            <div className="min-w-0">
              <h3 className="text-[13px] font-semibold leading-4 text-foreground">
                {title}
              </h3>
              <p className="mt-0.5 line-clamp-1 text-muted-foreground text-xs leading-4">
                {description}
              </p>
            </div>
            <span
              className={twMerge(
                "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-medium leading-none",
                toneStyle.badge,
              )}
            >
              <StatusIcon className="size-3" aria-hidden="true" />
              {toneStyle.label}
            </span>
          </motion.div>
        </div>

        <motion.div
          data-slot="status-pulse-card-panel"
          variants={shouldReduceMotion ? undefined : contentVariants}
          initial={shouldReduceMotion ? false : "hidden"}
          animate="visible"
          whileHover={shouldReduceMotion ? undefined : { y: -1 }}
          className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm transition-colors duration-200 hover:bg-muted/30"
        >
          <div className="flex items-center gap-2.5 border-border/60 border-b p-2.5">
            <StatusPulseIndicator tone={tone} />
            <div className="min-w-0 flex-1">
              <motion.div
                variants={shouldReduceMotion ? undefined : itemVariants}
                className="flex items-baseline gap-1.5"
              >
                <AnimatedMetricValue
                  value={metricValue}
                  suffix={metricSuffix}
                  decimals={metricDecimals}
                />
              </motion.div>
              <motion.p
                variants={shouldReduceMotion ? undefined : itemVariants}
                className="mt-0.5 truncate text-muted-foreground text-xs"
              >
                {metricDescription}
              </motion.p>
            </div>
          </div>

          <motion.ul
            data-slot="status-pulse-card-services"
            variants={shouldReduceMotion ? undefined : contentVariants}
            className="space-y-0.5 p-1.5"
          >
            {services.map((service, index) => (
              <StatusPulseServiceRow
                key={service.id ?? index}
                service={service}
              />
            ))}
          </motion.ul>
        </motion.div>
      </motion.div>
    </div>
  );
}

function StatusPulseIndicator({ tone }: { tone: StatusPulseCardTone }) {
  const shouldReduceMotion = useReducedMotion();
  const toneStyle = toneStyles[tone];

  return (
    <span
      data-slot="status-pulse-card-indicator"
      className={twMerge(
        "relative flex size-8 shrink-0 items-center justify-center rounded-full border",
        toneStyle.indicator,
      )}
    >
      <motion.span
        aria-hidden="true"
        initial={shouldReduceMotion ? false : { scale: 0.82, opacity: 0.6 }}
        animate={
          shouldReduceMotion
            ? undefined
            : { scale: [0.82, 1.45, 1.45], opacity: [0.35, 0, 0] }
        }
        transition={{
          duration: 1.8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeOut",
        }}
        className={twMerge("absolute size-5 rounded-full", toneStyle.pulseAura)}
      />
      <span
        aria-hidden="true"
        className={twMerge("relative size-2 rounded-full", toneStyle.pulse)}
      />
    </span>
  );
}

type AnimatedMetricValueProps = {
  value: number;
  suffix?: string;
  decimals?: number;
};

function AnimatedMetricValue({
  value,
  suffix,
  decimals = 2,
}: AnimatedMetricValueProps) {
  const shouldReduceMotion = useReducedMotion();
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, {
    stiffness: 86,
    damping: 22,
    mass: 0.9,
  });
  const display = useTransform(spring, (latest) =>
    formatMetricValue(latest, decimals, suffix),
  );

  useEffect(() => {
    motionValue.set(value);
  }, [motionValue, value]);

  if (shouldReduceMotion) {
    return (
      <span className="text-xl font-semibold leading-none text-foreground">
        {formatMetricValue(value, decimals, suffix)}
      </span>
    );
  }

  return (
    <motion.span
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="text-xl font-semibold leading-none text-foreground"
    >
      {display}
    </motion.span>
  );
}

function StatusPulseServiceRow({
  service,
}: {
  service: StatusPulseCardService;
}) {
  const shouldReduceMotion = useReducedMotion();
  const tone = toneStyles[service.tone ?? "operational"];
  const ServiceIcon =
    service.tone === "incident"
      ? CircleAlert
      : service.tone === "monitoring"
        ? Activity
        : CheckCircle2;

  return (
    <motion.li
      data-slot="status-pulse-card-service"
      variants={shouldReduceMotion ? undefined : itemVariants}
      whileHover={shouldReduceMotion ? undefined : serviceHover}
      className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors duration-200 hover:bg-muted/30"
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <motion.span
          aria-hidden="true"
          whileHover={shouldReduceMotion ? undefined : { scale: 1.06 }}
          className={twMerge(
            "flex size-6 shrink-0 items-center justify-center rounded-full border transition-transform duration-200 group-hover:scale-105",
            "[&_svg]:size-3.5",
            tone.indicator,
          )}
        >
          <ServiceIcon />
        </motion.span>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium leading-4 text-foreground">
            {service.name}
          </p>
          <p className="mt-0.5 text-muted-foreground text-[11px] leading-4">
            {service.response}
          </p>
        </div>
      </div>
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/70 bg-secondary px-2 py-1 text-[10px] font-medium text-muted-foreground leading-none transition-colors duration-200 group-hover:bg-muted group-hover:text-foreground">
        <span
          aria-hidden="true"
          className={twMerge("size-1.5 rounded-full", tone.dot)}
        />
        {service.status}
      </span>
    </motion.li>
  );
}

function formatMetricValue(value: number, decimals: number, suffix?: string) {
  return `${value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}${suffix ?? ""}`;
}

export { AnimatedMetricValue, StatusPulseIndicator, StatusPulseServiceRow };
