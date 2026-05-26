"use client";

import { Select as SelectPrimitive } from "@base-ui/react/select";
import { cva, type VariantProps } from "class-variance-authority";
import { Check, ChevronDown } from "lucide-react";
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
    "transition-[background-color,border-color,box-shadow,transform] duration-300 ease-in-out",
    "hover:border-border/80 focus-visible:-translate-y-px focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25",
    "data-popup-open:border-ring data-popup-open:ring-2 data-popup-open:ring-ring/20 data-placeholder:text-muted-foreground",
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
    "not-prose min-w-(--anchor-width) max-w-(--available-width) overflow-hidden rounded-xl border border-border bg-background/95 p-1 shadow-lg backdrop-blur-xl outline-none",
    "origin-(--transform-origin) transition-[opacity,transform,filter] duration-300 ease-in-out",
    "data-starting-style:scale-[0.985] data-starting-style:opacity-0 data-starting-style:blur-[4px]",
    "data-ending-style:scale-[0.985] data-ending-style:opacity-0 data-ending-style:blur-[3px]",
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
};

export type SelectProps = Omit<
  SelectPrimitive.Root.Props<string>,
  "children" | "items"
> &
  VariantProps<typeof selectTriggerVariants> &
  VariantProps<typeof selectPopupVariants> & {
    options: readonly SelectOption[];
    label?: ReactNode;
    description?: ReactNode;
    error?: ReactNode;
    placeholder?: ReactNode;
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
      <SelectPrimitive.Root
        id={selectId}
        items={options.map((option) => ({
          value: option.value,
          label: option.label,
        }))}
        required={required}
        disabled={disabled}
        {...props}
      >
        <SelectPrimitive.Trigger
          data-slot="select-trigger"
          data-invalid={invalid || undefined}
          aria-invalid={invalid || undefined}
          aria-describedby={messageId || undefined}
          className={cn(
            selectTriggerVariants({ variant, selectSize }),
            triggerClassName,
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder}>
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
          </SelectPrimitive.Value>
          <SelectPrimitive.Icon className="ml-auto shrink-0 text-muted-foreground transition-transform duration-200 group-data-popup-open/select-trigger:rotate-180">
            <ChevronDown className="size-4" aria-hidden="true" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Positioner
            sideOffset={6}
            align="start"
            alignItemWithTrigger={false}
            className="z-50 outline-none"
          >
            <SelectPrimitive.Popup
              data-slot="select-popup"
              className={cn(selectPopupVariants({ density }), popupClassName)}
            >
              <SelectPrimitive.List className="max-h-72 overflow-y-auto outline-none">
                {options.map((option) => (
                  <SelectPrimitive.Item
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    data-slot="select-item"
                    className={cn(
                      "group/select-item relative flex cursor-default items-start gap-2 rounded-lg px-2.5 py-2 text-sm text-foreground outline-none",
                      "transition-[background-color,transform,box-shadow] duration-200 ease-in-out data-highlighted:bg-muted/60 data-highlighted:shadow-xs data-highlighted:-translate-y-px",
                      "data-disabled:pointer-events-none data-disabled:opacity-45",
                    )}
                  >
                    {option.icon ? (
                      <span
                        className="mt-0.5 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      >
                        {option.icon}
                      </span>
                    ) : null}
                    <span className="min-w-0 flex-1">
                      <SelectPrimitive.ItemText className="truncate font-medium">
                        {option.label}
                      </SelectPrimitive.ItemText>
                      {option.description ? (
                        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                          {option.description}
                        </span>
                      ) : null}
                    </span>
                    <SelectPrimitive.ItemIndicator className="mt-0.5 flex size-4 shrink-0 items-center justify-center text-foreground transition-[opacity,transform] duration-300 ease-in-out data-starting-style:scale-90 data-starting-style:opacity-0">
                      <Check className="size-3.5" aria-hidden="true" />
                    </SelectPrimitive.ItemIndicator>
                  </SelectPrimitive.Item>
                ))}
              </SelectPrimitive.List>
            </SelectPrimitive.Popup>
          </SelectPrimitive.Positioner>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
      <FieldMessage
        id={messageId}
        description={description}
        error={error}
        reserveSpace={reserveMessageSpace}
      />
    </Field>
  );
}
