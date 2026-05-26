"use client";

import { useState } from "react";
import { FormSection } from "@/registry/new-york-v4/ui/form-section";
import { PasswordInput } from "@/registry/new-york-v4/ui/password-input";

export default function PasswordInputDemo() {
  const [password, setPassword] = useState("Matos");

  return (
    <FormSection
      size="compact"
      title="Create password"
      description="Requirements respond as the password gets stronger."
      className="mx-auto w-full max-w-md"
    >
      <PasswordInput
        label="Password"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Enter a secure password"
        error={
          password.length > 0 && password.length < 8
            ? "Password is still too short."
            : undefined
        }
      />
    </FormSection>
  );
}
