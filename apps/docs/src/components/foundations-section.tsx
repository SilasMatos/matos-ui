"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { MotionTiersDemo } from "@/components/motion-tiers-demo";
import { SurfaceLadderDemo } from "@/components/surface-ladder-demo";
import { Link } from "@/i18n/navigation";
import {
  liftVariants,
  staggerContainer,
} from "@/registry/new-york-v4/lib/motion-tokens";
import { Elevated } from "@/registry/new-york-v4/ui/elevated";

const container = staggerContainer("moderate");

/**
 * Both panels are `Elevated offset={1}`, so `liftVariants(1)` is not a taste
 * call — it is the tier `motionForOffset` already assigns to a surface that
 * lifts one step, which is the claim the right-hand column is busy making. The
 * y is raised from the shared 4px default because these are the two largest
 * surfaces on the page, and the docstring on `liftVariants` asks for exactly
 * that when 4px would read as a twitch.
 */
const panel = liftVariants(1, { y: 12 });
const heading = liftVariants(1, { y: 8 });

function Column({
  eyebrow,
  title,
  body,
  href,
  linkLabel,
  children,
}: {
  eyebrow: string;
  title: string;
  body: string;
  href: string;
  linkLabel: string;
  children: ReactNode;
}) {
  return (
    <motion.div variants={panel} className="h-full">
      <Elevated
        offset={1}
        className="flex h-full flex-col gap-6 rounded-3xl p-6 sm:p-8"
      >
        <div className="space-y-2">
          <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
            {eyebrow}
          </p>
          <h3 className="font-display font-semibold text-foreground text-xl tracking-tight">
            {title}
          </h3>
          <p className="text-pretty text-muted-foreground text-sm leading-relaxed">
            {body}
          </p>
        </div>

        {/* `min-w-0` on the growing half: the motion demo measures its own rail
         *  with a ResizeObserver, and a flex child that is allowed to size to
         *  its content would let that measurement push the column wider on the
         *  first frame instead of settling into it. */}
        <div className="flex min-w-0 flex-1 flex-col justify-center py-2">
          {children}
        </div>

        <Link
          href={href}
          className="group inline-flex items-center gap-1.5 text-muted-foreground text-xs transition-colors hover:text-foreground"
        >
          {linkLabel}
          <ArrowRight className="size-3.5 transition-transform ease-spring group-hover:translate-x-0.5" />
        </Link>
      </Elevated>
    </motion.div>
  );
}

/**
 * The two systems the rest of the registry is built on, shown rather than
 * described: a ladder of real surfaces naming its own tokens as the highlight
 * walks it, and the five spring tiers crossing one distance side by side.
 *
 * Both demos are ambient — they drive themselves, they stop when they leave the
 * viewport or the tab goes to the background, and they park on a representative
 * frame under `prefers-reduced-motion`.
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
        className="mx-auto max-w-5xl"
      >
        <div className="mb-10 max-w-2xl">
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
            className="mt-3 text-pretty text-base text-muted-foreground leading-relaxed"
          >
            {t("subtitle")}
          </motion.p>
        </div>

        <div className="grid items-stretch gap-4 md:grid-cols-2 md:gap-6">
          <Column
            eyebrow={t("surface.eyebrow")}
            title={t("surface.title")}
            body={t("surface.body")}
            href="/docs/foundations/elevated"
            linkLabel={t("surface.link")}
          >
            <SurfaceLadderDemo />
          </Column>

          <Column
            eyebrow={t("motion.eyebrow")}
            title={t("motion.title")}
            body={t("motion.body")}
            href="/docs/foundations/motion"
            linkLabel={t("motion.link")}
          >
            <MotionTiersDemo />
          </Column>
        </div>
      </motion.div>
    </section>
  );
}
