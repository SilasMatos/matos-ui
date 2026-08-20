import Link from "next/link";
import { Icons } from "@/components/icons";
import { siteConfig } from "@/lib/config";
import { Button } from "@/registry/new-york-v4/ui/button";

export function GitHubLink() {
  return (
    <Button
      nativeButton={false}
      render={
        <Link href={siteConfig.links.github} target="_blank" rel="noreferrer">
          <Icons.gitHub className="size-4" />
        </Link>
      }
      size="icon"
      variant="ghost"
      className="shadow-none"
    />
  );
}
