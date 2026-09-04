"use client";

import { Copy, FolderInput, Pencil, Share2, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/registry/new-york-v4/ui/context-menu";
import { Elevated } from "@/registry/new-york-v4/ui/elevated";

export default function ContextMenuDemo() {
  const [starred, setStarred] = useState(true);
  const [lastAction, setLastAction] = useState<string | null>(null);

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <ContextMenu>
        <ContextMenuTrigger className="outline-none">
          <Elevated
            offset={1}
            className="flex h-40 select-none items-center justify-center rounded-xl px-6 text-center text-sm text-muted-foreground"
          >
            Right-click anywhere in this area
            <br />
            (long-press on touch)
          </Elevated>
        </ContextMenuTrigger>

        <ContextMenuContent>
          <ContextMenuLabel>Q3 revenue report</ContextMenuLabel>

          <ContextMenuItem onSelect={() => setLastAction("Renamed")}>
            <Pencil />
            Rename
            <ContextMenuShortcut>F2</ContextMenuShortcut>
          </ContextMenuItem>

          <ContextMenuItem onSelect={() => setLastAction("Duplicated")}>
            <Copy />
            Duplicate
            <ContextMenuShortcut>⌘D</ContextMenuShortcut>
          </ContextMenuItem>

          <ContextMenuCheckboxItem
            checked={starred}
            onCheckedChange={setStarred}
          >
            <Star />
            Starred
          </ContextMenuCheckboxItem>

          <ContextMenuSeparator />

          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <FolderInput />
              Move to
            </ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem
                onSelect={() => setLastAction("Moved to Drafts")}
              >
                Drafts
              </ContextMenuItem>
              <ContextMenuItem
                onSelect={() => setLastAction("Moved to Archive")}
              >
                Archive
              </ContextMenuItem>
              <ContextMenuItem
                onSelect={() => setLastAction("Moved to Shared")}
              >
                Shared with team
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>

          <ContextMenuItem onSelect={() => setLastAction("Share link copied")}>
            <Share2 />
            Share
          </ContextMenuItem>

          <ContextMenuSeparator />

          <ContextMenuItem
            variant="danger"
            onSelect={() => setLastAction("Deleted")}
          >
            <Trash2 />
            Delete
            <ContextMenuShortcut>⌫</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <p className="text-xs text-muted-foreground">
        {lastAction ? `Last action: ${lastAction}` : "No action yet."}
      </p>
    </div>
  );
}
