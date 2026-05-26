"use client";

import { AtSign } from "lucide-react";

import { InputGroup, InputGroupAddon } from "@/registry/new-york-v4/ui/field";
import { FormGrid } from "@/registry/new-york-v4/ui/form-grid";
import { FormSection } from "@/registry/new-york-v4/ui/form-section";
import { Input, InputField } from "@/registry/new-york-v4/ui/input";

export default function InputDemo() {
  return (
    <FormSection
      size="compact"
      title="Profile details"
      description="Compact inset inputs with calm feedback states."
      className="mx-auto w-full max-w-2xl"
    >
      <FormGrid>
        <InputField
          label="Email"
          placeholder="hello@studio.com"
          description="Used for workspace notifications."
        />
        <InputField
          label="Workspace URL"
          state="success"
          defaultValue="studio-matos"
          success="Available to claim."
        />
        <InputField
          label="Contact email"
          defaultValue="invalid-address"
          error="Enter a valid email address."
        />
        <InputField
          label="Syncing account"
          state="loading"
          defaultValue="Checking domain..."
          disabled
        />
      </FormGrid>
      <div className="mt-4 grid gap-1.5">
        <span className="text-xs font-medium text-foreground">Input group</span>
        <InputGroup>
          <InputGroupAddon>
            <AtSign className="size-3.5" aria-hidden="true" />
          </InputGroupAddon>
          <Input variant="ghost" placeholder="username" aria-label="Username" />
          <InputGroupAddon>.matos.app</InputGroupAddon>
        </InputGroup>
      </div>
    </FormSection>
  );
}
