"use client";

import { useState } from "react";
import {
  StackedDialog,
  StackedDialogClose,
  StackedDialogContent,
  StackedDialogDescription,
  StackedDialogFooter,
  StackedDialogHeader,
  StackedDialogTitle,
  StackedDialogTrigger,
} from "@/registry/new-york-v4/ui/stacked-dialog";

export default function StackedDialogDemo() {
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <StackedDialog open={editOpen} onOpenChange={setEditOpen}>
      <StackedDialogTrigger className="inline-flex h-9 w-fit items-center justify-center rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground shadow-xs outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
        Edit item
      </StackedDialogTrigger>

      <StackedDialogContent>
        <StackedDialogHeader>
          <StackedDialogTitle>Edit item</StackedDialogTitle>
          <StackedDialogDescription>
            Update the details below, or delete the item entirely.
          </StackedDialogDescription>
        </StackedDialogHeader>

        <div className="flex flex-col gap-3 py-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs font-medium text-muted-foreground">
              Name
            </span>
            <input
              type="text"
              defaultValue="Q3 revenue report"
              className="h-9 rounded-lg bg-muted/50 px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
        </div>

        <StackedDialogFooter className="justify-between">
          <StackedDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <StackedDialogTrigger className="inline-flex h-8 items-center justify-center rounded-lg px-3 text-xs font-medium text-destructive outline-none transition-colors hover:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-ring">
              Delete
            </StackedDialogTrigger>

            <StackedDialogContent variant="danger">
              <StackedDialogHeader>
                <StackedDialogTitle>Delete this item?</StackedDialogTitle>
                <StackedDialogDescription>
                  This can&apos;t be undone. The report and its history will be
                  permanently removed.
                </StackedDialogDescription>
              </StackedDialogHeader>
              <StackedDialogFooter>
                <StackedDialogClose className="inline-flex h-8 items-center justify-center rounded-lg px-3 text-xs font-medium text-muted-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
                  Cancel
                </StackedDialogClose>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmOpen(false);
                    setEditOpen(false);
                  }}
                  className="inline-flex h-8 items-center justify-center rounded-lg bg-destructive px-3 text-xs font-medium text-white outline-none transition-colors hover:bg-destructive/90 focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Delete
                </button>
              </StackedDialogFooter>
            </StackedDialogContent>
          </StackedDialog>

          <div className="flex items-center gap-2">
            <StackedDialogClose className="inline-flex h-8 items-center justify-center rounded-lg px-3 text-xs font-medium text-muted-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
              Cancel
            </StackedDialogClose>
            <button
              type="button"
              onClick={() => setEditOpen(false)}
              className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring"
            >
              Save
            </button>
          </div>
        </StackedDialogFooter>
      </StackedDialogContent>
    </StackedDialog>
  );
}
