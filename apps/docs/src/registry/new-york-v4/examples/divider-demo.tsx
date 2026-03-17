import { Divider } from "@/registry/new-york-v4/ui/divider";

export default function DividerDemo() {
  return (
    <div className="space-y-6">
      <div className="flex h-24 items-center gap-4">
        Item
        <Divider orientation="vertical" />
        Item
        <Divider orientation="vertical" variant="dashed" />
        Item
      </div>
    </div>
  );
}
