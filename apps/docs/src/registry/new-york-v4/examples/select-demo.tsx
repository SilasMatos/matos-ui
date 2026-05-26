"use client";

import { BriefcaseBusiness, Code2, Palette } from "lucide-react";
import { useState } from "react";

import { Select, type SelectOption } from "@/registry/new-york-v4/ui/select";

const roles: SelectOption[] = [
  {
    value: "design",
    label: "Product Designer",
    description: "Flows, prototypes and design systems.",
    icon: <Palette className="size-4" />,
  },
  {
    value: "engineering",
    label: "Frontend Engineer",
    description: "Interfaces and product architecture.",
    icon: <Code2 className="size-4" />,
  },
  {
    value: "lead",
    label: "Product Lead",
    description: "Strategy and delivery alignment.",
    icon: <BriefcaseBusiness className="size-4" />,
  },
];

export default function SelectDemo() {
  const [role, setRole] = useState<string | null>(null);

  return (
    <div className="mx-auto w-full max-w-sm">
      <Select
        label="Primary role"
        options={roles}
        placeholder="Choose your role"
        value={role}
        onValueChange={(nextValue) => setRole(nextValue)}
        description="Choose the role closest to your work."
      />
    </div>
  );
}
