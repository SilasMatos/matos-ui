import { Badge } from "@/registry/new-york-v4/ui/badge";

export default function BadgeDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>Default</Badge>

      <Badge variant="secondary">Secondary</Badge>

      <Badge variant="destructive">Destructive</Badge>

      <Badge variant="outline">Outline</Badge>

      <Badge variant="ghost">Ghost</Badge>

      <Badge variant="soft">Soft</Badge>

      <Badge variant="dotted">Dotted</Badge>
    </div>
  );
}
