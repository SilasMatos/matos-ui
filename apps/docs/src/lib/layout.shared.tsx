import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export const gitConfig = {
  user: "silasmatos",
  repo: "matos-ui",
  branch: "main",
};

export function baseOptions(_locale: string): BaseLayoutProps {
  return {
    nav: {
      enabled: false,
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
