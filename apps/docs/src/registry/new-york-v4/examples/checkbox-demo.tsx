"use client";

import { useState } from "react";

import { CheckboxField } from "@/registry/new-york-v4/ui/checkbox";

export default function CheckboxDemo() {
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="mx-auto w-full max-w-sm">
      <CheckboxField
        label="I agree to the workspace terms"
        description="Required before creating an account."
        checked={accepted}
        onCheckedChange={setAccepted}
        error={accepted ? undefined : "Accept the terms to continue."}
        required
      />
    </div>
  );
}
