"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/lib/config";

export function SiteFooter() {
  const t = useTranslations("footer");

  const navigation = [
    { label: t("home"), href: "/" },
    { label: t("docs"), href: "/docs" },
    { label: t("components"), href: "/docs/components" },
  ];

  const social = [
    { label: t("github"), href: siteConfig.links.github, external: true },
    { label: t("twitter"), href: siteConfig.links.twitter, external: true },
  ];

  return (
    <footer className="relative overflow-hidden bg-card">
      <div className="mx-auto max-w-5xl px-6 pt-16 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
          className="grid grid-cols-1 gap-12 sm:grid-cols-[1fr_auto_auto] sm:gap-16"
        >
          <div className="flex flex-col gap-3">
            <p className="text-xs text-muted-foreground">{t("openSource")}</p>
            <a
              href={`mailto:contact@${siteConfig.url.replace("https://", "")}`}
              className="text-lg font-medium text-card-foreground/80 transition-colors hover:text-card-foreground"
            >
              {siteConfig.url.replace("https://", "")}
            </a>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t("navigate")}
            </p>
            <nav className="flex flex-col gap-2">
              {navigation.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-card-foreground/70 transition-colors hover:text-card-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t("social")}
            </p>
            <nav className="flex flex-col gap-2">
              {social.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-1 text-sm font-medium text-card-foreground/70 transition-colors hover:text-card-foreground"
                >
                  {link.label}
                  <svg
                    aria-hidden="true"
                    className="size-3 text-muted-foreground/50 transition-colors group-hover:text-muted-foreground"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3.5 2h6.5v6.5M9.5 2.5L2 10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              ))}
            </nav>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 1.2, ease: [0.25, 0.4, 0.25, 1] }}
          className="mt-16 mb-12 select-none text-center"
        >
          <h2 className="font-logo text-6xl font-bold tracking-tighter text-foreground/5 sm:text-8xl md:text-9xl">
            matos<span className="text-foreground/10">ui</span>
          </h2>
        </motion.div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground/60">
            &copy;{new Date().getFullYear()} {siteConfig.name}. {t("rights")}
          </p>
          <div className="flex gap-6">
            <Link
              href="/docs"
              className="text-xs text-muted-foreground/60 transition-colors hover:text-muted-foreground"
            >
              {t("privacy")}
            </Link>
            <Link
              href="/docs"
              className="text-xs text-muted-foreground/60 transition-colors hover:text-muted-foreground"
            >
              {t("terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
