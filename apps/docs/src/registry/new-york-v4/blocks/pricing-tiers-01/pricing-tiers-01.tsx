"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

import {
  revealVariants,
  spring,
  staggerContainer,
  withReducedMotion,
} from "@/registry/new-york-v4/lib/motion-tokens";
import { surfaceClasses } from "@/registry/new-york-v4/lib/surface-classes";
import { SurfaceProvider } from "@/registry/new-york-v4/lib/surface-context";
import { Badge } from "@/registry/new-york-v4/ui/badge";
import { Button } from "@/registry/new-york-v4/ui/button";
import { Elevated } from "@/registry/new-york-v4/ui/elevated";

type Billing = "monthly" | "annual";

type Tier = {
  id: string;
  name: string;
  blurb: string;
  monthly: number;
  annual: number;
  offset: 1 | 2;
  featured?: boolean;
  cta: string;
  features: string[];
};

const TIERS: Tier[] = [
  {
    id: "starter",
    name: "Starter",
    blurb: "For a side project finding its shape.",
    monthly: 0,
    annual: 0,
    offset: 1,
    cta: "Start free",
    features: ["1 workspace", "Community support", "7-day history"],
  },
  {
    id: "pro",
    name: "Pro",
    blurb: "For a team shipping every week.",
    monthly: 19,
    annual: 15,
    offset: 2,
    featured: true,
    cta: "Choose Pro",
    features: [
      "Unlimited workspaces",
      "Priority support",
      "Unlimited history",
      "Audit log",
    ],
  },
  {
    id: "team",
    name: "Team",
    blurb: "For an org that needs the controls.",
    monthly: 49,
    annual: 39,
    offset: 1,
    cta: "Choose Team",
    features: ["SSO & SCIM", "Roles & permissions", "Dedicated success"],
  },
];

/**
 * A pricing table that puts the elevation ladder to work.
 *
 * The section is the page background (level 1). The two outer tiers are
 * `Elevated` `offset={1}`; the featured tier is `offset={2}`, so it sits a full
 * rung higher than its neighbours — raised by fill in dark mode and by shadow
 * in light, with no fixed background anywhere. All three lift another step
 * under the cursor via `hoverLift`.
 *
 * The billing toggle is a shared-`layoutId` pill on the `moderate` tier; each
 * price swaps on a short slide keyed to the billing choice. The grid reveals on
 * scroll with `revealVariants` + a `staggerContainer`, and every one of those
 * is dropped to a plain crossfade under `prefers-reduced-motion`.
 */
export function PricingTiers01() {
  const reduce = !!useReducedMotion();
  const [billing, setBilling] = useState<Billing>("monthly");

  const card = revealVariants({ y: 16, blur: 4 });
  const cardVariant = reduce ? withReducedMotion(card) : card;

  return (
    <SurfaceProvider value={1}>
      <section
        data-slot="pricing-tiers-01"
        className={twMerge(
          "@container/pricing w-full rounded-2xl p-5 text-foreground @xl/pricing:p-8",
          surfaceClasses(1),
        )}
      >
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <h2 className="font-semibold text-2xl tracking-tight">
            Priced to grow with you
          </h2>
          <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
            Every plan reads its own surface. Switch billing and only the number
            moves.
          </p>

          <div className="mt-5 flex items-center gap-1 rounded-full border border-border/60 bg-muted/50 p-1">
            <span className="sr-only">Billing period</span>
            {(["monthly", "annual"] as const).map((period) => {
              const isActive = billing === period;
              return (
                <button
                  key={period}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setBilling(period)}
                  className={twMerge(
                    "relative rounded-full px-3.5 py-1.5 font-medium text-xs capitalize outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                    isActive ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {isActive ? (
                    <motion.span
                      layoutId="pricing-billing-pill"
                      aria-hidden="true"
                      transition={reduce ? { duration: 0 } : spring.moderate}
                      className="absolute inset-0 rounded-full border border-border bg-background shadow-xs"
                    />
                  ) : null}
                  <span className="relative z-10">{period}</span>
                  {period === "annual" ? (
                    <span className="relative z-10 ml-1.5 text-[10px] text-primary">
                      -20%
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <motion.div
          className="mx-auto mt-8 grid max-w-5xl gap-4 @2xl/pricing:grid-cols-3 @2xl/pricing:items-start"
          variants={staggerContainer("slow")}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {TIERS.map((tier) => {
            const price = billing === "monthly" ? tier.monthly : tier.annual;
            return (
              <motion.div key={tier.id} variants={cardVariant}>
                <Elevated
                  offset={tier.offset}
                  hoverLift
                  className={twMerge(
                    "flex h-full flex-col gap-5 rounded-2xl p-5",
                    tier.featured &&
                      "ring-1 ring-primary/25 @2xl/pricing:-translate-y-2",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-base tracking-tight">
                        {tier.name}
                      </p>
                      <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
                        {tier.blurb}
                      </p>
                    </div>
                    {tier.featured ? (
                      <Badge variant="secondary" size="sm" dot pulse>
                        Popular
                      </Badge>
                    ) : null}
                  </div>

                  <div className="flex items-end gap-1">
                    <span className="text-muted-foreground text-sm">$</span>
                    <div className="relative h-9 overflow-hidden">
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                          key={price}
                          initial={
                            reduce ? { opacity: 0 } : { opacity: 0, y: 14 }
                          }
                          animate={{ opacity: 1, y: 0 }}
                          exit={
                            reduce
                              ? { opacity: 0 }
                              : {
                                  opacity: 0,
                                  y: -14,
                                  transition: spring.fast.exit,
                                }
                          }
                          transition={
                            reduce ? { duration: 0.12 } : spring.moderate
                          }
                          className="block font-semibold text-3xl tabular-nums tracking-tight"
                        >
                          {price}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                    <span className="pb-1 text-muted-foreground text-xs">
                      / mo
                    </span>
                  </div>

                  <ul className="flex-1 space-y-2">
                    {tier.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-sm"
                      >
                        <Check
                          className="mt-0.5 size-3.5 shrink-0 text-primary"
                          aria-hidden="true"
                        />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={tier.featured ? "default" : "outline"}
                    className="w-full"
                  >
                    {tier.cta}
                  </Button>
                </Elevated>
              </motion.div>
            );
          })}
        </motion.div>
      </section>
    </SurfaceProvider>
  );
}
