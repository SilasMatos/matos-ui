import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export type MatosUiLogoProps = ComponentProps<"svg"> & {
  showWordmark?: boolean;
};

export function MatosUiLogo({
  className,
  showWordmark = true,
  ...props
}: MatosUiLogoProps) {
  return (
    <svg
      data-slot="matos-ui-logo"
      viewBox="0 0 320 140"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Matos UI"
      className={twMerge("h-auto w-40 text-foreground", className)}
      {...props}
    >
      <path
        d="M38 82V30L92 88L146 30C153 23 164 23 171 30L214 73C228 87 252 77 252 57V30H282V57C282 104 225 128 191 94L150 53L101 105C96 110 87 110 82 105L38 58V82H38Z"
        fill="currentColor"
      />
    </svg>
  );
}
