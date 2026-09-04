"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { type ComponentProps, type ReactNode, useEffect, useId } from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

export const metricCardVariants = tv({
  base: [
    " not-prose w-full overflow-hidden rounded-2xl border border-border",
    "bg-secondary text-foreground",
  ],
  variants: {
    size: {
      sm: "max-w-[280px]",
      md: "max-w-[340px]",
      lg: "max-w-[400px]",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const fadeUp = (delay = 0) =>
  ({
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
      delay,
    },
  }) as const;

export type MetricCardProps = ComponentProps<"div"> &
  VariantProps<typeof metricCardVariants> & {
    label: string;
    value: number;
    prefix?: string;
    suffix?: string;
    decimals?: number;
    trend?: {
      value: number;
      label?: string;
    };
    sparkline?: number[];
    footer?: ReactNode;
  };

export function MetricCard({
  className,
  size,
  label,
  value,
  prefix,
  suffix,
  decimals = 0,
  trend,
  sparkline,
  footer,
  ...props
}: MetricCardProps) {
  return (
    <div
      data-slot="metric-card"
      className={twMerge(metricCardVariants({ size }), className)}
      {...props}
    >
      <div className="px-4 py-1.5 ">
        <motion.span
          {...fadeUp(0)}
          className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground"
        >
          {label}
        </motion.span>
      </div>

      <div className="mx-1.5 mb-1.5 overflow-hidden rounded-xl bg-card">
        <div className="space-y-3 p-4 pb-1">
          <div className="flex items-baseline justify-between gap-1.5">
            <AnimatedNumber
              value={value}
              prefix={prefix}
              suffix={suffix}
              decimals={decimals}
            />

            {trend && <TrendBadge value={trend.value} label={trend.label} />}
          </div>
        </div>

        {sparkline && sparkline.length > 1 && (
          <Sparkline data={sparkline} trend={trend?.value} />
        )}
      </div>
    </div>
  );
}

type AnimatedNumberProps = {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
};

function AnimatedNumber({
  value,
  prefix,
  suffix,
  decimals = 0,
}: AnimatedNumberProps) {
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, {
    stiffness: 80,
    damping: 20,
    mass: 1,
  });
  const display = useTransform(spring, (v) => {
    const formatted = v.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return `${prefix ?? ""}${formatted}${suffix ?? ""}`;
  });

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  return (
    <motion.span
      {...fadeUp(0.08)}
      className="text-xl font-semibold leading-none tracking-[-0.03em]"
    >
      <motion.span>{display}</motion.span>
    </motion.span>
  );
}

type TrendBadgeProps = {
  value: number;
  label?: string;
};

function TrendBadge({ value, label }: TrendBadgeProps) {
  const isPositive = value > 0;
  const isNeutral = value === 0;

  const Icon = isNeutral ? Minus : isPositive ? ArrowUp : ArrowDown;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, x: -4 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 22,
        delay: 0.5,
      }}
      className={twMerge(
        "ml-1 flex items-center gap-0.5 rounded-full px-2 ",
        "text-[11px] font-medium",
        isPositive && "bg-chart-2/10 text-chart-2",
        !isPositive && !isNeutral && "bg-destructive/10 text-destructive",
        isNeutral && "bg-muted text-muted-foreground",
      )}
    >
      <Icon className="size-3" strokeWidth={2.5} />
      <span>
        {isPositive ? "+" : ""}
        {value}%
      </span>
      {label && (
        <span className="ml-0.5 text-[10px] text-muted-foreground/80">
          {label}
        </span>
      )}
    </motion.div>
  );
}

type SparklineProps = {
  data: number[];
  trend?: number;
};

function Sparkline({ data, trend = 0 }: SparklineProps) {
  const width = 320;
  const height = 64;
  const padding = 0;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((v - min) / range) * (height - padding * 2);
    return { x, y };
  });

  const pathD = points
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = points[i - 1];
      const cpx1 = prev.x + (p.x - prev.x) * 0.4;
      const cpx2 = prev.x + (p.x - prev.x) * 0.6;
      return `C ${cpx1} ${prev.y} ${cpx2} ${p.y} ${p.x} ${p.y}`;
    })
    .join(" ");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  const strokeColor =
    trend > 0
      ? "var(--chart-2)"
      : trend < 0
        ? "var(--destructive)"
        : "var(--muted-foreground)";

  // useId (not Math.random) so the id matches between server and client
  // render; colons stripped since `url(#...)` can't reference them.
  const rawId = useId();
  const gradientId = `sparkline-gradient-${rawId.replace(/:/g, "")}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.35, duration: 0.5 }}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        preserveAspectRatio="none"
      >
        <title>Trend sparkline chart</title>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity={0.12} />
            <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
          </linearGradient>
        </defs>

        <motion.path
          d={areaD}
          fill={`url(#${gradientId})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        />

        <motion.path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: 1.2,
            ease: [0.16, 1, 0.3, 1],
            delay: 0.3,
          }}
        />

        <motion.circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r={3}
          fill={strokeColor}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.4, type: "spring", stiffness: 400 }}
        />
      </svg>
    </motion.div>
  );
}

export { AnimatedNumber, TrendBadge, Sparkline };
