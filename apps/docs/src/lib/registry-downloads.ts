import { createHash } from "node:crypto";
import postgres from "postgres";

type DownloadEvent = {
  componentName: string;
  registryPath: string;
  registryItemType: string;
  request: Request;
};

type DownloadClient = ReturnType<typeof postgres>;

type ClientInfo = {
  packageManager: string | null;
  cliName: string | null;
};

declare global {
  // eslint-disable-next-line no-var
  var matosUiDownloadsClient: DownloadClient | undefined;
}

function getDownloadsClient() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return null;
  }

  globalThis.matosUiDownloadsClient ??= postgres(databaseUrl, {
    max: 3,
    idle_timeout: 20,
    connect_timeout: 5,
    prepare: false,
  });

  return globalThis.matosUiDownloadsClient;
}

function getHeader(headers: Headers, name: string) {
  return headers.get(name) || null;
}

function getClientIp(headers: Headers) {
  const forwardedFor = getHeader(headers, "x-forwarded-for");

  return (
    getHeader(headers, "cf-connecting-ip") ??
    getHeader(headers, "x-real-ip") ??
    getHeader(headers, "x-vercel-forwarded-for") ??
    getHeader(headers, "fly-client-ip") ??
    forwardedFor?.split(",")[0]?.trim() ??
    null
  );
}

function hashIp(ip: string | null) {
  if (!ip) {
    return null;
  }

  const salt = process.env.DOWNLOAD_IP_SALT ?? "matos-ui-downloads";

  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

function normalizeCountryCode(value: string | null) {
  const countryCode = value?.trim().toUpperCase();

  if (!countryCode || !/^[A-Z]{2}$/.test(countryCode)) {
    return null;
  }

  return countryCode;
}

function getCountryName(countryCode: string | null) {
  if (!countryCode) {
    return null;
  }

  try {
    return (
      new Intl.DisplayNames(["en"], { type: "region" }).of(countryCode) ?? null
    );
  } catch {
    return null;
  }
}

function getCountryCode(headers: Headers) {
  return normalizeCountryCode(
    getHeader(headers, "x-vercel-ip-country") ??
      getHeader(headers, "cf-ipcountry") ??
      getHeader(headers, "x-country-code"),
  );
}

function getRegion(headers: Headers) {
  return (
    getHeader(headers, "x-vercel-ip-country-region") ??
    getHeader(headers, "x-region") ??
    null
  );
}

function getCity(headers: Headers) {
  return (
    getHeader(headers, "x-vercel-ip-city") ??
    getHeader(headers, "x-city") ??
    null
  );
}

function getEdgeRegion(headers: Headers) {
  return (
    getHeader(headers, "x-vercel-id")?.split("::")[0] ??
    getHeader(headers, "fly-region") ??
    getHeader(headers, "cf-ray")?.split("-")[1] ??
    null
  );
}

function getRequestId(headers: Headers) {
  return (
    getHeader(headers, "x-request-id") ??
    getHeader(headers, "x-vercel-id") ??
    getHeader(headers, "cf-ray") ??
    null
  );
}

function detectClient(userAgent: string | null): ClientInfo {
  const normalizedUserAgent = userAgent?.toLowerCase() ?? "";

  const packageManager = normalizedUserAgent.includes("pnpm")
    ? "pnpm"
    : normalizedUserAgent.includes("yarn")
      ? "yarn"
      : normalizedUserAgent.includes("bun")
        ? "bun"
        : normalizedUserAgent.includes("npm")
          ? "npm"
          : null;

  const cliName = normalizedUserAgent.includes("shadcn")
    ? "shadcn"
    : normalizedUserAgent.includes("curl")
      ? "curl"
      : normalizedUserAgent.includes("wget")
        ? "wget"
        : null;

  return { packageManager, cliName };
}

export async function recordRegistryDownload({
  componentName,
  registryPath,
  registryItemType,
  request,
}: DownloadEvent) {
  const sql = getDownloadsClient();

  if (!sql) {
    return;
  }

  const headers = request.headers;
  const userAgent = getHeader(headers, "user-agent");
  const { packageManager, cliName } = detectClient(userAgent);
  const countryCode = getCountryCode(headers);
  const countryName = getCountryName(countryCode);

  try {
    await sql`
      insert into registry_download_events (
        component_name,
        registry_path,
        registry_item_type,
        package_manager,
        cli_name,
        registry_version,
        source,
        referer,
        user_agent,
        ip_hash,
        country_code,
        country_name,
        region,
        city,
        edge_region,
        request_id,
        metadata
      )
      values (
        ${componentName},
        ${registryPath},
        ${registryItemType},
        ${packageManager},
        ${cliName},
        ${getHeader(headers, "x-matos-ui-registry-version")},
        ${"registry"},
        ${getHeader(headers, "referer")},
        ${userAgent},
        ${hashIp(getClientIp(headers))},
        ${countryCode},
        ${countryName},
        ${getRegion(headers)},
        ${getCity(headers)},
        ${getEdgeRegion(headers)},
        ${getRequestId(headers)},
        ${sql.json({
          accept: getHeader(headers, "accept"),
          host: getHeader(headers, "host"),
        })}
      )
    `;
  } catch (error) {
    console.warn("Failed to record registry download", error);
  }
}
