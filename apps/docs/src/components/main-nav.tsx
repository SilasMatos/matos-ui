"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/registry/new-york-v4/ui/button";

export function MainNav({
  items,
  className,
  ...props
}: React.ComponentProps<"nav"> & {
  items: { href: string; label: string }[];
}) {
  const pathname = usePathname();

  return (
    <nav className={cn("items-center gap-0", className)} {...props}>
      {items.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/docs" && pathname.startsWith(`${item.href}/`));

        return (
          <Button
            key={item.href}
            variant="ghost"
            size="sm"
            className="px-2"
            nativeButton={false}
            render={
              <Link
                href={item.href}
                data-active={isActive}
                className="relative items-center"
              >
                {item.label}
              </Link>
            }
          />
        );
      })}
    </nav>
  );
}
