import type { Root } from "fumadocs-core/page-tree";

export type DocsPageTree = Root;

export type PageTreeNode = Root["children"][number];
export type PageTreeFolder = Extract<PageTreeNode, { type: "folder" }>;
export type PageTreePage = Extract<PageTreeNode, { type: "page" }>;

export function getAllPagesFromFolder(folder: PageTreeFolder): PageTreePage[] {
  const pages: PageTreePage[] = [];

  for (const child of folder.children) {
    if (child.type === "page") {
      pages.push(child);
    } else if (child.type === "folder") {
      pages.push(...getAllPagesFromFolder(child));
    }
  }

  return pages;
}

export function getPagesFromFolder(folder: PageTreeFolder): PageTreePage[] {
  return getAllPagesFromFolder(folder).filter(
    (page) => !page.url.endsWith("/components"),
  );
}
