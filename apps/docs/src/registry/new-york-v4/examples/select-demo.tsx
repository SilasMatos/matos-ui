"use client";

import { BriefcaseBusiness, Code2, Palette, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { FormGrid } from "@/registry/new-york-v4/ui/form-grid";
import { FormSection } from "@/registry/new-york-v4/ui/form-section";
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
    <FormSection
      size="compact"
      title="Team preferences"
      description="Rich options remain quick to scan and keyboard accessible."
      className="mx-auto w-full max-w-2xl"
    >
      <FormGrid>
        <Select
          label="Primary role"
          options={roles}
          placeholder="Choose your role"
          value={role}
          onValueChange={(nextValue) => setRole(nextValue)}
          description="Choose the role closest to your work."
        />
        <Select
          label="Review status"
          options={[
            {
              value: "approved",
              label: "Approved",
              icon: <ShieldCheck className="size-4" />,
            },
          ]}
          error="Select a review status."
          placeholder="Required selection"
        />
        <Select
          label="Disabled"
          options={roles}
          placeholder="Not available"
          disabled
        />
      </FormGrid>
    </FormSection>
  );
}
