"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import logoSrc from "@/assets/logo.png";
import { CommandMenu } from "@/components/command-menu";
import { GitHubLink } from "@/components/github-link";
import { LocaleSwitcher } from "@/components/locale-switcher";
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
      className={`sticky top-0 z-50 w-full py-2 transition-colors ${isHome ? "bg-transparent backdrop-blur-md" : "bg-background"}`}
    >
      <div className="container-wrapper px-6 3xl:fixed:px-0">
        <div className="flex h-(--header-height) items-center **:data-[slot=separator]:h-4! 3xl:fixed:container">
          <MobileNav
            tree={pageTree}
            items={navItems}
            className="flex lg:hidden"
          />
          <Button
            nativeButton={false}
            variant="ghost"
            size="icon"
            className="hidden size-8 lg:flex"
            render={
              <Link href="/" className="flex items-center">
                <Image
                  src={logoSrc}
                  alt={`${siteConfig.name} logo`}
                  width={32}
                  height={32}
                  className="size-8 object-contain"
                  priority
                />
                <span className="sr-only">{siteConfig.name}</span>
              </Link>
            }
          />
          <Link
            href="/"
            className="font-logo text-lg font-normal tracking-tight"
          >
            <h1>
              {" "}
              <span className="font-bold">matos</span>
              <span className="text-muted-foreground/50">ui</span>
            </h1>
          </Link>
          <div className="h-8 w-px bg-border mx-4"></div>
          <MainNav items={navItems} className="hidden lg:flex" />
          <div className="ml-auto flex items-center gap-2 md:flex-1 md:justify-end">
            <CommandMenu tree={pageTree} navItems={navItems} />
            <LocaleSwitcher />
            <Separator
              orientation="vertical"
              className="ml-2 hidden lg:block"
            />
            <GitHubLink />
            <Button
              variant="ghost"
              size="icon"
              nativeButton={false}
              render={
                <Link
                  href={siteConfig.links.twitter}
                  target="_blank"
                  rel="noreferrer"
                >
                  <XformerlyTwitter className="" />
                </Link>
              }
            >
              <XformerlyTwitter className="" />
            </Button>
            <Separator orientation="vertical" className="hidden 3xl:flex" />
            <ModeSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}
