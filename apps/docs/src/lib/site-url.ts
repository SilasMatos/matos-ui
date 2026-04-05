function normalizeUrl(url: string) {
  return url.replace(/\/+$/, "");
}

function getVercelUrl() {
  const vercelUrl =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;

  if (!vercelUrl) {
    return null;
  }

  const withProtocol = vercelUrl.startsWith("http")
    ? vercelUrl
    : `https://${vercelUrl}`;

  return normalizeUrl(withProtocol);
}

export function getSiteUrl() {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL;

  if (envUrl) {
    return normalizeUrl(envUrl);
  }

  const vercelUrl = getVercelUrl();
  if (vercelUrl) {
    return vercelUrl;
  }

  if (process.env.NODE_ENV === "development") {
    return "http://localhost:4000";
  }

  return "https://matos-ui.com";
}

export function getRegistryBaseUrl() {
  return `${getSiteUrl()}/r`;
}
