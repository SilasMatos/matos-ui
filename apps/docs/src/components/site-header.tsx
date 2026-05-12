"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import logoLightSrc from "@/assets/logo-black.png";
import logoDarkSrc from "@/assets/logo-white.png";
import { CommandMenu } from "@/components/command-menu";
import { GitHubLink } from "@/components/github-link";
import { LinkedIn } from "@/components/icons/linkedin";
import { MainNav } from "@/components/main-nav";
import { MobileNav } from "@/components/mobile-nav";
import { ModeSwitcher } from "@/components/mode-switcher";
import { Link, usePathname } from "@/i18n/navigation";
import { siteConfig } from "@/lib/config";
import type { DocsPageTree } from "@/lib/page-tree";
import { Button } from "@/registry/new-york-v4/ui/button";
import { Separator } from "@/registry/new-york-v4/ui/separator";
import { XformerlyTwitter } from "@/registry/new-york-v4/ui/x-icon";

export function SiteHeader({ pageTree }: { pageTree: DocsPageTree }) {
  const pathname = usePathname();
  const tNav = useTranslations("nav");
  const isHome = pathname === "/";

  const navItems = siteConfig.navItems.map((item) => ({
    href: item.href,
    label: item.href === "/docs/components" ? tNav("components") : tNav("docs"),
  }));

  return (
    <header
      className={`sticky top-0 z-50 h-(--header-height) w-full transition-colors ${isHome ? "bg-transparent backdrop-blur-md" : "border-border/60 border-b bg-background/90 backdrop-blur-md"}`}
    >
      <div className="mx-auto flex h-full items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <MobileNav
            tree={pageTree}
            items={navItems}
            className="flex lg:hidden"
          />

          <Link
            href="/"
            aria-label={siteConfig.name}
            className="group/brand flex min-w-0 items-center gap-2 rounded-lg outline-none transition-opacity hover:opacity-85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg">
              <Image
                src={logoLightSrc}
                alt=""
                width={25}
                height={25}
                className=" object-contain dark:hidden"
                priority
              />
              <Image
                src={logoDarkSrc}
                alt=""
                width={25}
                height={25}
                className="hidden  object-contain dark:block"
                priority
              />
            </span>
            <span className="hidden font-logo text-lg font-normal tracking-tight sm:block">
              <span className="font-bold">matos</span>
              <span className="text-muted-foreground/55">ui</span>
            </span>
          </Link>
          <div className="mx-3 hidden h-8 w-px bg-border lg:block" />
          <MainNav items={navItems} className="hidden lg:flex" />
        </div>
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2 **:data-[slot=separator]:h-4!">
          <CommandMenu tree={pageTree} navItems={navItems} />
          <Separator orientation="vertical" className="ml-2 hidden lg:block" />
          <div className="hidden sm:block">
            <GitHubLink />
          </div>
          <Button
            variant="ghost"
            size="icon"
            nativeButton={false}
            className="hidden text-muted-foreground transition-colors hover:text-[#0A66C2] sm:inline-flex dark:hover:text-[#7ab7ff]"
            render={
              <Link
                href={siteConfig.links.linkedin}
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
              >
                <LinkedIn className="size-4" aria-hidden="true" />
              </Link>
            }
          >
            <LinkedIn className="size-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            nativeButton={false}
            className="hidden text-foreground/80 transition-colors hover:text-foreground sm:inline-flex"
            render={
              <Link
                href={siteConfig.links.twitter}
                target="_blank"
                rel="noreferrer"
                aria-label="X (Twitter)"
              >
                <XformerlyTwitter className="size-4" aria-hidden="true" />
              </Link>
            }
          >
            <XformerlyTwitter className="size-4" aria-hidden="true" />
          </Button>
          <Separator orientation="vertical" className="hidden 3xl:flex" />
          <ModeSwitcher />
        </div>
      </div>
    </header>
  );
}
