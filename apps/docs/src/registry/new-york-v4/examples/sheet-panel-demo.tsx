"use client";

import { Check, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

import {
  SheetPanel,
  SheetPanelBody,
  SheetPanelClose,
  SheetPanelContent,
  SheetPanelDescription,
  SheetPanelFooter,
  SheetPanelHeader,
  SheetPanelSection,
  SheetPanelTitle,
  SheetPanelTrigger,
} from "@/registry/new-york-v4/ui/sheet-panel";

const STATUSES = ["Active", "Pending", "Archived", "Draft"];
const SORTS = ["Newest", "Oldest", "Price: high", "Price: low"];

export default function SheetPanelDemo() {
  const [statuses, setStatuses] = useState<string[]>(["Active"]);
  const [sort, setSort] = useState("Newest");
  const [inStock, setInStock] = useState(true);

  function toggleStatus(value: string) {
    setStatuses((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  return (
    <div className="flex min-h-52 w-full items-center justify-center">
      <SheetPanel>
        <SheetPanelTrigger className="inline-flex h-9 items-center gap-2 rounded-xl border border-border bg-background px-4 font-medium text-foreground text-sm shadow-xs transition-[background-color,transform] duration-200 hover:bg-muted/60 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          Filters
        </SheetPanelTrigger>

        <SheetPanelContent side="right" size="md">
          <SheetPanelHeader>
            <SheetPanelTitle>Filters</SheetPanelTitle>
            <SheetPanelDescription>
              Refine the results. Changes apply when you save.
            </SheetPanelDescription>
          </SheetPanelHeader>

          <SheetPanelBody>
            <SheetPanelSection title="Status">
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((status) => {
                  const active = statuses.includes(status);
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => toggleStatus(status)}
                      aria-pressed={active}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-medium text-xs transition-[background-color,border-color,color,transform] duration-200 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground hover:border-border hover:bg-muted/60 hover:text-foreground"
                      }`}
                    >
                      {active ? (
                        <Check className="size-3" aria-hidden="true" />
                      ) : null}
                      {status}
                    </button>
                  );
                })}
              </div>
            </SheetPanelSection>

            <SheetPanelSection title="Sort by">
              <div className="grid grid-cols-2 gap-2">
                {SORTS.map((option) => {
                  const active = sort === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSort(option)}
                      aria-pressed={active}
                      className={`rounded-xl border px-3 py-2 text-left font-medium text-sm transition-[background-color,border-color,transform] duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        active
                          ? "border-ring bg-muted/60 text-foreground ring-2 ring-ring/25"
                          : "border-border bg-background text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </SheetPanelSection>

            <SheetPanelSection title="Availability">
              <button
                type="button"
                onClick={() => setInStock((current) => !current)}
                aria-pressed={inStock}
                className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-left transition-colors duration-200 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex flex-col">
                  <span className="font-medium text-foreground text-sm">
                    In stock only
                  </span>
                  <span className="text-muted-foreground text-xs">
                    Hide sold-out items
                  </span>
                </span>
                <span
                  className={`relative h-6 w-10 shrink-0 rounded-full transition-colors duration-300 ${
                    inStock ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 size-5 rounded-full bg-background shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.32,1.36,0.5,1)] ${
                      inStock ? "translate-x-[1.125rem]" : "translate-x-0.5"
                    }`}
                  />
                </span>
              </button>
            </SheetPanelSection>
          </SheetPanelBody>

          <SheetPanelFooter>
            <SheetPanelClose className="inline-flex h-9 items-center justify-center rounded-xl border border-border bg-background px-4 font-medium text-foreground text-sm transition-colors duration-200 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              Reset
            </SheetPanelClose>
            <SheetPanelClose className="inline-flex h-9 items-center justify-center rounded-xl bg-primary px-4 font-medium text-primary-foreground text-sm shadow-xs transition-[background-color,transform] duration-200 hover:bg-primary/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              Apply filters
            </SheetPanelClose>
          </SheetPanelFooter>
        </SheetPanelContent>
      </SheetPanel>
    </div>
  );
}
