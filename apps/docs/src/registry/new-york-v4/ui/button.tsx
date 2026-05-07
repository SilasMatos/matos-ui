"use client";

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center overflow-hidden whitespace-nowrap rounded-lg border border-transparent bg-clip-padding text-sm font-medium outline-none select-none transition-[background-color,border-color,box-shadow,color,opacity,transform] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 data-[loading=true]:cursor-wait data-[loading=true]:opacity-90 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        outline:
          "border-border bg-background shadow-xs hover:border-border/80 hover:bg-muted/70 hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted/70 hover:text-foreground hover:shadow-none dark:hover:bg-muted/50 aria-expanded:bg-muted aria-expanded:text-foreground",
        destructive:
          "border-destructive/20 bg-destructive/10 text-destructive shadow-xs hover:border-destructive/30 hover:bg-destructive/15 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 dark:hover:bg-destructive/30",
        link: "text-primary underline-offset-4 hover:translate-y-0 hover:bg-transparent hover:shadow-none hover:underline active:scale-100",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonProps = ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean;
    loadingText?: ReactNode;
    loadingIcon?: ReactNode;
  };

function Button({
  className,
  variant = "default",
  size = "default",
  loading = false,
  loadingText,
  loadingIcon,
  children,
  disabled,
  "aria-busy": ariaBusy,
  ...props
}: ButtonProps) {
  const isLoading = Boolean(loading);

  return (
    <ButtonPrimitive
      data-slot="button"
      data-loading={isLoading}
      aria-busy={ariaBusy ?? isLoading}
      disabled={disabled || isLoading}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {isLoading ? (
        <>
          {loadingIcon ?? (
            <span
              data-slot="button-loading-icon"
              className="size-4 shrink-0 animate-spin rounded-full border-2 border-current/25 border-t-current"
              aria-hidden="true"
            />
          )}
          <span data-slot="button-loading-label">
            {loadingText ?? children}
          </span>
        </>
      ) : (
        children
      )}
    </ButtonPrimitive>
  );
}

export { Button, buttonVariants };
