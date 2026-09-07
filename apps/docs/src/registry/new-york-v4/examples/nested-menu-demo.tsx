"use client";

import {
  NestedMenu,
  NestedMenuContent,
  NestedMenuItem,
  NestedMenuLabel,
  NestedMenuSeparator,
  NestedMenuSub,
  NestedMenuSubContent,
  NestedMenuSubTrigger,
  NestedMenuTrigger,
} from "@/registry/new-york-v4/ui/nested-menu";

export default function NestedMenuDemo() {
  return (
    <div className="flex justify-center py-16">
      <NestedMenu>
        <NestedMenuTrigger className="inline-flex h-9 items-center rounded-lg border border-border bg-background px-3 font-medium text-sm shadow-xs outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring data-popup-open:bg-muted">
          Move to…
        </NestedMenuTrigger>

        <NestedMenuContent>
          <NestedMenuLabel>Destination</NestedMenuLabel>
          <NestedMenuItem>Inbox</NestedMenuItem>

          <NestedMenuSub>
            <NestedMenuSubTrigger>Projects</NestedMenuSubTrigger>
            <NestedMenuSubContent>
              <NestedMenuItem>Website</NestedMenuItem>
              <NestedMenuItem>Mobile app</NestedMenuItem>

              <NestedMenuSub>
                <NestedMenuSubTrigger>2026</NestedMenuSubTrigger>
                <NestedMenuSubContent>
                  <NestedMenuItem>Q1</NestedMenuItem>

                  <NestedMenuSub>
                    <NestedMenuSubTrigger>Q2</NestedMenuSubTrigger>
                    <NestedMenuSubContent>
                      <NestedMenuItem>April</NestedMenuItem>
                      <NestedMenuItem>May</NestedMenuItem>
                      <NestedMenuItem>June</NestedMenuItem>
                    </NestedMenuSubContent>
                  </NestedMenuSub>

                  <NestedMenuItem>Q3</NestedMenuItem>
                  <NestedMenuItem>Q4</NestedMenuItem>
                </NestedMenuSubContent>
              </NestedMenuSub>
            </NestedMenuSubContent>
          </NestedMenuSub>

          <NestedMenuSeparator />
          <NestedMenuItem variant="destructive">Archive instead</NestedMenuItem>
        </NestedMenuContent>
      </NestedMenu>
    </div>
  );
}
