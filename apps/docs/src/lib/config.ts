import { getSiteUrl } from "@/lib/site-url";

export const siteConfig = {
  name: "Matos UI",
  url: getSiteUrl(),
  description: "Componentes estilizados para shadcn/ui",
  links: {
    github: "https://github.com/silasmatos/matos-ui",
    linkedin: "https://www.linkedin.com/in/silasmatos",
    twitter: "https://x.com/silasmatos_",
  },
  navItems: [{ href: "/docs" }, { href: "/docs/components" }] as const,
};
