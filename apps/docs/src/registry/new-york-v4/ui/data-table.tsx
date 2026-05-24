"use client";

import {
  type Column,
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  type Table as TanStackTable,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { ComponentProps } from "react";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

export const dataTableVariants = tv({
  base: "not-prose w-full text-foreground",
});

export type DataTableProps<TData, TValue> = ComponentProps<"div"> &
  VariantProps<typeof dataTableVariants> & {
    data: TData[];
    columns: ColumnDef<TData, TValue>[];
    pageSize?: number;
    totalItems?: number;
    showingLabel?: string;
    loading?: boolean;
    footer?: boolean;
  };

export function DataTable<TData, TValue>({
  data,
  columns,
  pageSize = 7,
  totalItems,
  showingLabel = "SHOWING",
  loading = false,
  footer = true,
  className,
  ...props
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const rows = table.getRowModel().rows;
  const filteredRows = table.getFilteredRowModel().rows.length;
  const finalTotalItems = totalItems ?? filteredRows;
  const currentPage = table.getState().pagination.pageIndex + 1;
  const pageCount = table.getPageCount();

  return (
    <div
      data-slot="data-table"
      className={twMerge(dataTableVariants(), className)}
      {...props}
    >
      <div
        data-slot="data-table-card"
        className="overflow-hidden rounded-[1.35rem] bg-muted/45 p-2 shadow-sm"
      >
        <div
          data-slot="data-table-panel"
          className="overflow-hidden rounded-[1.05rem] border-border/60 bg-background shadow-xs"
        >
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className=" bg-muted/30 hover:bg-muted/30"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      style={{
                        width:
                          header.getSize() !== 150
                            ? header.getSize()
                            : undefined,
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {loading ? (
                <DataTableSkeleton rows={pageSize} columns={columns.length} />
              ) : rows.length ? (
                rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-32 text-center text-muted-foreground"
                  >
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {footer ? (
          <DataTablePagination
            table={table}
            showingLabel={showingLabel}
            currentCount={rows.length}
            totalItems={finalTotalItems}
            currentPage={currentPage}
            pageCount={pageCount}
            loading={loading}
          />
        ) : null}
      </div>
    </div>
  );
}

export function DataTablePagination<TData>({
  table,
  showingLabel,
  currentCount,
  totalItems,
  currentPage,
  pageCount,
  loading,
  className,
}: ComponentProps<"div"> & {
  table: TanStackTable<TData>;
  showingLabel: string;
  currentCount: number;
  totalItems: number;
  currentPage: number;
  pageCount: number;
  loading?: boolean;
}) {
  return (
    <div
      data-slot="data-table-footer"
      className={twMerge(
        "flex min-h-9 flex-col items-stretch gap-2 px-2 pt-2 text-muted-foreground sm:h-9 sm:flex-row sm:items-center sm:justify-between sm:px-3",
        className,
      )}
    >
      <p className="text-center font-mono text-[0.68rem] uppercase tracking-[0.16em] sm:text-left">
        {showingLabel}: <span className="text-foreground">{currentCount}</span>{" "}
        of <span className="text-foreground">{totalItems}</span> items
      </p>

      <div
        data-slot="data-table-pagination"
        className="flex items-center justify-center gap-2 sm:justify-start"
      >
        <button
          type="button"
          aria-label="Previous page"
          disabled={!table.getCanPreviousPage() || loading}
          className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-35"
          onClick={() => table.previousPage()}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </button>

        <span className="min-w-8 text-center font-medium text-xs text-foreground">
          {currentPage}/{pageCount || 1}
        </span>

        <button
          type="button"
          aria-label="Next page"
          disabled={!table.getCanNextPage() || loading}
          className="inline-flex size-6 items-center justify-center rounded-md bg-background text-muted-foreground shadow-xs ring-1 ring-border/70 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-35"
          onClick={() => table.nextPage()}
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: {
  column: Column<TData, TValue>;
  title: string;
  className?: string;
}) {
  if (!column.getCanSort()) {
    return (
      <span
        data-slot="data-table-column-header"
        className={twMerge(
          "inline-flex items-center gap-1 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground",
          className,
        )}
      >
        {title}
      </span>
    );
  }

  const sorted = column.getIsSorted();
  const SortIcon =
    sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ArrowUpDown;

  return (
    <button
      type="button"
      data-slot="data-table-column-header"
      aria-label={`Sort by ${title}`}
      className={twMerge(
        "inline-flex items-center gap-1 rounded-md font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        sorted && "text-foreground",
        className,
      )}
      onClick={column.getToggleSortingHandler()}
    >
      <span>{title}</span>
      <SortIcon className="size-3" aria-hidden="true" />
    </button>
  );
}

export const dataTableStatusBadgeVariants = tv({
  base: "inline-flex h-6 items-center rounded-md px-2 font-medium text-xs",
  variants: {
    status: {
      running: "bg-primary/15 text-primary",
      idle: "bg-muted text-muted-foreground",
      error: "bg-destructive/10 text-destructive",
      scheduled: "bg-muted text-foreground/70",
    },
  },
  defaultVariants: {
    status: "idle",
  },
});

export type DataTableStatusBadgeProps = ComponentProps<"span"> &
  VariantProps<typeof dataTableStatusBadgeVariants>;

export function DataTableStatusBadge({
  status,
  className,
  ...props
}: DataTableStatusBadgeProps) {
  return (
    <span
      data-slot="data-table-status-badge"
      className={twMerge(dataTableStatusBadgeVariants({ status }), className)}
      {...props}
    />
  );
}

export function DataTableConfidence({
  value,
  bars = 10,
  showPercent = true,
  className,
}: ComponentProps<"div"> & {
  value: number;
  bars?: number;
  showPercent?: boolean;
}) {
  const activeBars = Math.round((value / 100) * bars);
  const barItems = Array.from({ length: bars }, (_, item) => item + 1);

  return (
    <div
      data-slot="data-table-confidence"
      className={twMerge("flex items-center gap-3", className)}
    >
      <div className="flex items-center gap-0.5" aria-hidden="true">
        {barItems.map((item) => (
          <span
            key={`confidence-bar-${bars}-${item}`}
            className={twMerge(
              "h-4 w-0.5 rounded-full",
              item <= activeBars ? "bg-foreground" : "bg-muted",
            )}
          />
        ))}
      </div>

      {showPercent ? (
        <span className="font-medium text-xs text-foreground/75">{value}%</span>
      ) : (
        <span className="font-medium text-xs text-foreground/75">{value}</span>
      )}
    </div>
  );
}

export function DataTableTaskCount({
  count,
  className,
  ...props
}: ComponentProps<"button"> & {
  count: number;
}) {
  return (
    <button
      type="button"
      data-slot="data-table-task-count"
      className={twMerge(
        "inline-flex items-center gap-1 rounded-md text-sm text-foreground transition-colors hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    >
      <span>{count}</span>
      <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden />
    </button>
  );
}

export type DataTableAvatarItem = {
  name: string;
  image?: string;
  initials?: string;
};

export function DataTableAvatarStack({
  users,
  max = 3,
  className,
  ...props
}: ComponentProps<"div"> & {
  users: DataTableAvatarItem[];
  max?: number;
}) {
  const visibleUsers = users.slice(0, max);
  const remaining = users.length - visibleUsers.length;

  return (
    <div
      data-slot="data-table-avatar-stack"
      className={twMerge("flex items-center", className)}
      {...props}
    >
      {visibleUsers.map((user) => (
        <span
          key={`${user.name}-${user.image ?? user.initials ?? "avatar"}`}
          title={user.name}
          className="-ml-1 first:ml-0 inline-flex size-7 items-center justify-center overflow-hidden rounded-full bg-muted text-[0.65rem] font-medium text-muted-foreground ring-2 ring-background"
        >
          {user.image ? (
            // biome-ignore lint/performance/noImgElement: registry components must work outside Next.js.
            <img
              src={user.image}
              alt={user.name}
              className="size-full object-cover"
            />
          ) : (
            (user.initials ?? getInitials(user.name))
          )}
        </span>
      ))}

      {remaining > 0 ? (
        <span className="-ml-1 inline-flex size-7 items-center justify-center rounded-full bg-muted text-[0.65rem] font-medium text-muted-foreground ring-2 ring-background">
          +{remaining}
        </span>
      ) : null}
    </div>
  );
}

export function Table({ className, ...props }: ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto overflow-y-hidden [scrollbar-gutter:auto] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/45 [&::-webkit-scrollbar-track]:bg-background"
    >
      <table
        data-slot="table"
        className={twMerge(
          "m-0 w-full min-w-190 caption-bottom border-collapse text-sm",
          className,
        )}
        {...props}
      />
    </div>
  );
}

export function TableHeader({ className, ...props }: ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={twMerge("bg-muted/30", className)}
      {...props}
    />
  );
}

export function TableBody({ className, ...props }: ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={twMerge("bg-background [&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

export function TableRow({ className, ...props }: ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={twMerge(
        "border-b border-border/70 transition-colors hover:bg-muted/25",
        className,
      )}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }: ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={twMerge(
        "h-9 px-4 text-left align-middle font-medium whitespace-nowrap first:pl-5 last:pr-5",
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={twMerge(
        "h-13 px-4 align-middle text-sm text-foreground first:pl-5 last:pr-5",
        className,
      )}
      {...props}
    />
  );
}

export function TableCaption({
  className,
  ...props
}: ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={twMerge("mt-4 text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function DataTableSkeleton({
  rows,
  columns,
}: {
  rows: number;
  columns: number;
}) {
  const rowItems = Array.from({ length: rows }, (_, item) => item + 1);
  const columnItems = Array.from({ length: columns }, (_, item) => item + 1);

  return rowItems.map((rowItem) => (
    <TableRow key={`skeleton-row-${rowItem}`}>
      {columnItems.map((columnItem) => (
        <TableCell key={`skeleton-cell-${rowItem}-${columnItem}`}>
          <span
            className={twMerge(
              "block h-4 animate-pulse rounded-md bg-muted",
              columnItem === 1 ? "w-28" : "w-16",
            )}
          />
        </TableCell>
      ))}
    </TableRow>
  ));
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((item) => item[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
