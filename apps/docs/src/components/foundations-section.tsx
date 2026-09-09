"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { SurfaceLadderStack } from "@/components/surface-ladder-stack";
import { Link } from "@/i18n/navigation";
import {
  liftVariants,
  staggerContainer,
} from "@/registry/new-york-v4/lib/motion-tokens";

const header = staggerContainer("moderate");
const line = liftVariants(1, { y: 8 });

function DocLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group ml-1 inline-flex items-center gap-1 whitespace-nowrap font-medium text-foreground/80 transition-colors hover:text-foreground"
    >
      {label}
      <ArrowRight className="size-3 transition-transform ease-spring group-hover:translate-x-0.5" />
    </Link>
  );
}

/**
 * The two systems the registry stands on, stated as one: a component declares
 * how far it lifts above its background, and that single number picks both its
 * shade on the elevation ladder and the spring it moves on (DESIGN §1).
 *
 * The visual is `SurfaceLadderStack` — three real surfaces at three conventional
 * offsets, each entering on the tier `motionForOffset` reads off its offset, so
 * you watch the same decision resolve into a shade and a timing at once. The
 * blurbs below carry the specifics; the stack carries the proof.
 */
export function FoundationsSection() {
  const t = useTranslations("foundations");

  return (
    <section className="relative bg-background px-4 py-20 sm:px-6 md:py-28">
      <div className="mx-auto max-w-xl">
        <motion.header
          variants={header}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center"
        >
          <motion.span
            variants={line}
            className="inline-flex rounded-full bg-muted px-3 py-1 font-medium text-[11px] text-muted-foreground uppercase tracking-widest"
          >
            {t("badge")}
          </motion.span>
          <motion.h2
            variants={line}
            className="mt-4 text-balance font-display font-semibold text-3xl text-foreground tracking-tight md:text-4xl"
          >
            {t("title")}
          </motion.h2>
          <motion.p
            variants={line}
            className="mx-auto mt-3 text-pretty text-base text-muted-foreground leading-relaxed"
          >
            {t("subtitle")}
          </motion.p>
        </motion.header>

        <div className="mt-12">
          <SurfaceLadderStack />
          <p className="mx-auto mt-6 max-w-sm text-pretty text-center text-muted-foreground text-xs leading-relaxed">
            {t("stackNote")}
          </p>
        </div>

        <dl className="mt-12 space-y-5 text-sm">
          <div>
            <dt className="font-medium text-foreground">
              {t("surface.label")}
            </dt>
            <dd className="mt-1 text-pretty text-muted-foreground leading-relaxed">
              {t("surface.blurb")}
              <DocLink
                href="/docs/foundations/elevated"
                label={t("surface.link")}
              />
            </dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">{t("motion.label")}</dt>
            <dd className="mt-1 text-pretty text-muted-foreground leading-relaxed">
              {t("motion.blurb")}
              <DocLink
                href="/docs/foundations/motion"
                label={t("motion.link")}
              />
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
