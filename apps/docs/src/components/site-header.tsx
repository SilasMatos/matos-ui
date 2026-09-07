"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import logoLightSrc from "@/assets/logo-black.png";
import logoDarkSrc from "@/assets/logo-white.png";
import { CommandMenu } from "@/components/command-menu";
import { CustomizeMenu } from "@/components/customize-menu";
import { GitHubLink } from "@/components/github-link";
import { LinkedIn } from "@/components/icons/linkedin";
import { MainNav } from "@/components/main-nav";
import { MobileNav } from "@/components/mobile-nav";
import { ModeSwitcher } from "@/components/mode-switcher";
import { Link, usePathname } from "@/i18n/navigation";
import { siteConfig } from "@/lib/config";
import type { DocsPageTree } from "@/lib/page-tree";
import { cn } from "@/lib/utils";
import { Button } from "@/registry/new-york-v4/ui/button";
import { Separator } from "@/registry/new-york-v4/ui/separator";
import { XformerlyTwitter } from "@/registry/new-york-v4/ui/x-icon";

export function SiteHeader({ pageTree }: { pageTree: DocsPageTree }) {
  const pathname = usePathname();
  const tNav = useTranslations("nav");
  const isHome = pathname === "/";

  // Frosted-glass once the page leaves the very top. Passive listener + a cheap
  // boolean flip, so it never fights the scroll thread.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItems = siteConfig.navItems.map((item) => ({
    href: item.href,
    label: tNav(item.labelKey),
  }));

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-[background-color,backdrop-filter,border-color,box-shadow] duration-moderate ease-spring",
        isHome ? "h-11" : "h-(--header-height)",
        scrolled
          ? "border-border/60 border-b bg-background/60 shadow-[0_1px_0_0_var(--color-border)] backdrop-blur-xl backdrop-saturate-150"
          : isHome
            ? "border-transparent bg-transparent"
            : "border-border/60 border-b bg-background/90 backdrop-blur-md",
      )}
    >
      <div
        className={`mx-auto flex h-full max-w-[1600px] items-center justify-between gap-3 ${isHome ? "px-3 sm:px-4" : "px-4 sm:px-6"}`}
      >
        <div
          className={`flex min-w-0 items-center ${isHome ? "gap-1.5" : "gap-2"}`}
        >
          <MobileNav
            tree={pageTree}
            items={navItems}
            className="flex lg:hidden"
          />

          <Link
            href="/"
            aria-label={siteConfig.name}
            className="flex min-w-0 items-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg">
              <Image
                src={logoLightSrc}
                alt=""
                width={20}
                height={20}
                className=" object-contain dark:hidden"
                priority
              />
              <Image
                src={logoDarkSrc}
                alt=""
                width={20}
                height={20}
                className="hidden  object-contain dark:block"
                priority
              />
            </span>
            <span className="hidden font-logo text-base font-normal tracking-tight sm:block">
              <span className="font-bold">matos</span>
              <span className="text-muted-foreground/55">ui</span>
            </span>
            <span className="hidden rounded-full border ml-1.5 border-border bg-muted px-1.5 py-0.5 font-medium text-[10px] text-muted-foreground leading-none tracking-normal sm:inline-flex">
              beta
            </span>
          </Link>
          <div
            className={`${isHome ? "mx-2" : "mx-2.5"} hidden h-4 w-px bg-border lg:block`}
          />
          <MainNav items={navItems} className="hidden lg:flex" />
        </div>
        <div
          className={`flex min-w-0 items-center ${isHome ? "gap-0 sm:gap-0.5" : "gap-0.5 sm:gap-1"} **:data-[slot=separator]:h-4!`}
        >
          <CommandMenu tree={pageTree} navItems={navItems} />
          <Separator
            orientation="vertical"
            className={`${isHome ? "mx-0.5" : "mx-1"} hidden lg:block`}
          />
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
          <CustomizeMenu />
          <ModeSwitcher />
        </div>
      </div>
    </header>
  );
}
