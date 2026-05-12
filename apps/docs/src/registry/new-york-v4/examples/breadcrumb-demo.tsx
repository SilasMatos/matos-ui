"use client";

import { Boxes, Code2, FolderGit2, Home, Palette } from "lucide-react";
import { useState } from "react";
import {
  Breadcrumb,
  type BreadcrumbItem,
} from "@/registry/new-york-v4/ui/breadcrumb";

const items: BreadcrumbItem[] = [
  {
    label: "Home",
    href: "#",
    icon: <Home className="size-4" aria-hidden="true" />,
  },
  {
    label: "Workspace",
    href: "#",
    icon: <FolderGit2 className="size-4" aria-hidden="true" />,
  },
  {
    label: "Design System",
    href: "#",
    icon: <Palette className="size-4" aria-hidden="true" />,
    meta: "v4",
  },
  {
    label: "Registry",
    href: "#",
    icon: <Boxes className="size-4" aria-hidden="true" />,
  },
  {
    label: "Breadcrumb",
    icon: <Code2 className="size-4" aria-hidden="true" />,
    meta: "current",
  },
];

export default function BreadcrumbDemo() {
  const [activeIndex, setActiveIndex] = useState(items.length - 1);

  return (
    <div className="flex w-full flex-col items-start gap-5 p-2">
      <Breadcrumb
        items={items}
        activeIndex={activeIndex}
        tone="floating"
        onNavigate={(_, index) => setActiveIndex(index)}
      />

      <Breadcrumb
        items={items}
        activeIndex={activeIndex}
        maxVisible={4}
        size="sm"
        tone="muted"
        onNavigate={(_, index) => setActiveIndex(index)}
      />

      <Breadcrumb
        items={items.slice(0, 4)}
        activeIndex={2}
        size="lg"
        onNavigate={(_, index) => setActiveIndex(index)}
      />
    </div>
  );
}
