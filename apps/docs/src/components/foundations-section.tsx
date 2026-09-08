"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { SurfaceMotionDemo } from "@/components/surface-motion-demo";
import { Link } from "@/i18n/navigation";
import {
  liftVariants,
  staggerContainer,
} from "@/registry/new-york-v4/lib/motion-tokens";
import { Elevated } from "@/registry/new-york-v4/ui/elevated";

const container = staggerContainer("moderate");

/**
 * The panel is `Elevated offset={1}`, so `liftVariants(1)` is not a taste call —
 * it is the tier `motionForOffset` assigns a surface that lifts one step, which
 * is the claim the demo inside it is making. The y is raised from the shared 4px
 * default because this is the largest surface on the page and 4px would read as
 * a twitch.
 */
const panel = liftVariants(1, { y: 12 });
const heading = liftVariants(1, { y: 8 });

function DocLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1.5 text-muted-foreground text-xs transition-colors hover:text-foreground"
    >
      {label}
      <ArrowRight className="size-3.5 transition-transform ease-spring group-hover:translate-x-0.5" />
    </Link>
  );
}

/**
 * The two systems the registry is built on, shown as one thing rather than
 * argued across two columns: a chain of real surfaces nesting a step apart up
 * the elevation ladder, each opening on the spring `motionForOffset` reads off
 * its depth. §1's claim — elevation and motion are the same decision, told
 * twice — made literal in a single object.
 *
 * The demo is ambient: it drives itself, stops off screen or in a background
 * tab, and parks fully open under `prefers-reduced-motion`.
 */
export function FoundationsSection() {
  const t = useTranslations("foundations");

  return (
    <section className="relative bg-background px-4 py-20 sm:px-6 md:py-28">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="mx-auto max-w-3xl"
      >
        <div className="mb-10 text-center">
          <motion.span
            variants={heading}
            className="inline-flex rounded-full bg-muted px-3 py-1 font-medium text-[11px] text-muted-foreground uppercase tracking-widest"
          >
            {t("badge")}
          </motion.span>
          <motion.h2
            variants={heading}
            className="mt-4 text-balance font-display font-semibold text-3xl text-foreground tracking-tight md:text-4xl"
          >
            {t("title")}
          </motion.h2>
          <motion.p
            variants={heading}
            className="mx-auto mt-3 max-w-xl text-pretty text-base text-muted-foreground leading-relaxed"
          >
            {t("subtitle")}
          </motion.p>
        </div>

        <motion.div variants={panel}>
          <Elevated
            offset={1}
            className="flex flex-col gap-6 rounded-3xl p-6 sm:p-8"
          >
            <div className="py-2">
              <SurfaceMotionDemo />
            </div>

            <p className="mx-auto max-w-md text-pretty text-center text-muted-foreground text-xs leading-relaxed">
              {t("demo.caption")}
            </p>

            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              <DocLink
                href="/docs/foundations/elevated"
                label={t("demo.surfaceLink")}
              />
              <DocLink
                href="/docs/foundations/motion"
                label={t("demo.motionLink")}
              />
            </div>
          </Elevated>
        </motion.div>
      </motion.div>
    </section>
  );
}
