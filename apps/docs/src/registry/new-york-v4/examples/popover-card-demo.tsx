"use client";

import {
  Calendar,
  Download,
  FileText,
  MapPin,
  Star,
  UserPlus,
} from "lucide-react";

import {
  PopoverCard,
  PopoverCardBody,
  PopoverCardContent,
  PopoverCardDescription,
  PopoverCardFooter,
  PopoverCardHeader,
  PopoverCardItem,
  PopoverCardTitle,
  PopoverCardTrigger,
} from "@/registry/new-york-v4/ui/popover-card";

export default function PopoverCardDemo() {
  return (
    <div className="flex min-h-52 w-full max-w-md flex-col items-center justify-center gap-10">
      <p className="text-center text-muted-foreground text-sm leading-relaxed">
        Reviewed by{" "}
        <PopoverCard>
          <PopoverCardTrigger underline className="font-medium text-foreground">
            @sofia
          </PopoverCardTrigger>
          <PopoverCardContent side="top">
            <PopoverCardHeader>
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-chart-1/30 to-chart-4/30 font-semibold text-foreground text-sm ring-1 ring-border">
                SR
              </span>
              <div className="min-w-0">
                <PopoverCardTitle>Sofia Ramos</PopoverCardTitle>
                <PopoverCardDescription>
                  Lead Product Designer
                </PopoverCardDescription>
              </div>
            </PopoverCardHeader>
            <PopoverCardBody>
              Crafting the design system and obsessing over micro-interactions.
            </PopoverCardBody>
            <PopoverCardItem className="flex flex-wrap gap-x-4 gap-y-1.5 text-muted-foreground text-xs">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5" aria-hidden="true" />
                Lisbon, PT
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-3.5" aria-hidden="true" />
                Joined 2021
              </span>
            </PopoverCardItem>
            <PopoverCardFooter>
              <button
                type="button"
                className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary font-medium text-primary-foreground text-xs shadow-xs transition-[transform,background-color] duration-200 hover:bg-primary/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <UserPlus className="size-3.5" aria-hidden="true" />
                Follow
              </button>
              <button
                type="button"
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 font-medium text-foreground text-xs transition-colors duration-200 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Message
              </button>
            </PopoverCardFooter>
          </PopoverCardContent>
        </PopoverCard>{" "}
        and attached{" "}
        <PopoverCard>
          <PopoverCardTrigger
            render={
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-2 py-0.5 font-medium text-foreground text-xs"
              />
            }
          >
            <FileText className="size-3.5" aria-hidden="true" />
            report.pdf
          </PopoverCardTrigger>
          <PopoverCardContent size="sm">
            <PopoverCardHeader>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive ring-1 ring-destructive/20">
                <FileText className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <PopoverCardTitle className="truncate">
                  report.pdf
                </PopoverCardTitle>
                <PopoverCardDescription>
                  2.4 MB · Updated today
                </PopoverCardDescription>
              </div>
            </PopoverCardHeader>
            <PopoverCardItem className="flex items-center gap-1.5 text-muted-foreground text-xs">
              <Star
                className="size-3.5 fill-chart-4 text-chart-4"
                aria-hidden="true"
              />
              Shared with 4 people
            </PopoverCardItem>
            <PopoverCardFooter>
              <button
                type="button"
                className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-background font-medium text-foreground text-xs transition-[transform,background-color] duration-200 hover:bg-muted/60 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Download className="size-3.5" aria-hidden="true" />
                Download
              </button>
            </PopoverCardFooter>
          </PopoverCardContent>
        </PopoverCard>{" "}
        to the thread.
      </p>
    </div>
  );
}
