"use client";

import { MoonStar, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/registry/new-york-v4/ui/button";

export function ModeSwitcher({
  variant = "ghost",
  className,
}: {
  variant?: React.ComponentProps<typeof Button>["variant"];
  className?: React.ComponentProps<typeof Button>["className"];
}) {
  const { setTheme, resolvedTheme } = useTheme();

  const toggleTheme = React.useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  return (
    <Button
      variant={variant}
      size="icon"
      aria-label="Toggle theme"
      className={cn("group/toggle extend-touch-target size-8", className)}
      onClick={toggleTheme}
    >
      {/* Both icons ship; the theme class picks one. No JS branch, no
          hydration mismatch. */}
      <Sun className="size-4 dark:hidden" aria-hidden="true" />
      <MoonStar className="hidden size-4 dark:block" aria-hidden="true" />
    </Button>
  );
}
