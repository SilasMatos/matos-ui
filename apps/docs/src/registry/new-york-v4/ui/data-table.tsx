"use client";

import {
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type RowSelectionState,
  type SortingState,
  type Table as TanStackTable,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronRightIcon,
  GripVertical,
  Inbox,
  Search,
  X,
} from "lucide-react";
import {
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

type MaybeNested<TData> = TData & {
  subRows?: TData[];
  children?: TData[];
};

export type DataTableRowState = "default" | "inactive" | "deleted";

export type DataTableProps<TData, TValue> = ComponentProps<"div"> & {
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
  title?: string;
  description?: string;
  searchKey?: string;
  searchPlaceholder?: string;
  pageSize?: number;
  pageSizeOptions?: number[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  toolbarActions?: ReactNode;
  getRowState?: (row: TData) => DataTableRowState | undefined;
};

function getInferredRowState<TData>(row: TData): DataTableRowState {
  const record = row as Record<string, unknown>;

  if (
    record.deleted === true ||
    record.status === "Deleted" ||
    record.employment === "Deleted"
  ) {
    return "deleted";
  }

  if (
    record.disabled === true ||
    record.inactive === true ||
    record.status === "Inactive" ||
    record.employment === "Inactive"
  ) {
    return "inactive";
  }

  return "default";
}

export function DataTable<TData, TValue>({
  data,
  columns,
  title,
  description,
  searchKey,
  searchPlaceholder = "Search records...",
  pageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
  loading = false,
  emptyTitle,
  emptyDescription,
  toolbarActions,
  getRowState,
  className,
  ...props
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const resolveRowState = useMemo(
    () => (row: TData) => getRowState?.(row) ?? getInferredRowState(row),
    [getRowState],
  );

  const displayColumns = useMemo<ColumnDef<TData, unknown>[]>(
    () => [
      {
        id: "expand",
        size: 44,
        enableHiding: false,
        enableSorting: false,
        header: () => <span className="sr-only">Expand rows</span>,
        cell: ({ row }) => {
          const canExpand = row.getCanExpand();
          const depth = row.depth;

          return (
            <div
              className="flex items-center justify-center gap-1.5"
              style={
                depth
                  ? ({ "--data-table-depth": depth } as CSSProperties)
                  : undefined
              }
            >
              <span
                className="block"
                style={
                  depth
                    ? ({
                        width: "calc(var(--data-table-depth) * 0.875rem)",
                      } as CSSProperties)
                    : undefined
                }
              />
              {canExpand ? (
                <button
                  type="button"
                  aria-label={
                    row.getIsExpanded() ? "Collapse row" : "Expand row"
                  }
                  className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={row.getToggleExpandedHandler()}
                >
                  <ChevronRightIcon
                    className={cn(
                      "size-4 transition-transform duration-200",
                      row.getIsExpanded() && "rotate-90",
                    )}
                    aria-hidden="true"
                  />
                </button>
              ) : depth > 0 ? (
                <span className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground/60">
                  <GripVertical className="size-4" aria-hidden="true" />
                </span>
              ) : (
                <span className="size-7" aria-hidden="true" />
              )}
            </div>
          );
        },
      },
      {
        id: "select",
        size: 44,
        enableHiding: false,
        enableSorting: false,
        header: ({ table }) => (
          <DataTableCheckbox
            aria-label="Select all rows on this page"
            checked={table.getIsAllPageRowsSelected()}
            disabled={table.getRowModel().rows.length === 0}
            indeterminate={table.getIsSomePageRowsSelected()}
            onCheckedChange={(checked) =>
              table.toggleAllPageRowsSelected(checked)
            }
          />
        ),
        cell: ({ row }) => {
          const rowState = resolveRowState(row.original);

          if (row.depth > 0) {
            return <span className="block size-4" aria-hidden="true" />;
          }

          return (
            <DataTableCheckbox
              aria-label={`Select row ${row.id}`}
              checked={row.getIsSelected()}
              disabled={!row.getCanSelect() || rowState !== "default"}
              onCheckedChange={(checked) => row.toggleSelected(checked)}
            />
          );
        },
      },
      ...(columns as ColumnDef<TData, unknown>[]),
    ],
    [columns, resolveRowState],
  );

  const table = useReactTable({
    data,
    columns: displayColumns,
    state: {
      columnFilters,
      expanded,
      rowSelection,
      sorting,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
    enableRowSelection: (row) =>
      row.depth === 0 && resolveRowState(row.original) === "default",
    getSubRows: (row) => {
      const nested = row as MaybeNested<TData>;
      return nested.subRows ?? nested.children;
    },
    onColumnFiltersChange: setColumnFilters,
    onExpandedChange: setExpanded,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  useEffect(() => {
    table.setPageSize(pageSize);
  }, [pageSize, table]);

  const hasToolbar = Boolean(
    title || description || searchKey || toolbarActions,
  );
  const rows = table.getRowModel().rows;
  const visibleColumnCount = table.getAllLeafColumns().length;

  return (
    <div
      data-slot="data-table"
      className={cn("w-full text-foreground", className)}
      {...props}
    >
      <div
        data-slot="data-table-card"
        className={cn(
          "overflow-hidden rounded-[1.25rem] border border-border",
          hasToolbar ? "bg-muted/40" : "bg-background",
        )}
      >
        {hasToolbar ? (
          <DataTableToolbar
            table={table}
            title={title}
            description={description}
            searchKey={searchKey}
            searchPlaceholder={searchPlaceholder}
            toolbarActions={toolbarActions}
          />
        ) : null}

        <div
          data-slot="data-table-panel"
          className={cn(
            hasToolbar
              ? "mx-2 overflow-hidden rounded-xl border border-border bg-background"
              : "overflow-hidden rounded-t-[1.25rem] bg-background",
          )}
        >
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        header.column.id === "select" && "w-11",
                        header.column.id === "expand" && "w-11",
                      )}
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
                <DataTableSkeleton
                  rows={Math.min(pageSize, 5)}
                  columns={visibleColumnCount}
                />
              ) : rows.length ? (
                rows.map((row) => {
                  const rowState = resolveRowState(row.original);

                  return (
                    <TableRow
                      key={row.id}
                      data-selected={row.getIsSelected() ? "" : undefined}
                      data-disabled={
                        rowState === "inactive" || rowState === "deleted"
                          ? ""
                          : undefined
                      }
                      data-deleted={rowState === "deleted" ? "" : undefined}
                      data-depth={row.depth > 0 ? row.depth : undefined}
                      data-subrow={row.depth > 0 ? "" : undefined}
                    >
                      {row.getVisibleCells().map((cell) => {
                        const isControlCell =
                          cell.column.id === "select" ||
                          cell.column.id === "expand";

                        return (
                          <TableCell
                            key={cell.id}
                            className={cn(
                              isControlCell ? "w-11" : "max-w-[260px]",
                            )}
                          >
                            {isControlCell ? (
                              flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )
                            ) : (
                              <div className="min-w-0 truncate">
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext(),
                                )}
                              </div>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={visibleColumnCount} className="h-56">
                    <DataTableEmpty
                      title={emptyTitle}
                      description={emptyDescription}
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <DataTablePagination
          table={table}
          pageSizeOptions={pageSizeOptions}
          loading={loading}
        />
      </div>
    </div>
  );
}

export function DataTableToolbar<TData>({
  table,
  title,
  description,
  searchKey,
  searchPlaceholder,
  toolbarActions,
}: {
  table: TanStackTable<TData>;
  title?: string;
  description?: string;
  searchKey?: string;
  searchPlaceholder?: string;
  toolbarActions?: ReactNode;
}) {
  const searchColumn = searchKey ? table.getColumn(searchKey) : undefined;
  const searchValue = (searchColumn?.getFilterValue() as string) ?? "";

  return (
    <div
      data-slot="data-table-header"
      className="flex flex-col gap-3 px-5 pt-4 pb-3 lg:flex-row lg:items-center lg:justify-between"
    >
      <div className="min-w-0">
        {title ? (
          <h3
            data-slot="data-table-title"
            className="truncate font-semibold text-base text-foreground leading-6"
          >
            {title}
          </h3>
        ) : null}
        {description ? (
          <p
            data-slot="data-table-description"
            className="mt-0.5 max-w-2xl truncate text-muted-foreground text-sm"
          >
            {description}
          </p>
        ) : null}
      </div>

      <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end lg:w-auto">
        {searchKey ? (
          <label
            data-slot="data-table-search"
            className="relative flex h-9 w-full items-center rounded-lg border border-border bg-background text-sm transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30 sm:w-72"
          >
            <Search
              className="ml-3 size-3.5 text-muted-foreground"
              aria-hidden="true"
            />
            <span className="sr-only">{searchPlaceholder}</span>
            <input
              value={searchValue}
              disabled={!searchColumn}
              placeholder={searchPlaceholder}
              className="h-full min-w-0 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"
              onChange={(event) =>
                searchColumn?.setFilterValue(event.target.value)
              }
            />
            {searchValue ? (
              <button
                type="button"
                aria-label="Clear search"
                className="mr-1 inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => searchColumn?.setFilterValue("")}
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            ) : null}
          </label>
        ) : null}
        {toolbarActions}
      </div>
    </div>
  );
}

export function DataTablePagination<TData>({
  table,
  pageSizeOptions,
  loading,
  className,
}: ComponentProps<"div"> & {
  table: TanStackTable<TData>;
  pageSizeOptions: number[];
  loading?: boolean;
}) {
  const pagination = table.getState().pagination;
  const filteredCount = table.getFilteredRowModel().rows.length;
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const first =
    filteredCount === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1;
  const last = Math.min(
    filteredCount,
    (pagination.pageIndex + 1) * pagination.pageSize,
  );

  return (
    <div
      data-slot="data-table-footer"
      className={cn(
        "flex flex-col gap-3 px-5 py-3 text-muted-foreground text-sm sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
        <span className="truncate">
          Showing {first}-{last} of {filteredCount} records
        </span>
        {selectedCount > 0 ? (
          <span className="rounded-full border border-border bg-background px-2 py-0.5 text-xs">
            {selectedCount} selected
          </span>
        ) : null}
      </div>

      <div
        data-slot="data-table-pagination"
        className="flex items-center gap-2"
      >
        <label className="flex items-center gap-2 text-xs">
          <span className="hidden text-muted-foreground sm:inline">
            Rows per page
          </span>
          <select
            aria-label="Rows per page"
            value={pagination.pageSize}
            disabled={loading}
            className="h-8 rounded-md border border-border bg-background px-2 text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50"
            onChange={(event) => table.setPageSize(Number(event.target.value))}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={!table.getCanPreviousPage() || loading}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 font-medium text-foreground text-xs transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          onClick={() => table.previousPage()}
        >
          <ChevronLeft className="size-3.5" aria-hidden="true" />
          Previous
        </button>
        <button
          type="button"
          disabled={!table.getCanNextPage() || loading}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 font-medium text-foreground text-xs transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          onClick={() => table.nextPage()}
        >
          Next
          <ChevronRight className="size-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export function DataTableEmpty({
  title = "No records found",
  description = "Try adjusting your search or filters.",
  className,
}: ComponentProps<"div"> & {
  title?: string;
  description?: string;
}) {
  return (
    <div
      data-slot="data-table-empty"
      className={cn(
        "flex h-full min-h-44 flex-col items-center justify-center px-6 text-center",
        className,
      )}
    >
      <span className="flex size-10 items-center justify-center rounded-lg border border-border bg-muted/40 text-muted-foreground">
        <Inbox className="size-4" aria-hidden="true" />
      </span>
      <p className="mt-3 font-medium text-foreground text-sm">{title}</p>
      <p className="mt-1 max-w-sm text-muted-foreground text-sm">
        {description}
      </p>
    </div>
  );
}

type DataTableBadgeTone =
  | "neutral"
  | "active"
  | "inactive"
  | "finance"
  | "hr"
  | "marketing"
  | "sales"
  | "engineering";

const dataTableBadgeTones: Record<DataTableBadgeTone, string> = {
  neutral:
    "border-border bg-background text-muted-foreground [--badge-dot:var(--color-muted-foreground)]",
  active:
    "border-transparent bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 [--badge-dot:var(--color-emerald-500)]",
  inactive:
    "border-transparent bg-rose-500/10 text-rose-500 dark:text-rose-300 [--badge-dot:var(--color-rose-400)]",
  finance:
    "border-border bg-background text-foreground [--badge-dot:var(--color-emerald-500)]",
  hr: "border-border bg-background text-foreground [--badge-dot:var(--color-amber-500)]",
  marketing:
    "border-border bg-background text-foreground [--badge-dot:var(--color-red-500)]",
  sales:
    "border-border bg-background text-foreground [--badge-dot:var(--color-blue-500)]",
  engineering:
    "border-border bg-background text-foreground [--badge-dot:var(--color-slate-500)]",
};

export function DataTableBadge({
  tone = "neutral",
  dot = true,
  className,
  children,
  ...props
}: ComponentProps<"span"> & {
  tone?: DataTableBadgeTone;
  dot?: boolean;
}) {
  return (
    <span
      data-slot="data-table-badge"
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 font-medium text-xs",
        dataTableBadgeTones[tone],
        className,
      )}
      {...props}
    >
      {dot ? (
        <span
          className="size-2 shrink-0 rounded-full bg-(--badge-dot)"
          aria-hidden="true"
        />
      ) : null}
      <span className="truncate">{children}</span>
    </span>
  );
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  icon,
  className,
}: {
  column: Column<TData, TValue>;
  title: string;
  icon?: ReactNode;
  className?: string;
}) {
  if (!column.getCanSort()) {
    return (
      <span className={cn("inline-flex items-center gap-1.5", className)}>
        {icon ? (
          <span className="text-foreground/75 [&_svg]:size-3.5">{icon}</span>
        ) : null}
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
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md text-left font-medium outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
        sorted ? "text-foreground" : "text-muted-foreground",
        className,
      )}
      onClick={column.getToggleSortingHandler()}
    >
      {icon ? (
        <span className="text-foreground/75 [&_svg]:size-3.5">{icon}</span>
      ) : null}
      <span className="truncate">{title}</span>
      <SortIcon className="size-3.5" aria-hidden="true" />
    </button>
  );
}

function DataTableCheckbox({
  checked,
  indeterminate,
  className,
  onCheckedChange,
  ...props
}: Omit<ComponentProps<"input">, "type" | "checked" | "onChange"> & {
  checked?: boolean;
  indeterminate?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = Boolean(indeterminate && !checked);
    }
  }, [checked, indeterminate]);

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      aria-checked={indeterminate ? "mixed" : checked}
      data-slot="data-table-checkbox"
      className={cn(
        "size-4 rounded-[5px] border border-border accent-primary outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
      onChange={(event) => onCheckedChange?.(event.target.checked)}
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
  const skeletonRows = [
    "loading-row-a",
    "loading-row-b",
    "loading-row-c",
    "loading-row-d",
    "loading-row-e",
  ].slice(0, rows);
  const skeletonColumns = [
    "loading-column-a",
    "loading-column-b",
    "loading-column-c",
    "loading-column-d",
    "loading-column-e",
    "loading-column-f",
    "loading-column-g",
    "loading-column-h",
    "loading-column-i",
    "loading-column-j",
    "loading-column-k",
    "loading-column-l",
  ].slice(0, columns);

  return skeletonRows.map((rowId) => (
    <TableRow key={rowId}>
      {skeletonColumns.map((columnId, columnIndex) => (
        <TableCell key={`${rowId}-${columnId}`}>
          <span
            className={cn(
              "block h-4 animate-pulse rounded-md bg-muted",
              columnIndex < 2 ? "w-4" : "w-full max-w-36",
            )}
          />
        </TableCell>
      ))}
    </TableRow>
  ));
}

export function Table({ className, ...props }: ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn(
          "w-full min-w-[760px] table-fixed caption-bottom border-collapse text-sm",
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
      className={cn("bg-muted/65 [&_tr]:border-b", className)}
      {...props}
    />
  );
}

export function TableBody({ className, ...props }: ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

export function TableFooter({ className, ...props }: ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn("border-t bg-muted/50 font-medium", className)}
      {...props}
    />
  );
}

export function TableRow({ className, ...props }: ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-border/80 border-b transition-colors hover:bg-muted/25 data-[selected]:bg-primary/5 data-[disabled]:text-muted-foreground data-[disabled]:opacity-65 data-[disabled]:bg-[repeating-linear-gradient(45deg,transparent_0px,transparent_20px,rgba(148,163,184,0.09)_20px,rgba(148,163,184,0.09)_40px)] data-[subrow]:bg-[repeating-linear-gradient(45deg,transparent_0px,transparent_20px,rgba(148,163,184,0.08)_20px,rgba(148,163,184,0.08)_40px)] data-[deleted]:opacity-50",
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
      className={cn(
        "h-12 px-4 text-left align-middle font-semibold text-foreground/80 text-sm whitespace-nowrap [&:has([data-slot=data-table-checkbox])]:px-2",
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
      className={cn(
        "h-16 px-4 align-middle text-base [&:has([data-slot=data-table-checkbox])]:px-2",
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
      className={cn("mt-4 text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}
