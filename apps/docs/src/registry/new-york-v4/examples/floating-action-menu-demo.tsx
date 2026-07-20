"use client";

import { ImagePlus, Link2, Pencil, Share2 } from "lucide-react";
import {
  type FloatingActionItem,
  FloatingActionMenu,
} from "@/registry/new-york-v4/ui/floating-action-menu";

const items: FloatingActionItem[] = [
  {
    id: "edit",
    label: "Edit",
    icon: <Pencil className="size-5" aria-hidden="true" />,
  },
  {
    id: "image",
    label: "Image",
    icon: <ImagePlus className="size-5" aria-hidden="true" />,
  },
  {
    id: "link",
    label: "Link",
    icon: <Link2 className="size-5" aria-hidden="true" />,
  },
  {
    id: "share",
    label: "Share",
    icon: <Share2 className="size-5" aria-hidden="true" />,
  },
];

export default function FloatingActionMenuDemo() {
  return (
    <div className="flex min-h-[320px] w-full items-end justify-center pb-6">
      <FloatingActionMenu items={items} />
    </div>
  );
}
