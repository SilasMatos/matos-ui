import { promises as fs } from "node:fs";
import path from "node:path";

import { recordRegistryDownload } from "@/lib/registry-downloads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

type RegistryItem = {
  name?: string;
  type?: string;
};

function isSafePathSegment(segment: string) {
  return /^[a-zA-Z0-9._-]+$/.test(segment);
}

function getRegistryRootCandidates() {
  return [
    path.join(process.cwd(), "public", "r"),
    path.join(process.cwd(), "apps", "docs", "public", "r"),
  ];
}

async function getRegistryFilePath(segments: string[]) {
  if (
    segments.length === 0 ||
    segments.some((segment) => !isSafePathSegment(segment)) ||
    !segments.at(-1)?.endsWith(".json")
  ) {
    return null;
  }

  for (const root of getRegistryRootCandidates()) {
    const filePath = path.resolve(root, ...segments);
    const relativePath = path.relative(root, filePath);

    if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
      continue;
    }

    try {
      const stats = await fs.stat(filePath);

      if (stats.isFile()) {
        return { filePath, registryPath: segments.join("/") };
      }
    } catch {}
  }

  return null;
}

function getFallbackName(registryPath: string) {
  return path.basename(registryPath, ".json");
}

function getDownloadName(item: RegistryItem, registryPath: string) {
  const fallbackName = getFallbackName(registryPath);
  const name = item.name ?? fallbackName;
  const normalizedName = name
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalizedName || fallbackName;
}

export async function GET(request: Request, { params }: RouteContext) {
  const { path: registryPathSegments } = await params;
  const registryFile = await getRegistryFilePath(registryPathSegments);

  if (!registryFile) {
    return Response.json({ error: "Registry item not found" }, { status: 404 });
  }

  const content = await fs.readFile(registryFile.filePath, "utf-8");
  const item = JSON.parse(content) as RegistryItem;
  const componentName = getDownloadName(item, registryFile.registryPath);

  await recordRegistryDownload({
    componentName,
    registryPath: registryFile.registryPath,
    registryItemType: item.type ?? "registry:item",
    request,
  });

  return new Response(content, {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store, max-age=0",
    },
  });
}
