"use client";

import {
  CalendarDays,
  Check,
  CircleDashed,
  Clock,
  Download,
  FileText,
  Hash,
  Mail,
  MapPin,
  MoreHorizontal,
  Share2,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/registry/new-york-v4/ui/button";
import {
  DetailPanel,
  DetailPanelAttachment,
  DetailPanelAttachments,
  DetailPanelContent,
  DetailPanelFooter,
  DetailPanelFooterAction,
  DetailPanelHeader,
  DetailPanelHighlight,
  DetailPanelNote,
  DetailPanelRow,
  DetailPanelRows,
  DetailPanelSeparator,
} from "@/registry/new-york-v4/ui/detail-panel";

export default function DetailPanelDemo() {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex flex-col items-start gap-4">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Hide panel" : "Show panel"}
      </Button>

      <DetailPanel open={open} onClose={() => setOpen(false)}>
        <DetailPanelHeader>Registration details</DetailPanelHeader>

        <DetailPanelContent>
          <DetailPanelHighlight
            label="Session"
            primary="Design"
            secondary=" Systems"
          />

          <DetailPanelSeparator />

          <DetailPanelRows>
            <DetailPanelRow
              icon={<Hash className="size-3.5" strokeWidth={1.7} />}
              label="Booking code"
              value={
                <span className="font-mono text-[11px] text-muted-foreground">
                  WS-2026-8841
                </span>
              }
            />
            <DetailPanelRow
              icon={<CircleDashed className="size-3.5" strokeWidth={1.7} />}
              label="Format"
              value="In person"
            />
            <DetailPanelRow
              icon={<CircleDashed className="size-3.5" strokeWidth={1.7} />}
              label="Status"
              value={
                <span className="inline-flex items-center gap-1 rounded-full border border-chart-2/40 bg-chart-2/15 px-2 py-0.5 text-[10px] font-medium text-chart-2">
                  <Check className="size-2.5" strokeWidth={2.5} aria-hidden />
                  Confirmed
                </span>
              }
            />
            <DetailPanelRow
              icon={<UserRound className="size-3.5" strokeWidth={1.7} />}
              label="Attendee"
              value={
                <span className="inline-flex items-center gap-1.5">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                    MR
                  </span>
                  <span>Marina Rocha</span>
                </span>
              }
            />
            <DetailPanelRow
              icon={<Mail className="size-3.5" strokeWidth={1.7} />}
              label="E-mail"
              value={
                <span className="inline-flex max-w-[180px] items-center truncate rounded-md border border-border bg-muted/40 px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                  marina.rocha@example.com
                </span>
              }
            />
            <DetailPanelRow
              icon={<MapPin className="size-3.5" strokeWidth={1.7} />}
              label="Location"
              value="Main Auditorium"
            />
            <DetailPanelRow
              icon={<CalendarDays className="size-3.5" strokeWidth={1.7} />}
              label="Date"
              value={
                <span className="inline-flex items-center gap-1.5">
                  <span>18 mar 2026, 14:00</span>
                  <span className="rounded border border-border bg-muted/50 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
                    BRT
                  </span>
                </span>
              }
            />
            <DetailPanelRow
              icon={<Clock className="size-3.5" strokeWidth={1.7} />}
              label="Duration"
              value="3 h"
            />
          </DetailPanelRows>

          <DetailPanelNote label="Notes">
            QR access at accreditation. Arrive 20 minutes early for check-in.
          </DetailPanelNote>

          <DetailPanelAttachments>
            <DetailPanelAttachment
              name="workshop-program.pdf"
              meta="128 KB"
              icon={<FileText className="size-7 text-muted-foreground" />}
              onMenuClick={() => {}}
            />
          </DetailPanelAttachments>
        </DetailPanelContent>

        <DetailPanelFooter>
          <DetailPanelFooterAction
            ariaLabel="More options"
            icon={<MoreHorizontal className="size-4" strokeWidth={1.8} />}
          />
          <DetailPanelFooterAction
            ariaLabel="Share"
            icon={<Share2 className="size-4" strokeWidth={1.8} />}
          />
          <DetailPanelFooterAction
            ariaLabel="Download"
            icon={<Download className="size-4" strokeWidth={1.8} />}
          />
        </DetailPanelFooter>
      </DetailPanel>
    </div>
  );
}
