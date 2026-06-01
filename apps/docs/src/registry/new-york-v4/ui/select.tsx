"use client";

import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { cva, type VariantProps } from "class-variance-authority";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { type ReactNode, useId } from "react";

import { cn } from "@/lib/utils";
import {
  Field,
  FieldLabel,
  FieldMessage,
} from "@/registry/new-york-v4/ui/field";

export const selectTriggerVariants = cva(
  [
    "not-prose group/select-trigger flex h-9 w-full items-center justify-between gap-2 rounded-xl border border-border bg-background px-3 text-left text-sm text-foreground shadow-xs",
    "transition-[background-color,border-color,box-shadow,transform] duration-300 ease-out",
    "hover:border-border/80 focus-visible:-translate-y-px focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25",
    "data-popup-open:-translate-y-px data-popup-open:border-ring data-popup-open:ring-2 data-popup-open:ring-ring/20 data-placeholder:text-muted-foreground",
    "data-[invalid=true]:border-destructive data-[invalid=true]:bg-destructive/10 data-[invalid=true]:focus-visible:border-destructive data-[invalid=true]:focus-visible:ring-destructive/20",
    "data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:bg-muted/40 data-disabled:opacity-60",
  ],
  {
    variants: {
      variant: {
        inset: "bg-background",
        muted: "bg-muted/40 shadow-none data-popup-open:bg-background",
        ghost:
          "border-transparent bg-transparent shadow-none hover:bg-muted/40",
      },
      selectSize: {
        sm: "h-8 rounded-lg px-2.5 text-xs",
        md: "h-9 px-3",
        lg: "h-10 px-3.5",
      },
    },
    defaultVariants: {
      variant: "inset",
      selectSize: "md",
    },
  },
);

export const selectPopupVariants = cva(
  [
    "not-prose min-w-(--anchor-width) max-w-(--available-width) overflow-hidden rounded-xl border border-border bg-background/95 p-1 shadow-xl backdrop-blur-xl outline-none will-change-[opacity,transform,filter]",
    "origin-(--transform-origin) transition-[opacity,transform,filter] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
    "data-starting-style:translate-y-[-6px] data-starting-style:scale-[0.975] data-starting-style:opacity-0 data-starting-style:blur-[3px]",
    "data-ending-style:translate-y-[-3px] data-ending-style:scale-[0.99] data-ending-style:opacity-0 data-ending-style:blur-[1px] data-ending-style:duration-[180ms] data-ending-style:ease-in",
  ],
  {
    variants: {
      density: {
        compact: "p-1",
        default: "p-1.5",
      },
    },
    defaultVariants: {
      density: "default",
    },
  },
);

export type SelectOption = {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  searchText?: string;
};

export type SelectProps = Omit<
  ComboboxPrimitive.Root.Props<string>,
  "children" | "filter" | "items" | "itemToStringLabel" | "itemToStringValue"
> &
  VariantProps<typeof selectTriggerVariants> &
  VariantProps<typeof selectPopupVariants> & {
    options: readonly SelectOption[];
    label?: ReactNode;
    description?: ReactNode;
    error?: ReactNode;
    placeholder?: ReactNode;
    searchPlaceholder?: string;
    emptyMessage?: ReactNode;
    className?: string;
    triggerClassName?: string;
    popupClassName?: string;
    reserveMessageSpace?: boolean;
    "aria-invalid"?: boolean | "true" | "false";
    "data-invalid"?: boolean;
  };

export function Select({
  id,
  options,
  label,
  description,
  error,
  placeholder = "Select an option",
  searchPlaceholder = "Search options...",
  emptyMessage = "No options found.",
  className,
  triggerClassName,
  popupClassName,
  variant = "inset",
  selectSize = "md",
  density = "default",
  reserveMessageSpace = true,
  required,
  disabled,
  "aria-invalid": ariaInvalid,
  "data-invalid": dataInvalid,
  ...props
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const invalid =
    Boolean(error) ||
    ariaInvalid === true ||
    ariaInvalid === "true" ||
    Boolean(dataInvalid);
  const messageId = description || error ? `${selectId}-message` : undefined;

  function getOptionText(value: string) {
    const option = options.find((current) => current.value === value);

    return option && typeof option.label === "string" ? option.label : value;
  }

  function matchesOption(value: string, query: string) {
    const option = options.find((current) => current.value === value);
    const searchableText = [
      option?.searchText,
      getOptionText(value),
      typeof option?.description === "string" ? option.description : undefined,
    ]
      .filter(Boolean)
      .join(" ");

    return searchableText
      .toLocaleLowerCase()
      .includes(query.toLocaleLowerCase());
  }

  return (
    <Field
      data-slot="select"
      className={className}
      invalid={invalid}
      disabled={disabled}
    >
      {label ? (
        <FieldLabel htmlFor={selectId} required={required}>
          {label}
        </FieldLabel>
      ) : null}
      <ComboboxPrimitive.Root
        id={selectId}
        items={options.map((option) => option.value)}
        itemToStringLabel={getOptionText}
        itemToStringValue={(value) => value}
        filter={matchesOption}
        autoHighlight
        required={required}
        disabled={disabled}
        {...props}
      >
        <ComboboxPrimitive.Trigger
          data-slot="select-trigger"
          data-invalid={invalid || undefined}
          aria-invalid={invalid || undefined}
          aria-describedby={messageId || undefined}
          className={cn(
            selectTriggerVariants({ variant, selectSize }),
            triggerClassName,
          )}
        >
          <ComboboxPrimitive.Value placeholder={placeholder}>
            {(selectedValue) => {
              const option = options.find(
                (current) => current.value === selectedValue,
              );

              return option ? (
                <span className="flex min-w-0 items-center gap-2">
                  {option.icon ? (
                    <span
                      className="shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    >
                      {option.icon}
                    </span>
                  ) : null}
                  <span className="truncate">{option.label}</span>
                </span>
              ) : (
                placeholder
              );
            }}
          </ComboboxPrimitive.Value>
          <ComboboxPrimitive.Icon className="ml-auto shrink-0 text-muted-foreground transition-transform duration-250 ease-[cubic-bezier(0.2,0,0,1)] group-data-popup-open/select-trigger:rotate-180">
            <ChevronsUpDown className="size-4" aria-hidden="true" />
          </ComboboxPrimitive.Icon>
        </ComboboxPrimitive.Trigger>
        <ComboboxPrimitive.Portal>
          <ComboboxPrimitive.Positioner
            sideOffset={6}
            align="start"
            className="z-50 outline-none"
          >
            <ComboboxPrimitive.Popup
              data-slot="select-popup"
              className={cn(selectPopupVariants({ density }), popupClassName)}
            >
              <div className="relative mb-1 border-b border-border/70 pb-1">
                <Search
                  className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <ComboboxPrimitive.Input
                  data-slot="select-input"
                  aria-label="Search options"
                  placeholder={searchPlaceholder}
                  className="h-8 w-full rounded-lg bg-transparent pr-2.5 pl-8 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:bg-muted/40"
                />
              </div>
              <ComboboxPrimitive.Empty className="px-2.5 py-4 text-center text-xs text-muted-foreground empty:hidden">
                {emptyMessage}
              </ComboboxPrimitive.Empty>
              <ComboboxPrimitive.List className="max-h-72 overflow-x-hidden overflow-y-auto outline-none">
                {options.map((option) => (
                  <ComboboxPrimitive.Item
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    data-slot="select-item"
                    className={cn(
                      "group/select-item relative flex cursor-default items-start gap-2 rounded-lg px-2.5 py-2 text-sm text-foreground outline-none",
                      "transition-[background-color,box-shadow] duration-150 ease-out data-highlighted:bg-muted/70 data-highlighted:shadow-xs",
                      "data-disabled:pointer-events-none data-disabled:opacity-45",
                    )}
                  >
                    {option.icon ? (
                      <span
                        className="mt-0.5 shrink-0 text-muted-foreground transition-transform duration-150 ease-out group-data-highlighted/select-item:scale-105"
                        aria-hidden="true"
                      >
                        {option.icon}
                      </span>
                    ) : null}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">
                        {option.label}
                      </span>
                      {option.description ? (
                        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                          {option.description}
                        </span>
                      ) : null}
                    </span>
                    <ComboboxPrimitive.ItemIndicator className="mt-0.5 flex size-4 shrink-0 items-center justify-center text-foreground transition-[opacity,transform] duration-200 ease-out data-starting-style:scale-75 data-starting-style:opacity-0">
                      <Check className="size-3.5" aria-hidden="true" />
                    </ComboboxPrimitive.ItemIndicator>
                  </ComboboxPrimitive.Item>
                ))}
              </ComboboxPrimitive.List>
            </ComboboxPrimitive.Popup>
          </ComboboxPrimitive.Positioner>
        </ComboboxPrimitive.Portal>
      </ComboboxPrimitive.Root>
      <FieldMessage
        id={messageId}
        description={description}
        error={error}
        reserveSpace={reserveMessageSpace}
      />
    </Field>
  );
}
