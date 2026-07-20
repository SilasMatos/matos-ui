import { getSiteUrl } from "@/lib/site-url";

export const siteConfig = {
  name: "Matos UI",
  url: getSiteUrl(),
  description:
    "A premium registry of styled React components for shadcn/ui, built with Tailwind CSS and the Inset UI visual language.",
  links: {
    github: "https://github.com/silasmatos/matos-ui",
    linkedin: "https://www.linkedin.com/in/silas-matos/",
    twitter: "https://x.com/silasmatos_",
  },
  navItems: [
    { href: "/docs", labelKey: "docs" },
    { href: "/docs/components", labelKey: "components" },
    { href: "/charts", labelKey: "charts" },
    { href: "/blocks", labelKey: "blocks" },
  ] as const,
};
