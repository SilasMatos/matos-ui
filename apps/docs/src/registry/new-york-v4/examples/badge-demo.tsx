import { Badge } from "@/registry/new-york-v4/ui/badge";

export default function BadgeDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>Default</Badge>

      <Badge variant="secondary">Secondary</Badge>

      <Badge variant="destructive">Destructive</Badge>

      <Badge variant="outline">Outline</Badge>

      <Badge variant="ghost">Ghost</Badge>

      <Badge variant="success">Success</Badge>

      <Badge variant="warning">Warning</Badge>

      <Badge variant="info">Info</Badge>

      <Badge variant="purple">Purple</Badge>

      <Badge variant="pink">Pink</Badge>

      <Badge variant="soft">Soft</Badge>

      <Badge variant="outlineSuccess">Outline Success</Badge>

      <Badge variant="outlineWarning">Outline Warning</Badge>

      <Badge variant="outlineInfo">Outline Info</Badge>

      <Badge variant="dotted">Dotted</Badge>

      <Badge variant="dottedSuccess">Dotted Success</Badge>

      <Badge variant="dottedWarning">Dotted Warning</Badge>

      <Badge variant="dottedInfo">Dotted Info</Badge>
    </div>
  );
}
